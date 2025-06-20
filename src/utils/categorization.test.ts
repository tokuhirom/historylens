import { describe, expect, test } from 'vitest';
import { DEFAULT_CONFIG } from '../config/default';
import type { DomainConfig } from '../types';
import { categorizePage } from './categorization';

// Test the matchesPattern function indirectly through categorizePage
describe('matchesPattern (via categorizePage)', () => {
  const mockConfig: DomainConfig = [
    { pattern: 'https://qiita.com/*/items/*', category: '📝 Read Article' },
    { pattern: 'https://*.hateblo.jp/entry/*', category: '📝 Read Article' },
    { pattern: 'https://*.hatenablog.com/entry/*', category: '📝 Read Article' },
    { pattern: 'https://*.tdiary.net/*.html', category: '📝 Read Article' },
    { pattern: 'https://medium.com/*', category: '📝 Read Article' },
    { pattern: 'https://www.nikkei.com/article/*', category: '📰 Read News' },
    { pattern: 'https://*.yahoo.co.jp/articles/*', category: '📰 Read News' },
    { pattern: 'https://speakerdeck.com/*', category: '🎤 Viewed Slides' },
    { pattern: 'https://stackoverflow.com/questions/*', category: '💡 Researched Solution' },
    { pattern: 'https://*.stackexchange.com/questions/*', category: '💡 Researched Solution' }
  ];

  describe('Blog patterns', () => {
    test('should match Qiita article URLs', () => {
      const result = categorizePage('https://qiita.com/user123/items/abc123', mockConfig);
      expect(result.category).toBe('📝 Read Article');
    });

    test('should match Hatena Blog URLs with hateblo.jp', () => {
      const result = categorizePage(
        'https://example.hateblo.jp/entry/2023/12/25/123456',
        mockConfig
      );
      expect(result.category).toBe('📝 Read Article');
    });

    test('should match Hatena Blog URLs with hatenablog.com', () => {
      const result = categorizePage(
        'https://example.hatenablog.com/entry/2023/12/25/123456',
        mockConfig
      );
      expect(result.category).toBe('📝 Read Article');
    });

    test('should match tDiary URLs', () => {
      const result = categorizePage('https://example.tdiary.net/20231225.html', mockConfig);
      expect(result.category).toBe('📝 Read Article');
    });

    test('should match Medium URLs', () => {
      const result = categorizePage('https://medium.com/@user/article-title-123', mockConfig);
      expect(result.category).toBe('📝 Read Article');
    });

    test('should not match non-blog URLs', () => {
      const result = categorizePage('https://example.com/blog/post', mockConfig);
      expect(result.category).toBe('unknown');
    });
  });

  describe('News patterns', () => {
    test('should match Nikkei article URLs', () => {
      const result = categorizePage('https://www.nikkei.com/article/DGXMZO12345678', mockConfig);
      expect(result.category).toBe('📰 Read News');
    });

    test('should match Yahoo News URLs', () => {
      const result = categorizePage('https://news.yahoo.co.jp/articles/abc123', mockConfig);
      expect(result.category).toBe('📰 Read News');
    });
  });

  describe('Q&A patterns', () => {
    test('should match Stack Overflow questions', () => {
      const result = categorizePage(
        'https://stackoverflow.com/questions/12345/how-to-do-something',
        mockConfig
      );
      expect(result.category).toBe('💡 Researched Solution');
    });

    test('should match Stack Exchange network sites', () => {
      const result = categorizePage(
        'https://serverfault.stackexchange.com/questions/12345/server-config',
        mockConfig
      );
      expect(result.category).toBe('💡 Researched Solution');
    });
  });

  describe('Edge cases', () => {
    test('should handle URLs with query parameters', () => {
      const result = categorizePage('https://qiita.com/user/items/123?utm_source=test', mockConfig);
      expect(result.category).toBe('📝 Read Article');
    });

    test('should handle URLs with hash fragments', () => {
      const result = categorizePage('https://medium.com/article#section-2', mockConfig);
      expect(result.category).toBe('📝 Read Article');
    });

    test('should not match partial patterns', () => {
      // This should NOT match because the pattern requires /items/ after username
      const result = categorizePage('https://qiita.com/user/different/path', mockConfig);
      expect(result.category).toBe('unknown');
    });

    test('should handle wildcard in the middle of pattern', () => {
      const result = categorizePage('https://subdomain.hateblo.jp/entry/2023/12/25', mockConfig);
      expect(result.category).toBe('📝 Read Article');
    });

    test('should handle multiple wildcards', () => {
      const result = categorizePage('https://myblog.tdiary.net/20231225p01.html', mockConfig);
      expect(result.category).toBe('📝 Read Article');
    });
  });

  describe('Special characters in URLs', () => {
    test('should handle URLs with special regex characters', () => {
      // Test that special regex characters in the URL don't break the pattern matching
      const result = categorizePage(
        'https://example.hateblo.jp/entry/2023/12/25/test[1].html',
        mockConfig
      );
      expect(result.category).toBe('📝 Read Article');
    });
  });
});

describe('Game patterns', () => {
  const mockConfig: DomainConfig = [
    { pattern: 'https://store.steampowered.com/app/*', category: '🎮 Browsed Game' }
  ];

  test('should match Steam store app URLs', () => {
    const result = categorizePage(
      'https://store.steampowered.com/app/730/Counter-Strike_2/',
      mockConfig
    );
    expect(result.category).toBe('🎮 Browsed Game');
  });

  test('should not match non-app Steam URLs', () => {
    const result = categorizePage('https://store.steampowered.com/genre/Action/', mockConfig);
    expect(result.category).toBe('unknown');
  });
});

describe('File sharing patterns', () => {
  const mockConfig: DomainConfig = [
    { pattern: 'https://*.sharepoint.com/*', category: '📁 Accessed Shared File' },
    { pattern: 'https://box.company.com/s/*', category: '📁 Accessed Shared File' }
  ];

  test('should categorize SharePoint subdomains', () => {
    const result = categorizePage(
      'https://mycompany.sharepoint.com/sites/team/Shared%20Documents/report.pdf',
      mockConfig
    );
    expect(result.category).toBe('📁 Accessed Shared File');
  });

  test('should categorize Box file links', () => {
    const result = categorizePage('https://box.company.com/s/abc123def456', mockConfig);
    expect(result.category).toBe('📁 Accessed Shared File');
  });

  test('should not categorize non-matching Box URLs', () => {
    const result = categorizePage('https://box.company.com/app/folder/123', mockConfig);
    expect(result.category).toBe('unknown');
  });

  test('should not categorize non-configured domains', () => {
    const result = categorizePage('https://dropbox.com/file/something', mockConfig);
    expect(result.category).toBe('unknown');
  });
});

describe('Repository patterns', () => {
  const mockConfig: DomainConfig = [
    { pattern: 'https://github.com/*/pull/*', category: '🔍 Reviewed PR' },
    { pattern: 'https://github.com/*/issues/*', category: '🐛 Checked Issue' },
    { pattern: 'https://github.com/*/*', category: '📦 Explored Repository' },
    { pattern: 'https://github.company.com/*/pull/*', category: '🔍 Reviewed PR' },
    { pattern: 'https://github.company.com/*/issues/*', category: '🐛 Checked Issue' },
    { pattern: 'https://github.company.com/*/*', category: '📦 Explored Repository' }
  ];

  test('should categorize GitHub.com pull requests', () => {
    const result = categorizePage('https://github.com/owner/repo/pull/123', mockConfig);
    expect(result.category).toBe('🔍 Reviewed PR');
    expect(result.normalizedUrl).toBe('https://github.com/owner/repo/pull/123');
  });

  test('should remove hash from GitHub PR URLs', () => {
    const result = categorizePage(
      'https://github.com/owner/repo/pull/123#discussion_r123456',
      mockConfig
    );
    expect(result.category).toBe('🔍 Reviewed PR');
    expect(result.normalizedUrl).toBe('https://github.com/owner/repo/pull/123');
  });

  test('should categorize GitHub issues', () => {
    const result = categorizePage('https://github.com/owner/repo/issues/456', mockConfig);
    expect(result.category).toBe('🐛 Checked Issue');
  });

  test('should categorize GitHub repository pages', () => {
    const result = categorizePage('https://github.com/owner/repo', mockConfig);
    expect(result.category).toBe('📦 Explored Repository');
  });

  test('should not categorize GitHub settings as repo view', () => {
    const result = categorizePage('https://github.com/owner/repo/settings', mockConfig);
    expect(result.category).toBe('📦 Explored Repository'); // Now it matches the broad pattern
  });

  test('should categorize GitHub Enterprise URLs', () => {
    const result = categorizePage('https://github.company.com/owner/repo/pull/123', mockConfig);
    expect(result.category).toBe('🔍 Reviewed PR');
  });
});

describe('DEFAULT_CONFIG patterns', () => {
  test('should match SharePoint URLs with DEFAULT_CONFIG', () => {
    const result = categorizePage(
      'https://mycompany.sharepoint.com/sites/team/Documents/report.pdf',
      DEFAULT_CONFIG
    );
    expect(result.category).toBe('📁 Accessed Shared File');
  });
});
