# SPEC: Track Start Delay Persistence

**Status: FINALIZED**

## Goal
Add a feature to skip the first N seconds of a track. This should be configurable per track and persist for the user (using local storage).

## Requirements
- Add a "Skip start" control to the player interface.
- Allow users to set a skip duration (in seconds) for the current track.
- Automatically seek to the skip point when the track starts.
- Persist this setting locally based on the track's unique ID.
- Provide a way to reset or modify the skip duration.

## UI/UX
- A small input field or dropdown near the player controls to set the skip time.
- Visual indicator when a track is starting from a skipped position.
- Minimalistic design consistent with the Chorus Audio Player theme.

## Technical Details
- Use `localStorage` to store a mapping of `trackId` to `skipSeconds`.
- Hook into the track change and play events to apply the skip.
- Ensure compatibility with existing delay/countdown features.
