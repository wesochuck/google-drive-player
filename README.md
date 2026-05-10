# Google Drive MP3 Player

A lightweight, web-based MP3 player designed specifically for playing practice files directly from a public Google Drive folder.

## Features

- **Automatic Playlist:** Fetches all `.mp3` files from a specified Google Drive folder.
- **Continuous Playback:** Automatically advances to the next track.
- **Looping Modes:** Supports "No Loop", "Loop All" (wraps around), and "Loop One" (repeats current track).
- **Full Controls:** Play/Pause, Next/Prev, Volume slider, and Progress seek bar.
- **Persistent Settings:** Saves your Google API Key and Folder ID to `localStorage` for convenience.
- **Mobile Friendly:** Fully responsive design with a modern dark theme.

## Prerequisites

1. **Google API Key:** Create a project in the [Google Cloud Console](https://console.cloud.google.com/), enable the **Google Drive API**, and generate an API key.
2. **Public Folder:** The Google Drive folder must be shared as **"Anyone with the link can view."**
3. **Folder ID:** Obtain the Folder ID from the folder's URL (the string after `folders/`).

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd google-drive-player

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Usage

1. Launch the application.
2. Click the **Settings** icon/button.
3. Enter your **Google API Key** and **Folder ID**.
4. Click **Load Playlist**.
5. Your MP3 files will appear in the list. Click any track to start playing.

## Tech Stack

- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **API:** Google Drive API v3
- **Testing:** Vitest + React Testing Library
- **Styling:** Vanilla CSS
