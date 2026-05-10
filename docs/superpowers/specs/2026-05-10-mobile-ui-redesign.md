# Design Spec: Mobile UI & Player Controls Redesign

## 1. Overview
Redesign the player interface to improve mobile usability, replace text-based controls with standard media icons, and clarify the looping/repeat functionality.

## 2. Visual Style & Layout
- **Icons:** Use standard SVG icons for Play, Pause, Previous, and Next.
- **Looping UI:** Replace the single "Loop" button with a pill-shaped toggle or clearly labeled buttons for "Repeat One", "Repeat All", and "No Repeat".
- **Mobile First:** 
    - Increase button hit areas (min 44x44px).
    - Increase spacing between controls.
    - Full-width layout for the playlist on small screens.
- **Typography:** Increase font sizes for track titles and time indicators on mobile.

## 3. Component Changes

### Player Component (`Player.tsx`)
- Replace text within buttons with SVGs.
- Update `cycleLoopMode` logic to reflect new "Repeat" terminology.
- Add specific styling for the active repeat mode (e.g., accent border or background).

### Playlist Component (`Playlist.tsx`)
- Ensure consistent styling with the new player design.
- Improve row padding for easier tapping.

## 4. CSS Refinement
- **Media Queries:** Add robust media queries to adjust padding, button sizes, and font sizes for devices under 600px.
- **Variables:** Continue using existing CSS variables for colors to ensure theme consistency.

## 5. Success Criteria
- [ ] Controls are fully icon-based and intuitive.
- [ ] Looping modes are clearly labeled as "Repeat One", "Repeat All", etc.
- [ ] App is easily operable with one thumb on a mobile device.
- [ ] No regressions in existing playback logic or URL auto-config.
