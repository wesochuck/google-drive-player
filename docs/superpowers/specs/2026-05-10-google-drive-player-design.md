# Design Spec: Google Drive MP3 Player (Client-Side SPA)

## 1. Overview
A lightweight, web-based MP3 player designed to play practice files directly from a public Google Drive folder. It focuses on simplicity, sequential playback, and robust looping options.

## 2. Technical Stack
- **Framework:** React (TypeScript)
- **Styling:** Vanilla CSS
- **API:** Google Drive API v3 (REST via Fetch)
- **State Management:** React Context or Hooks (Simple enough for local state)

## 3. Core Features
- **Automatic Playlist Generation:** Fetches all `.mp3` files from a hardcoded Google Drive Folder ID.
- **Sequential Playback:** Automatically advances to the next track in the list upon completion.
- **Looping Modes:**
    - **No Loop:** Stops after the last track.
    - **Loop All:** Restarts the playlist from the first track after the last track ends.
    - **Loop One:** Repeats the current track indefinitely.
- **Playback Controls:** Play/Pause, Next/Previous, Progress seek bar, Volume control.
- **Visual Feedback:** Shows the currently playing track title and highlights it in the playlist.

## 4. Architecture & Data Flow
1. **Initialization:** On load, the app calls the Google Drive API to list files within the specified `FOLDER_ID` filtered by `mimeType = 'audio/mpeg'`.
2. **Track Loading:** Files are converted into a playlist array containing `{ id, name, streamUrl }`. 
    - *Note:* `streamUrl` will be the Google Drive direct download link: `https://www.googleapis.com/drive/v3/files/{fileId}?alt=media&key={API_KEY}`.
3. **Audio Engine:** A central `AudioPlayer` component manages a single `<audio>` element. It listens for the `ended` event to trigger the "Next Track" or "Loop" logic based on user settings.

## 5. UI/UX Design
- **Single Page Layout:**
    - **Top:** Header with "Google Drive Player" and a refresh button.
    - **Middle:** Hero section for the current track. Big "Play/Pause" buttons. Time progress slider. Loop toggle button (icon changes based on mode).
    - **Bottom:** Scrollable list of tracks. Clicking a track starts playback immediately.
- **Aesthetic:** Minimalist, "Practice Room" feel. High contrast for readability. Large touch targets for mobile users.

## 6. Implementation Constraints & Security
- **API Key:** The Google Cloud API Key must be restricted to the specific domain where the app is hosted.
- **Public Access:** The target Google Drive folder must be set to "Anyone with the link can view".
- **No Backend:** The app is entirely static and can be hosted on GitHub Pages, Vercel, or Netlify.

## 7. Success Criteria
- [ ] Successfully fetches and lists MP3s from a public Google Drive folder.
- [ ] Plays audio files without interruption.
- [ ] Loop "All" restarts the playlist.
- [ ] Loop "One" repeats the single track.
- [ ] UI reflects the currently active track.
