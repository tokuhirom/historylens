# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands
```bash
npm run dev      # Start Vite development server
npm run build    # Build the extension for production (outputs to dist/)
npm run preview  # Preview the built extension
```

### Code Quality
The project uses Biome for linting and formatting. There are no dedicated lint/format scripts - Biome runs automatically via pre-commit hooks using Husky and lint-staged.

## Architecture

This is a Chrome Extension (Manifest V3) that provides smart browsing history management with automatic categorization. The extension consists of three main components that communicate via Chrome's message passing:

### 1. Background Service Worker (`src/background.ts`)
- Manages all IndexedDB operations through the `db.ts` module
- Handles messages from content scripts to store activity data
- Implements recording suppression (5-second threshold) to prevent duplicate entries when opening links from the dashboard
- Opens the dashboard when the extension icon is clicked

### 2. Content Script (`src/content.ts`)
- Injected into supported websites to capture page data
- Detects page type based on URL patterns (doc-view, doc-edit, pr-view, schedule, article)
- Extracts title, URL, and body text (limited to 100k characters)
- Sends captured data to background script via Chrome runtime messages

### 3. Dashboard UI (`src/dashboard.tsx`)
- Preact-based single-page application for viewing collected activities
- Groups entries by date and type with week-based navigation
- Implements fuzzy search using Fuse.js
- Communicates with background script to fetch and manage data

### Data Flow
1. Content script detects activity on supported sites
2. Sends message to background script with activity data
3. Background script stores/updates data in IndexedDB
4. Dashboard queries background script for stored activities
5. Background script implements suppression logic to avoid recording dashboard-opened links

### Storage Schema
Uses IndexedDB with the following structure:
- Database: "HistoryLensDB"
- Object Store: "activity" (primary key: url)
- Indexes: "updatedAt", "type"
- Entry fields: url, title, type, bodyText, firstSeenAt, updatedAt

### Supported Platforms
The extension tracks activities on:
- Confluence (configurable domain)
- GitHub/GitHub Enterprise (configurable domain)
- Technical article sites (StackOverflow, Zenn, Qiita)
- Schedule systems (Cybozu - configurable domain)
- Presentation platforms (Speaker Deck)

## Development Notes

- All data is stored locally in IndexedDB - no external API calls
- Confluence edit URLs are automatically normalized to view URLs
- The project uses TypeScript with strict mode enabled
- No test framework is configured - testing appears to be manual
- Build output goes to `dist/` directory which is gitignored

## Code Style Rules

- **All code comments must be in English** - This is a strict requirement for the repository
- **All console.log messages must be in English** - No Japanese text in debugging output
- Use descriptive English names for variables, functions, and types

## Pre-Commit Checks
- Run `npm run format` `npm run lint` `npm run build` `npm run test` before commit and check the command result.

## Git Workflow
- Don't commit to the main branch directly, create new branch for each modification
- Send pull request on GitHub after commit