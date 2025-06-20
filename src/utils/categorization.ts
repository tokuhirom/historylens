import type { DomainConfig } from '../types';

interface CategorizedPage {
  category: string;
  normalizedUrl: string;
}

// URL pattern matching function
function matchesPattern(url: string, pattern: string): boolean {
  // Convert wildcards to RegExp
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special characters except *
    .replace(/\*/g, '.*'); // Convert * to .*

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
}

// Categorize the current page based on URL patterns and domain configuration
export function categorizePage(url: string, config: DomainConfig): CategorizedPage {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  let normalizedUrl = url;

  // Check all patterns
  for (const pattern of config) {
    if (matchesPattern(url, pattern.pattern)) {
      // Special handling for Confluence URLs - keep only pageId
      if (pattern.category.includes('Doc') && pathname.includes('/pages/viewpage.action')) {
        const pageId = urlObj.searchParams.get('pageId');
        if (pageId) {
          urlObj.search = '';
          urlObj.searchParams.set('pageId', pageId);
          normalizedUrl = urlObj.toString();
        }
      }

      // Special handling for PR URLs - remove hash fragment
      if (pattern.category.includes('PR') || pattern.category.includes('Pull Request')) {
        urlObj.hash = '';
        normalizedUrl = urlObj.toString();
      }

      return { category: pattern.category, normalizedUrl };
    }
  }

  return { category: 'unknown', normalizedUrl };
}
