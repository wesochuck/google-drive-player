# Google Drive MP3 Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React-based web application that plays MP3 files from a public Google Drive folder with sequential playback and looping options.

**Architecture:** A Client-Side Single Page Application (SPA) using React for the UI and state, the standard HTML5 Audio API for playback, and the Google Drive API v3 for fetching file metadata.

**Tech Stack:** React (TypeScript), Vanilla CSS, Vite (Build tool), Vitest/React Testing Library (Testing).

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.css`

- [ ] **Step 1: Initialize project with Vite**

Run: `npm create vite@latest . -- --template react-ts`
Expected: Project structure created.

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: `node_modules` populated.

- [ ] **Step 3: Setup basic CSS**

Create `src/App.css` with a modern dark theme base.

```css
:root {
  --bg-color: #121212;
  --text-color: #e0e0e0;
  --accent-color: #1db954;
  --secondary-bg: #1e1e1e;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
```

- [ ] **Step 4: Verify dev server starts**

Run: `npm run dev`
Expected: Local dev server running on port 5173.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: initial scaffold with Vite/React/TS"
```

---

### Task 2: Google Drive API Service

**Files:**
- Create: `src/services/driveService.ts`
- Test: `src/services/driveService.test.ts`

- [ ] **Step 1: Define the Drive Service interface**

Create `src/services/driveService.ts`:

```typescript
export interface DriveFile {
  id: string;
  name: string;
  streamUrl: string;
}

export const fetchPlaylist = async (folderId: string, apiKey: string): Promise<DriveFile[]> => {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='audio/mpeg'&key=${apiKey}&fields=files(id,name)`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch from Google Drive');
  const data = await response.json();
  return data.files.map((file: any) => ({
    id: file.id,
    name: file.name,
    streamUrl: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${apiKey}`
  }));
};
```

- [ ] **Step 2: Write failing test for Drive Service**

Create `src/services/driveService.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { fetchPlaylist } from './driveService';

describe('driveService', () => {
  it('should fetch and map files correctly', async () => {
    const mockFiles = {
      files: [{ id: '1', name: 'song1.mp3' }]
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFiles
    });

    const result = await fetchPlaylist('folder123', 'key456');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('song1.mp3');
    expect(result[0].streamUrl).toContain('1');
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/services/driveService.ts src/services/driveService.test.ts
git commit -m "feat: add drive service for fetching mp3s"
```

---

### Task 3: Audio Player Component & Looping Logic

**Files:**
- Create: `src/components/Player.tsx`, `src/components/Player.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement the Player component**

Create `src/components/Player.tsx`. This manages the HTML5 `<audio>` tag and the looping state.

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { DriveFile } from '../services/driveService';
import './Player.css';

type LoopMode = 'none' | 'all' | 'one';

interface PlayerProps {
  playlist: DriveFile[];
  currentIndex: number;
  onTrackChange: (index: number) => void;
}

export const Player: React.FC<PlayerProps> = ({ playlist, currentIndex, onTrackChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = playlist[currentIndex];

  const togglePlay = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    if (loopMode === 'one') {
      audioRef.current?.play();
    } else if (currentIndex < playlist.length - 1) {
      onTrackChange(currentIndex + 1);
    } else if (loopMode === 'all') {
      onTrackChange(0);
    } else {
      setIsPlaying(false);
    }
  };

  const cycleLoopMode = () => {
    const modes: LoopMode[] = ['none', 'all', 'one'];
    const next = modes[(modes.indexOf(loopMode) + 1) % modes.length];
    setLoopMode(next);
  };

  useEffect(() => {
    if (isPlaying) audioRef.current?.play();
  }, [currentIndex]);

  if (!currentTrack) return null;

  return (
    <div className="player">
      <h2>{currentTrack.name}</h2>
      <audio 
        ref={audioRef} 
        src={currentTrack.streamUrl} 
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <div className="controls">
        <button onClick={() => onTrackChange(currentIndex - 1)} disabled={currentIndex === 0}>Prev</button>
        <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={() => onTrackChange(currentIndex + 1)} disabled={currentIndex === playlist.length - 1 && loopMode !== 'all'}>Next</button>
        <button onClick={cycleLoopMode}>Loop: {loopMode}</button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Add Player styles**

Create `src/components/Player.css` with layout for controls.

- [ ] **Step 3: Update App.tsx to wire up state**

Integrate `fetchPlaylist` and `Player` in `src/App.tsx`. Use a placeholder API Key and Folder ID initially.

- [ ] **Step 4: Verify manual playback works**

Run: `npm run dev`
Manual Check: Verify clicking "Next" and "Loop" buttons updates the state and playback behavior.

- [ ] **Step 5: Commit**

```bash
git add src/components/Player.tsx src/components/Player.css src/App.tsx
git commit -m "feat: implement audio player with looping logic"
```

---

### Task 4: Playlist UI & Polish

**Files:**
- Create: `src/components/Playlist.tsx`, `src/components/Playlist.css`
- Modify: `src/App.tsx`, `src/App.css`

- [ ] **Step 1: Create Playlist component**

List all files and highlight the `currentIndex`.

- [ ] **Step 2: Add responsive styling**

Ensure the app looks good on mobile (large buttons, touch-friendly scroll).

- [ ] **Step 3: Add "Config" UI**

Add a small settings section to input/save the API Key and Folder ID to `localStorage` so the user doesn't have to re-enter them.

- [ ] **Step 4: Final verification**

Verify end-to-end: Fetching -> Playing -> Auto-advance -> Looping.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add playlist UI and persistence for settings"
```
