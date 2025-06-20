import type { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { openDatabase } from '../db';
import type { Entry } from '../types/dashboard-types';
import {
  formatDateTime,
  getCategoryIcon,
  getDomain,
  getFaviconUrl
} from '../utils/dashboard-utils';
import { CategorizeModal } from './CategorizeModal';

export const RawLogs: FunctionalComponent = () => {
  const [logs, setLogs] = useState<Entry[]>([]);
  const [page, setPage] = useState(0);
  const [categorizeUrl, setCategorizeUrl] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    async function fetchRawLogs() {
      try {
        console.log('Opening database...');
        const db = await openDatabase();
        console.log('Database opened, creating transaction...');
        const tx = db.transaction('activity', 'readonly');
        const store = tx.objectStore('activity');

        // First, let's count total entries
        const countReq = store.count();
        countReq.onsuccess = () => {
          console.log(`Total entries in activity table: ${countReq.result}`);
        };

        const index = store.index('updatedAt');
        console.log('Transaction created, opening cursor...');

        // Get all entries in reverse chronological order
        const req = index.openCursor(null, 'prev');
        const entries: Entry[] = [];
        let count = 0;
        console.log(`Fetching logs for page ${page}...`);

        req.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && count < (page + 1) * ITEMS_PER_PAGE) {
            if (count >= page * ITEMS_PER_PAGE) {
              console.log('Adding entry:', cursor.value);
              entries.push(cursor.value);
            }
            count++;
            cursor.continue();
          } else {
            console.log(`Found ${count} total entries, showing ${entries.length} on page ${page}`);
            setLogs(entries);
          }
        };

        req.onerror = (event) => {
          console.error('Error fetching logs:', event);
        };
      } catch (error) {
        console.error('Error in fetchRawLogs:', error);
      }
    }

    fetchRawLogs();
  }, [page]);

  const handleCategorized = () => {
    setCategorizeUrl(null);
    // Refresh the logs to show updated categories
    setPage(page);
  };

  return (
    <div class="raw-logs">
      <h2>All Browsing History</h2>
      <div class="log-list">
        {logs.map((entry) => {
          const isUnknown = entry.category === 'unknown';
          const isIgnored = entry.category.toLowerCase().includes('ignored');

          if (isUnknown) {
            return (
              <div key={entry.url} class="raw-log-entry unknown-log-entry">
                <img
                  src={getFaviconUrl(entry.url) || ''}
                  class="favicon"
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span class="log-icon">{getCategoryIcon(entry.category)}</span>
                <span class="log-datetime">{formatDateTime(entry.updatedAt)}</span>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="log-title"
                  onClick={() =>
                    chrome.runtime.sendMessage({ type: 'suppress-recording', url: entry.url })
                  }
                >
                  {entry.title || 'No Title'}
                </a>
                <span class="log-domain">({getDomain(entry.url)})</span>
                <button
                  type="button"
                  class="categorize-button"
                  onClick={() => setCategorizeUrl(entry.url)}
                >
                  Categorize
                </button>
              </div>
            );
          }

          return (
            <a
              key={entry.url}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              class={`raw-log-entry ${isIgnored ? 'ignored-entry' : ''}`}
              onClick={() =>
                chrome.runtime.sendMessage({ type: 'suppress-recording', url: entry.url })
              }
            >
              <img
                src={getFaviconUrl(entry.url) || ''}
                class="favicon"
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span class="log-icon">{getCategoryIcon(entry.category)}</span>
              <span class="log-datetime">{formatDateTime(entry.updatedAt)}</span>
              <span class="log-title">{entry.title || 'No Title'}</span>
              <span class="log-domain">({getDomain(entry.url)})</span>
            </a>
          );
        })}
      </div>
      <div class="pagination">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          ← Previous
        </button>
        <span>Page {page + 1}</span>
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={logs.length < ITEMS_PER_PAGE}
        >
          Next →
        </button>
      </div>

      {categorizeUrl && (
        <CategorizeModal
          url={categorizeUrl}
          onClose={() => setCategorizeUrl(null)}
          onSave={handleCategorized}
        />
      )}
    </div>
  );
};
