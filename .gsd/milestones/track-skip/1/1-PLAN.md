---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Core Logic and Storage

## Objective
Implement the logic to save and retrieve track-specific skip durations and apply them during playback.

## Context
- .gsd/SPEC.md
- src/components/Player.tsx
- src/services/blobService.ts

## Tasks

<task type="auto">
  <name>Implement skip logic in Player.tsx</name>
  <files>src/components/Player.tsx</files>
  <action>
    - Add a new state `skipStart` (number) which is loaded from `localStorage` whenever the `currentTrack` changes.
    - Update the `useEffect` that handles `isPlaying` or add a new one that checks if the track has just started (currentTime < 1).
    - If a `skipStart` value exists for the current track ID, seek to that time when playback begins.
    - Handle the `onLoadedMetadata` event to ensure the audio is ready for seeking.
  </action>
  <verify>Manual check: Set a value in localStorage manually and see if the track skips on play.</verify>
  <done>Track automatically starts at the specified skip time if a value is present in localStorage.</done>
</task>

<task type="auto">
  <name>Add storage persistence logic</name>
  <files>src/components/Player.tsx</files>
  <action>
    - Implement a helper function to save skip duration to `localStorage` using the track's `id` as part of the key.
    - Ensure the value is correctly parsed as a number.
  </action>
  <verify>Check browser's Local Storage after playing a track to see if the key exists.</verify>
  <done>Skip durations are persisted across page reloads.</done>
</task>

## Success Criteria
- [ ] Tracks with a saved skip duration automatically start at that position.
- [ ] Skip settings are preserved in local storage.
