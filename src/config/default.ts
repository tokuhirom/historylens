import type { DomainConfig } from '../types';

export const DEFAULT_CONFIG: DomainConfig = [
  // Blog patterns
  { pattern: 'https://qiita.com/*/items/*', category: '📝 Read Article' },
  { pattern: 'https://zenn.dev/*/articles/*', category: '📝 Read Article' },
  { pattern: 'https://medium.com/*', category: '📝 Read Article' },
  { pattern: 'https://dev.to/*', category: '📝 Read Article' },
  { pattern: 'https://hackernoon.com/*', category: '📝 Read Article' },
  { pattern: 'https://blog.64p.org/entry/*', category: '📝 Read Article' },
  { pattern: 'https://note.com/*', category: '📝 Read Article' },
  { pattern: 'https://togetter.com/li/*', category: '📝 Read Article' },
  { pattern: 'https://*.hateblo.jp/entry/*', category: '📝 Read Article' },
  { pattern: 'https://*.hatenablog.com/entry/*', category: '📝 Read Article' },
  { pattern: 'https://*.tdiary.net/*.html', category: '📝 Read Article' },
  { pattern: 'https://findy-code.io/media/articles/*', category: '📝 Read Article' },
  { pattern: 'https://automaton-media.com/articles/*', category: '📝 Read Article' },
  { pattern: 'https://*.blogspot.com/*', category: '📝 Read Article' },
  { pattern: 'https://gigazine.net/news/*', category: '📝 Read Article' },
  { pattern: 'https://sakumaga.sakura.ad.jp/entry/*', category: '📝 Read Article' },
  { pattern: 'https://cloud.sakura.ad.jp/news/*', category: '📝 Read Article' },

  // News patterns
  { pattern: 'https://www.nikkei.com/article/*', category: '📰 Read News' },
  { pattern: 'https://jp.reuters.com/article/*', category: '📰 Read News' },
  { pattern: 'https://www.asahi.com/articles/*', category: '📰 Read News' },
  { pattern: 'https://mainichi.jp/articles/*', category: '📰 Read News' },
  { pattern: 'https://www.yomiuri.co.jp/*/20*', category: '📰 Read News' },
  { pattern: 'https://www3.nhk.or.jp/news/html/*', category: '📰 Read News' },
  { pattern: 'https://news.yahoo.co.jp/articles/*', category: '📰 Read News' },

  // Slide patterns
  { pattern: 'https://speakerdeck.com/*', category: '🎤 Viewed Slides' },
  { pattern: 'https://www.slideshare.net/*', category: '🎤 Viewed Slides' },
  { pattern: 'https://slides.com/*', category: '🎤 Viewed Slides' },

  // Q&A patterns
  { pattern: 'https://stackoverflow.com/questions/*', category: '💡 Researched Solution' },
  { pattern: 'https://serverfault.com/questions/*', category: '💡 Researched Solution' },
  { pattern: 'https://superuser.com/questions/*', category: '💡 Researched Solution' },
  { pattern: 'https://askubuntu.com/questions/*', category: '💡 Researched Solution' },
  { pattern: 'https://*.stackexchange.com/questions/*', category: '💡 Researched Solution' },

  // Game patterns
  { pattern: 'https://store.steampowered.com/app/*', category: '🎮 Browsed Game' },

  // File sharing patterns
  { pattern: 'https://*.sharepoint.com/*', category: '📁 Accessed Shared File' },

  // Repository patterns
  { pattern: 'https://github.com/*/pull/*', category: '🔍 Reviewed PR' },
  { pattern: 'https://github.com/*/issues/*', category: '🐛 Checked Issue' },
  { pattern: 'https://github.com/*/*', category: '📦 Explored Repository' },

  // Social Media patterns
  { pattern: 'https://x.com/*', category: '🐦 Browsed Social Media' },
  { pattern: 'https://twitter.com/*', category: '🐦 Browsed Social Media' },

  // Video patterns
  { pattern: 'https://www.youtube.com/watch*', category: '📺 Watched Video' },
  { pattern: 'https://youtu.be/*', category: '📺 Watched Video' },
  { pattern: 'https://www.nicovideo.jp/watch/*', category: '📺 Watched Video' },
  { pattern: 'https://vimeo.com/*', category: '📺 Watched Video' },
  { pattern: 'https://www.twitch.tv/*', category: '📺 Watched Video' },

  // Ignored patterns
  { pattern: 'https://duckduckgo.com/*', category: '🚫 Ignored' }
];
