# Chorus Audio Player

A secure, lightweight, web-based audio player designed for playing practice files and music libraries.

## Features

- **Secure Access:** Uses a GUID-based authentication system to protect the root directory, ensuring privacy.
- **Folder Navigation:** Supports nested directories with Base64-encoded subfolder URL paths to prevent casual URL tampering.
- **Audio Playback:** Fetches and streams multiple audio formats (`.mp3`, `.wav`, `.ogg`, `.m4a`, `.aac`, `.flac`) directly from cloud storage.
- **Continuous Playback:** Automatically advances to the next track.
- **Looping Modes:** Supports "No Loop", "Loop All" (wraps around), and "Loop One" (repeats current track).
- **Full Controls:** Play/Pause, Next/Prev, Volume slider, and Progress seek bar.
- **Theme Support:** Fully responsive design with automatic Light/Dark mode detection and a manual toggle.

## Usage

1. Launch the application.
2. Enter your secure **Access Key** (GUID) when prompted on the access screen.
3. Click **Access Player**.
4. Navigate through folders or click any track to start playing.
5. The URL will update dynamically as you navigate, allowing you to bookmark specific folders securely.

## Tech Stack

- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Storage/API:** Vercel Blob API
- **Testing:** Vitest + React Testing Library
- **Styling:** Vanilla CSS

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Build

```bash
# Build for production
npm run build
```
