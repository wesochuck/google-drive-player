# RESEARCH: Phase 1 - Track Skip Feature

## Goal
Determine the best way to implement track-specific skip durations that persist across sessions.

## Findings

### Storage Strategy
- `localStorage` is ideal for this. It's persistent, client-side only, and has a simple API.
- Key format: `track_skip_${trackPath}`. Using the `pathname` (id) from the blob service is reliable as it's unique per file.

### Implementation in React/Audio
- The `Player` component already has a `useEffect` that runs when `currentIndex` or `isPlaying` changes.
- We can add logic to this effect:
  1. When a new track starts (or `isPlaying` becomes true and `currentTime` is 0).
  2. Check `localStorage` for a skip value.
  3. If found, set `audio.currentTime = skipSeconds`.
- For the UI:
  - Add a "Skip First" input field in the `volume-container` or a new "Settings" section.
  - When the user changes this value, update `localStorage` and optionally seek immediately if the current time is less than the new skip time.

### Edge Cases
- Skip time greater than track duration: Should be capped or ignored.
- Manual seeking: Should still be allowed even after an auto-skip.
- Mobile: Safari/iOS might have restrictions on seeking before metadata is loaded. We should wait for `onLoadedMetadata` or check `readyState`.

## Recommendation
- Create a `useTrackSettings` hook or utility to handle `localStorage` access.
- Add a numeric input for "Skip start (s)" to the player UI.
- Use the `onLoadedMetadata` event in `Player.tsx` to apply the skip if it's the start of the track.
