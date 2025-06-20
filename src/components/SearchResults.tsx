import type Fuse from 'fuse.js';
import type { FunctionalComponent } from 'preact';
import type { Entry } from '../types/dashboard-types';
import {
  formatDateTime,
  getCategoryIcon,
  getDomain,
  getFaviconUrl
} from '../utils/dashboard-utils';

interface SearchResultsProps {
  results: Fuse.FuseResult<Entry>[];
}

export const SearchResults: FunctionalComponent<SearchResultsProps> = ({ results }) => {
  return results.length === 0 ? (
    <div class="no-results">No search results found</div>
  ) : (
    <section class="search-results">
      <h2>🔍 Search Results ({results.length} items)</h2>
      <div class="search-list">
        {results.map((res) => {
          const isIgnored = res.item.category.toLowerCase().includes('ignored');
          return (
            <a
              key={res.item.url}
              href={res.item.url}
              target="_blank"
              rel="noopener noreferrer"
              class={`search-result-entry ${isIgnored ? 'ignored-entry' : ''}`}
              onClick={() =>
                chrome.runtime.sendMessage({ type: 'suppress-recording', url: res.item.url })
              }
            >
              <span class="search-score">{Math.round((1 - (res.score || 0)) * 100)}%</span>
              <img
                src={getFaviconUrl(res.item.url) || ''}
                class="favicon"
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span class="log-icon">{getCategoryIcon(res.item.category)}</span>
              <span class="log-datetime">{formatDateTime(res.item.updatedAt)}</span>
              <span class="log-title">{res.item.title || 'No Title'}</span>
              <span class="log-domain">({getDomain(res.item.url)})</span>
            </a>
          );
        })}
      </div>
    </section>
  );
};
