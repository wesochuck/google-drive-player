# Mobile UI & Player Controls Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the player interface for better mobile usability, using icons for controls and clear "Repeat" terminology.

**Architecture:** Update `Player.tsx` and `Playlist.tsx` to use inline SVGs and updated text labels. Refactor `Player.css` and `App.css` with a focus on mobile-first responsive design and touch-friendly targets.

**Tech Stack:** React (TypeScript), Vanilla CSS.

---

### Task 1: SVG Icon Integration & Repeat Mode Refactor

**Files:**
- Modify: `src/components/Player.tsx`
- Test: `src/components/Player.test.tsx`

- [ ] **Step 1: Define SVG icon constants**

Add standard media control SVGs (Play, Pause, SkipPrevious, SkipNext, Repeat) to `src/components/Player.tsx` or a separate icons file.

- [ ] **Step 2: Update LoopMode terminology**

Rename internal state/types if necessary, but primarily update the UI labels to "Repeat All", "Repeat One", and "No Repeat".

- [ ] **Step 3: Replace button text with Icons**

Update the render method in `src/components/Player.tsx`.

```tsx
// Example for the Play/Pause button
<button className="play-pause-btn" onClick={togglePlay}>
  {isPlaying ? <PauseIcon /> : <PlayIcon />}
</button>
```

- [ ] **Step 4: Update tests for new labels**

Update `src/components/Player.test.tsx` to check for the new "Repeat" text labels instead of "Loop".

- [ ] **Step 5: Commit**

```bash
git add src/components/Player.tsx src/components/Player.test.tsx
git commit -m "feat: replace text controls with icons and update repeat labels"
```

---

### Task 2: Mobile-First Player Styling

**Files:**
- Modify: `src/components/Player.css`

- [ ] **Step 1: Increase button sizes and touch targets**

Update `.controls button` and the play/pause button to ensure they are at least 44px for easy tapping.

- [ ] **Step 2: Add Repeat Mode specific styling**

Add a distinct style for when a repeat mode is active (e.g., color change or background pill).

- [ ] **Step 3: Implement Mobile Media Queries**

Add `@media (max-width: 600px)` rules to:
- Stack controls if necessary.
- Increase padding.
- Adjust font sizes for the track title.

- [ ] **Step 4: Commit**

```bash
git add src/components/Player.css
git commit -m "style: implement mobile-first styling for player controls"
```

---

### Task 3: Playlist UI Polish & Global Mobile Layout

**Files:**
- Modify: `src/components/Playlist.tsx`, `src/components/Playlist.css`, `src/App.css`

- [ ] **Step 1: Improve Playlist touch targets**

Update `Playlist.css` to increase padding on track rows.

- [ ] **Step 2: Responsive App Container**

Modify `src/App.css` to ensure the main container and cards use more of the screen width on mobile (less side padding).

- [ ] **Step 3: Verification**

Verify the UI in the browser (simulating mobile) to ensure no overlapping elements and easy navigation.

- [ ] **Step 4: Commit**

```bash
git add src/components/Playlist.css src/App.css
git commit -m "style: polish playlist UI and global mobile layout"
```
