import Fuse from 'fuse.js';
import { type FunctionalComponent, render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { RawLogs } from './components/RawLogs';
import { SearchResults } from './components/SearchResults';
import { WeeklyReport } from './components/WeeklyReport';
import { openDatabase } from './db';
import type { Entry } from './types/dashboard-types';

const Dashboard: FunctionalComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Fuse.FuseResult<Entry>[]>([]);
  const [activeTab, setActiveTab] = useState<'weekly' | 'raw'>('weekly');
  const [isRecategorizing, setIsRecategorizing] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    async function search() {
      const db = await openDatabase();
      const tx = db.transaction('activity', 'readonly');
      const store = tx.objectStore('activity');
      const req = store.getAll();

      req.onsuccess = () => {
        const allEntries = req.result as Entry[];
        // For search, include all entries (even unknown)
        const fuse = new Fuse(allEntries, {
          keys: ['title', 'url', 'bodyText'],
          threshold: 0.4,
          includeScore: true,
          useExtendedSearch: true
        });
        const results = fuse.search(searchQuery);
        setSearchResults(results);
      };
    }

    search();
  }, [searchQuery]);

  const handleRecategorize = async () => {
    if (isRecategorizing) return;

    setIsRecategorizing(true);
    try {
      // Send message to background to recategorize all entries
      await chrome.runtime.sendMessage({ type: 'recategorize-all' });

      // Wait a bit for processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Recategorization error:', error);
      setIsRecategorizing(false);
    }
  };

  return (
    <div id="dashboard">
      <div class="header">
        <h1>HistoryLens</h1>
        <div class="search-row">
          <input
            type="search"
            placeholder="Search keywords..."
            value={searchQuery}
            onInput={(e: JSX.TargetEvent<HTMLInputElement>) =>
              setSearchQuery(e.currentTarget.value)
            }
          />
          <button
            type="button"
            onClick={handleRecategorize}
            disabled={isRecategorizing}
            class="recategorize-button"
          >
            {isRecategorizing ? '🔄 Recategorizing...' : '🔄 Recategorize All'}
          </button>
        </div>
      </div>

      {searchQuery.trim() ? (
        <SearchResults results={searchResults} />
      ) : (
        <>
          <div class="tabs">
            <button
              type="button"
              class={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
              onClick={() => setActiveTab('weekly')}
            >
              📅 Weekly View
            </button>
            <button
              type="button"
              class={`tab ${activeTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw')}
            >
              📜 All History
            </button>
          </div>

          {activeTab === 'weekly' ? <WeeklyReport /> : <RawLogs />}
        </>
      )}
    </div>
  );
};

render(<Dashboard />, document.body);
