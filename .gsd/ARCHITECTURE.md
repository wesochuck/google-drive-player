# ARCHITECTURE

## Overview
Chorus Audio Player is a web-based audio player that streams files from Google Drive (via Vercel Blob/API).

## Components
- **App**: Main container, handles routing (guid/path) and theme.
- **Player**: Core audio playback logic, progress bar, controls, inter-track gap timer, and technical documentation hints.
- **Playlist**: Displays files and folders, handles navigation.
- **blobService**: API client for fetching file metadata.

## Data Flow
1. User enters GUID.
2. App fetches file list from API.
3. Player receives playlist and current index.
4. Player interacts with HTMLAudioElement.
5. **Persistence**: Player interacts with LocalStorage for track-specific "Start At" offsets.
6. **Playback Engine**: Handles automatic skipping and timed gaps between tracks.
