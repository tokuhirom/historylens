# HistoryLens

🔍 **HistoryLens** is a smart browsing history manager Chrome extension that brings clarity to your web activities.  
It automatically categorizes your browsing history into meaningful groups like articles, documentation, pull requests, and more - all with fully customizable category labels and beautiful visualization.

## ✨ Key Features

- 📝 **Automatic Activity Tracking** - Records when you read blogs, view slides, browse Q&A sites, or work with internal tools
- 🏷️ **Fully Customizable Categories** - Define your own category labels with emojis (e.g., "💡 Researched Solution", "🐦 Browsed Social Media")
- 🔍 **Smart Categorization** - Automatically categorizes activities based on URL patterns
- 📅 **Weekly Dashboard** - Browse your activities organized by week with an intuitive, collapsible interface
- 🔎 **Full-Text Search** - Quickly find past activities using keyword search across titles and content
- ⚙️ **Flexible Pattern Configuration** - Configure URL patterns and their categories through the options page
- 🎯 **Smart Suggestions** - Built-in category suggestions and autocomplete for easy categorization
- 🖼️ **Favicon Display** - Visual identification of sites with automatic favicon loading
- 🔒 **Privacy First** - All data stored locally in IndexedDB, never sent to external servers
- 🚫 **Smart Suppression** - Prevents duplicate entries when opening links from the dashboard
- 🗑️ **Automatic Cleanup** - Removes old uncategorized entries after 7 days

## 🧩 Use Cases

- Generate daily/weekly reports by reviewing what you worked on
- Track how many pull requests you've reviewed
- Remember which documentation or articles you referenced
- Search through your browsing history with better context than browser history

## 🏗 Architecture

```
historylens/
├── src/
│   ├── background.ts      # Service worker handling data storage and migrations
│   ├── content.ts         # Content script for activity detection
│   ├── dashboard.tsx      # Preact-based activity dashboard
│   ├── options.tsx        # Preact-based settings page
│   ├── types.ts          # TypeScript type definitions
│   └── db.ts             # IndexedDB utilities
├── public/
│   ├── manifest.json     # Chrome extension manifest (V3)
│   └── icons/           # Extension icons
└── dist/                # Built extension files
```

## 🚀 Installation

### For Users
1. Download the latest release from the Releases page
2. Extract the ZIP file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extracted folder

### For Developers
1. Clone the repository:
   ```bash
   git clone https://github.com/tokuhirom/historylens.git
   cd historylens
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/` folder

## ⚙️ Configuration

Access the options page by:
1. Right-clicking the extension icon
2. Selecting "Options"

### Category Configuration

Each URL pattern can have a custom category label. Examples:
- `{ pattern: 'https://qiita.com/*/items/*', category: '📝 Read Article' }`
- `{ pattern: 'https://github.com/*/pull/*', category: '🔍 Reviewed PR' }`
- `{ pattern: 'https://x.com/*', category: '🐦 Browsed Social Media' }`
- `{ pattern: 'https://duckduckgo.com/*', category: '🚫 Ignored' }`

### Default Categories Include:

- **📝 Read Article**: Technical blogs (Qiita, Zenn, Medium, Dev.to, Gigazine, etc.)
- **📰 Read News**: News sites (Nikkei, Reuters, Asahi, etc.)
- **🎤 Viewed Slides**: Presentation platforms (SpeakerDeck, SlideShare)
- **💡 Researched Solution**: Q&A sites (Stack Overflow, Stack Exchange)
- **🔍 Reviewed PR / 🐛 Checked Issue**: GitHub activities
- **📦 Explored Repository**: Repository browsing
- **🐦 Browsed Social Media**: X/Twitter
- **🚫 Ignored**: Pages you don't want to track

### Pattern Format
- Use wildcards (`*`) for flexible matching
- Example: `https://*.example.com/blog/*`

## 💾 Data Storage

- **Local Storage Only**: All data stored in browser's IndexedDB (HistoryLensDB)
- **No Cloud Sync**: Your data never leaves your machine
- **Recorded Fields**:
  - Page title and URL (with smart extraction for SPAs like X/Twitter)
  - Custom category label
  - Timestamp of first and last visit
  - Full text content for matched patterns (for search functionality)

## 🔍 Usage Tips

### Viewing History
1. Click the HistoryLens extension icon
2. Browse activities by week using navigation buttons
3. Click any link to revisit (with 5-second recording suppression)

### Searching
1. Use the search box in the dashboard
2. Search across titles, URLs, and content
3. Results ranked by relevance

### Exporting Data
Currently manual - copy from the dashboard view. Future versions will support:
- CSV export
- Markdown format for easy pasting into reports

## 🛡️ Privacy & Security

- **100% Local**: No data is ever transmitted to external servers
- **No Analytics**: No tracking or telemetry included
- **No Permissions**: Only accesses sites you explicitly configure
- **Open Source**: All code is available for inspection

## 🔜 Roadmap

- [ ] Data export features (CSV, Markdown, JSON)
- [ ] Enhanced filtering and tags
- [ ] Keyboard shortcuts
- [ ] Data backup/restore functionality
- [ ] Integration with calendar apps
- [ ] CLI tool for advanced queries

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

### Development Commands
```bash
npm run dev      # Start development build with watch
npm run build    # Build for production
npm run clean    # Clean build artifacts
npm run lint     # Run Biome linter
npm run test     # Run tests
npm run coverage # Run tests with coverage
```

## 📝 License

MIT License - see LICENSE file for details

## 🙋‍♂️ Author

@tokuhirom

---

**Note**: This extension respects your privacy and is designed for personal productivity. All data remains on your local machine.