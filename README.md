# Seen Or Not 
A lightweight Chrome extension that instantly tells you whether
you have seen a page before.

## ✨ Features

- 🟢 **NEW** — First time visiting the page
- 🔴 **SEEN** — Page has been visited earlier
- 🔵 **HOME** — New tab, bookmarks, or internal pages
- Badge appears **immediately on navigation request**
- Badge **never disappears**
- No popup, no UI, zero lag
- NEW remains until tab is refreshed or closed

## 🚀 Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the `seen-or-not` folder

## 🧠 How It Works

- Uses `webNavigation.onBeforeNavigate` for instant detection
- Tracks per-tab state to avoid tab-switch bugs
- Re-applies badge on tab activation to prevent Chrome clearing it
- Stores visited URLs locally using `chrome.storage`
- 
## 📤 Export / 📥 Import

Click the extension icon to open the control panel.

- **Export URLs** → downloads a JSON file
- **Import URLs** → merge URLs from a JSON file
- **Clear All** → deletes all stored URLs