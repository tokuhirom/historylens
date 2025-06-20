import type { FunctionalComponent } from 'preact';
import type { Entry } from '../types/dashboard-types';
import { getFaviconUrl } from '../utils/dashboard-utils';

interface LogEntryProps {
  entry: Entry;
}

export const LogEntry: FunctionalComponent<LogEntryProps> = ({ entry }) => {
  const handleClick = () => {
    chrome.runtime.sendMessage({ type: 'suppress-recording', url: entry.url });
  };

  return (
    <div class="log-entry">
      <img
        src={getFaviconUrl(entry.url) || ''}
        class="favicon"
        alt=""
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <a href={entry.url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        {entry.title || 'No Title'}
      </a>
    </div>
  );
};
