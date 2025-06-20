import { type FunctionalComponent, render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { DEFAULT_CONFIG } from './config/default';
import type { DomainConfig, UrlPattern } from './types';

interface PatternItemProps {
  pattern: UrlPattern;
  onChange: (pattern: UrlPattern) => void;
  onRemove: () => void;
}

const PatternItem: FunctionalComponent<PatternItemProps> = ({ pattern, onChange, onRemove }) => {
  return (
    <div class="pattern-item">
      <input
        type="text"
        value={pattern.pattern}
        placeholder="URL pattern (e.g., https://example.com/*)"
        onChange={(e) => onChange({ ...pattern, pattern: (e.target as HTMLInputElement).value })}
        style="flex: 2"
      />
      <input
        type="text"
        value={pattern.category}
        placeholder="Category (e.g., 📝 Read Article)"
        onChange={(e) => onChange({ ...pattern, category: (e.target as HTMLInputElement).value })}
        style="flex: 1"
      />
      <button type="button" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
};

interface StatusProps {
  message: string;
  type: 'success' | 'error' | '';
}

const Status: FunctionalComponent<StatusProps> = ({ message, type }) => {
  if (!type) return null;

  return <div class={`status ${type}`}>{message}</div>;
};

const Options: FunctionalComponent = () => {
  const [config, setConfig] = useState<DomainConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<StatusProps>({ message: '', type: '' });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    const result = await chrome.storage.sync.get('domainConfig');
    const loadedConfig = result.domainConfig || DEFAULT_CONFIG;
    setConfig(loadedConfig);
  };

  const showStatus = (message: string, type: 'success' | 'error') => {
    setStatus({ message, type });
    setTimeout(() => {
      setStatus({ message: '', type: '' });
    }, 3000);
  };

  const updatePattern = (index: number, updatedPattern: UrlPattern) => {
    const newConfig = [...config];
    newConfig[index] = updatedPattern;
    setConfig(newConfig);
  };

  const removePattern = (index: number) => {
    const newConfig = [...config];
    newConfig.splice(index, 1);
    setConfig(newConfig);
  };

  const addPattern = () => {
    const newPattern: UrlPattern = { pattern: '', category: '' };
    setConfig([...config, newPattern]);
  };

  const saveOptions = async (e: Event) => {
    e.preventDefault();

    // Filter out patterns with empty pattern or category
    const cleanedConfig: DomainConfig = config.filter((p) => p.pattern.trim() && p.category.trim());

    try {
      await chrome.storage.sync.set({ domainConfig: cleanedConfig });
      showStatus('Settings saved successfully', 'success');
    } catch (error) {
      showStatus('Failed to save settings', 'error');
      console.error(error);
    }
  };

  const resetToDefaults = async () => {
    setConfig(DEFAULT_CONFIG);
    try {
      await chrome.storage.sync.set({ domainConfig: DEFAULT_CONFIG });
      showStatus('Reset to defaults successfully', 'success');
    } catch (error) {
      showStatus('Failed to reset settings', 'error');
      console.error(error);
    }
  };

  // Group patterns by category for display
  const groupedPatterns = config.reduce(
    (groups, pattern, index) => {
      const category = pattern.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push({ ...pattern, index });
      return groups;
    },
    {} as Record<string, (UrlPattern & { index: number })[]>
  );

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedPatterns).sort();

  return (
    <div class="container">
      <h1>HistoryLens Settings</h1>

      <form onSubmit={saveOptions}>
        <div class="instructions">
          <p>
            Configure URL patterns and their categories. Each pattern can have a custom category
            label.
          </p>
          <p>
            <strong>Pattern examples:</strong> https://example.com/*, https://*.example.com/*
          </p>
          <p>
            <strong>Category examples:</strong> 📝 Read Article, 💡 Researched Solution, 🔍 Reviewed
            PR
          </p>
        </div>

        <h2>URL Patterns by Category</h2>
        {sortedCategories.map((category) => (
          <div key={category} class="category-section">
            <h3>{category}</h3>
            <div class="pattern-list">
              {groupedPatterns[category].map((pattern) => (
                <PatternItem
                  key={`${pattern.index}-${pattern.pattern}`}
                  pattern={pattern}
                  onChange={(updatedPattern) => updatePattern(pattern.index, updatedPattern)}
                  onRemove={() => removePattern(pattern.index)}
                />
              ))}
            </div>
          </div>
        ))}

        <button type="button" class="add-button" onClick={addPattern}>
          + Add New Pattern
        </button>

        <div class="button-group">
          <button type="submit" class="save-button">
            Save
          </button>
          <button type="button" class="reset-button" onClick={resetToDefaults}>
            Reset to Defaults
          </button>
        </div>
      </form>

      <Status message={status.message} type={status.type} />
    </div>
  );
};

render(<Options />, document.body);
