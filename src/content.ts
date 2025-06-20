import type { ActivityEntry, DomainConfig, LogActivityMessage, LogActivityResponse } from './types';
import { categorizePage } from './utils/categorization';

// Main function to record page activity
async function recordPageActivity() {
  const timestamp = new Date().toISOString();

  // Check for canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  const currentUrl = canonicalLink?.href || location.href;

  // Wait a bit for dynamic title updates on SPAs like X/Twitter
  let title = document.title;

  // For X/Twitter, wait for the title to be properly set
  if (currentUrl.includes('x.com') || currentUrl.includes('twitter.com')) {
    // Try to get title from og:title meta tag first
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    if (ogTitle) {
      title = ogTitle;
    } else if (!title || title === 'X' || title === 'Twitter') {
      // Wait a bit for title to update
      await new Promise((resolve) => setTimeout(resolve, 1000));
      title = document.title;

      // If still no good title, try to extract from tweet text
      if (!title || title === 'X' || title === 'Twitter') {
        const tweetText = document.querySelector('[data-testid="tweetText"]')?.textContent;
        if (tweetText) {
          title = `${tweetText.slice(0, 100)}...`;
        }
      }
    }
  }

  // Load configuration
  const result = await chrome.storage.sync.get('domainConfig');
  const config: DomainConfig = result.domainConfig || [];

  // Categorize the page
  const { category, normalizedUrl } = categorizePage(currentUrl, config);

  // For matched patterns, include full body text
  // For unknown categories, only include basic info to save space
  const bodyText = category !== 'unknown' ? document.body?.innerText?.slice(0, 100000) || '' : '';

  const entry: ActivityEntry = {
    id: crypto.randomUUID(),
    title,
    url: normalizedUrl,
    timestamp,
    category,
    bodyText
  };

  console.log('📄 Recording entry:', {
    url: entry.url,
    title: entry.title,
    category: entry.category
  });

  // Send to background script
  chrome.runtime.sendMessage<LogActivityMessage, LogActivityResponse>(
    { type: 'log-activity', entry },
    (res: { status: string; error?: unknown }) => {
      if (res?.status === 'ok') {
        console.log('✅ Sent to background successfully');
      } else if (res?.status === 'skipped') {
        console.log('🚫 Suppressed by background');
      } else {
        console.error('❌ Failed to save in background', res);
      }
    }
  );
}

// Execute the main function
recordPageActivity();
