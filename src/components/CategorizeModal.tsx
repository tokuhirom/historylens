import type { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { DEFAULT_SUGGESTIONS } from '../constants/suggestions';
import type { DomainConfig, UrlPattern } from '../types';

interface CategorizeModalProps {
  url: string;
  onClose: () => void;
  onSave: () => void;
}

interface CategorizeFormState {
  pattern: string;
  category: string;
  showSuggestions: boolean;
  suggestions: string[];
}

export const CategorizeModal: FunctionalComponent<CategorizeModalProps> = ({
  url,
  onClose,
  onSave
}) => {
  const [formState, setFormState] = useState<CategorizeFormState>({
    pattern: '',
    category: '',
    showSuggestions: false,
    suggestions: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  // Initialize pattern on mount
  useEffect(() => {
    // Generate a suggested pattern based on the URL
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;

      // Generate smart pattern suggestions
      let suggestedPattern = '';
      if (path === '/' || path === '') {
        suggestedPattern = `https://${domain}/*`;
      } else {
        // Try to identify common patterns
        const pathParts = path.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          // Keep the first part of the path and use wildcard for the rest
          suggestedPattern = `https://${domain}/${pathParts[0]}/*`;
        }
      }

      setFormState((prev) => ({ ...prev, pattern: suggestedPattern }));
    } catch {
      // Fallback for invalid URLs
      setFormState((prev) => ({ ...prev, pattern: url }));
    }
  }, [url]);

  // Load existing categories on mount
  useEffect(() => {
    const loadExistingCategories = async () => {
      const result = await chrome.storage.sync.get('domainConfig');
      const config: DomainConfig = result.domainConfig || [];
      const categories = [...new Set(config.map((item) => item.category))];
      setExistingCategories(categories);
    };
    loadExistingCategories();
  }, []);

  // Handle category input change and show suggestions
  const handleCategoryInput = (value: string) => {
    setFormState({ ...formState, category: value, showSuggestions: true });

    if (value.trim() === '') {
      // Show default suggestions when empty
      setFormState((prev) => ({ ...prev, suggestions: DEFAULT_SUGGESTIONS.slice(0, 5) }));
    } else {
      // Filter existing categories and default suggestions
      const allSuggestions = [...existingCategories, ...DEFAULT_SUGGESTIONS];
      const uniqueSuggestions = [...new Set(allSuggestions)];

      const filtered = uniqueSuggestions
        .filter((cat) => cat.toLowerCase().includes(value.toLowerCase()))
        .sort((a, b) => {
          // Prioritize suggestions that start with the input
          const aStarts = a.toLowerCase().startsWith(value.toLowerCase());
          const bStarts = b.toLowerCase().startsWith(value.toLowerCase());
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return 0;
        })
        .slice(0, 5);

      setFormState((prev) => ({ ...prev, suggestions: filtered }));
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: string) => {
    setFormState({ ...formState, category: suggestion, showSuggestions: false, suggestions: [] });
  };

  const handleSave = async () => {
    if (!formState.pattern.trim() || !formState.category.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      // Get current config
      const result = await chrome.storage.sync.get('domainConfig');
      const currentConfig: DomainConfig = result.domainConfig || [];

      // Add new pattern
      const newPattern: UrlPattern = {
        pattern: formState.pattern.trim(),
        category: formState.category.trim()
      };
      const updatedConfig = [...currentConfig, newPattern];

      // Save updated config
      await chrome.storage.sync.set({ domainConfig: updatedConfig });

      // Trigger recategorization
      await chrome.runtime.sendMessage({ type: 'recategorize-all' });

      // Close form and notify parent
      onSave();
    } catch (error) {
      console.error('Failed to save categorization:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div class="categorize-modal">
      <button type="button" class="modal-backdrop" onClick={onClose} aria-label="Close modal" />
      <div class="modal-content">
        <h3>Categorize URL</h3>
        <p class="selected-url">{url}</p>

        <div class="form-group">
          <label for="pattern-input">URL Pattern:</label>
          <input
            id="pattern-input"
            type="text"
            value={formState.pattern}
            onInput={(e) =>
              setFormState({ ...formState, pattern: (e.target as HTMLInputElement).value })
            }
            placeholder="e.g., https://example.com/*"
          />
          <small>Use * as a wildcard to match multiple URLs</small>
        </div>

        <div class="form-group category-group">
          <label for="category-input">Category:</label>
          <div class="category-input-wrapper">
            <input
              id="category-input"
              type="text"
              value={formState.category}
              onInput={(e) => handleCategoryInput((e.target as HTMLInputElement).value)}
              onFocus={() => handleCategoryInput(formState.category)}
              onBlur={() =>
                setTimeout(() => setFormState((prev) => ({ ...prev, showSuggestions: false })), 200)
              }
              placeholder="e.g., 📚 Technical Documentation"
              autocomplete="off"
            />
            {formState.showSuggestions && formState.suggestions.length > 0 && (
              <div class="category-suggestions">
                {formState.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    class="suggestion-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <small>Choose a descriptive category with an optional emoji</small>
        </div>

        <div class="modal-actions">
          <button type="button" class="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            class="save-button"
            onClick={handleSave}
            disabled={isSaving || !formState.pattern.trim() || !formState.category.trim()}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
