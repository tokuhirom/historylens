import { DEFAULT_CONFIG } from './config/default.js';
import { openDatabase } from './db.js';
import type { ActivityEntry, DomainConfig, LogActivityMessage, LogActivityResponse } from './types';
import { categorizePage } from './utils/categorization.js';

console.log('✅ background.ts loaded');

// Merge new default patterns with existing config
function mergeConfigs(existingConfig: DomainConfig, defaultConfig: DomainConfig): DomainConfig {
  const existingUrls = new Set(existingConfig.map((p) => p.pattern));
  const missingPatterns = defaultConfig.filter((p) => !existingUrls.has(p.pattern));
  return [...existingConfig, ...missingPatterns];
}

// Open dashboard when extension icon is clicked
chrome.action.onClicked.addListener((_tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('dashboard.html')
  });
});

// Initial setup
chrome.runtime.onInstalled.addListener(async (details) => {
  const result = await chrome.storage.sync.get('domainConfig');

  if (!result.domainConfig) {
    // First time installation
    await chrome.storage.sync.set({ domainConfig: DEFAULT_CONFIG });
  } else if (details.reason === 'update') {
    // Extension updated - merge new defaults with existing config
    const mergedConfig = mergeConfigs(result.domainConfig, DEFAULT_CONFIG);
    await chrome.storage.sync.set({ domainConfig: mergedConfig });
    console.log('✅ Merged new default patterns with existing configuration');
  }
});

// 🚫 Map and threshold for suppress-recording
const suppressMap = new Map<string, number>();
const SUPPRESS_DURATION_MS = 5000;

// Cleanup old unmatched entries after 7 days
async function cleanupOldEntries() {
  const db = await openDatabase();
  const tx = db.transaction('activity', 'readwrite');
  const store = tx.objectStore('activity');
  const index = store.index('updatedAt');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoffDate = sevenDaysAgo.toISOString();

  const range = IDBKeyRange.upperBound(cutoffDate);
  const request = index.openCursor(range);

  request.onsuccess = (event) => {
    const cursor = (event.target as IDBRequest).result;
    if (!cursor) return;

    const entry = cursor.value;
    // Delete entries with category='unknown' that are older than 7 days
    if (entry.category === 'unknown') {
      cursor.delete();
      console.log(`🗑️ Deleted old unknown entry: ${entry.url}`);
    }
    cursor.continue();
  };
}

// Recategorize all entries in the activity table
async function recategorizeAllEntries() {
  const db = await openDatabase();
  const result = await chrome.storage.sync.get('domainConfig');
  const config: DomainConfig = result.domainConfig || DEFAULT_CONFIG;

  // Get all entries
  const tx = db.transaction('activity', 'readwrite');
  const store = tx.objectStore('activity');

  const getAllReq = store.getAll();
  const allEntries = await new Promise<ActivityEntry[]>((resolve) => {
    getAllReq.onsuccess = () => resolve(getAllReq.result);
  });

  console.log(`📊 Recategorizing ${allEntries.length} entries...`);

  // Update each entry with new category
  for (const entry of allEntries) {
    const { category } = categorizePage(entry.url, config);

    // Update if category changed
    if (entry.category !== category) {
      const updatedEntry = {
        ...entry,
        category
      };

      await new Promise((resolve) => {
        const putReq = store.put(updatedEntry);
        putReq.onsuccess = () => resolve(true);
      });
    }
  }

  console.log('✅ Recategorization complete');
}

// Run cleanup daily
chrome.alarms.create('daily-maintenance', { periodInMinutes: 24 * 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'daily-maintenance') {
    cleanupOldEntries();
  }
});

// Cleanup on startup and merge new default patterns
chrome.runtime.onStartup.addListener(async () => {
  // Merge new default patterns if any
  const result = await chrome.storage.sync.get('domainConfig');
  if (result.domainConfig) {
    const mergedConfig = mergeConfigs(result.domainConfig, DEFAULT_CONFIG);
    // Only update if there are new patterns
    if (mergedConfig.length > result.domainConfig.length) {
      await chrome.storage.sync.set({ domainConfig: mergedConfig });
      console.log('✅ Added new default patterns on startup');
    }
  }

  cleanupOldEntries();
});

// Message listener
chrome.runtime.onMessage.addListener(
  (
    message: LogActivityMessage | { type: 'suppress-recording'; url: string },
    _sender,
    sendResponse: (response: LogActivityResponse) => void
  ): boolean => {
    // ✅ Suppress recording when opened from history
    if (message.type === 'suppress-recording') {
      suppressMap.set(message.url, Date.now());
      console.log('🛑 suppress-recording set for', message.url);
      sendResponse({ status: 'ok' });
      return true;
    }

    // Recategorize all entries
    if (message.type === 'recategorize-all') {
      console.log('🔄 Recategorizing all entries...');
      recategorizeAllEntries()
        .then(() => {
          sendResponse({ status: 'ok' });
        })
        .catch((error) => {
          console.error('Error recategorizing all:', error);
          sendResponse({ status: 'error', error });
        });
      return true;
    }

    if (message.type === 'log-activity') {
      const url = message.entry.url;
      const suppressTime = suppressMap.get(url);
      if (suppressTime && Date.now() - suppressTime < SUPPRESS_DURATION_MS) {
        console.log('🚫 suppressed recording for', url);
        sendResponse({ status: 'skipped' });
        return true;
      }

      openDatabase().then((db) => {
        const tx = db.transaction('activity', 'readwrite');
        const store = tx.objectStore('activity');
        const now = new Date().toISOString();

        // Read existing entry first to preserve firstSeenAt on re-visits
        const getReq = store.get(message.entry.url);
        getReq.onsuccess = () => {
          const existing: ActivityEntry | undefined = getReq.result;
          const entry: ActivityEntry = {
            url: message.entry.url,
            title: message.entry.title,
            category: message.entry.category,
            bodyText: message.entry.bodyText || '',
            firstSeenAt: existing?.firstSeenAt ?? now,
            updatedAt: now
          };

          const putReq = store.put(entry);
          putReq.onsuccess = () => {
            sendResponse({ status: 'ok' });
          };
          putReq.onerror = (e: Event) => {
            const error = (e.target as IDBRequest).error;
            sendResponse({ status: 'error', error });
          };
        };
        getReq.onerror = (e: Event) => {
          const error = (e.target as IDBRequest).error;
          sendResponse({ status: 'error', error });
        };
      });

      return true;
    }

    return false;
  }
);
