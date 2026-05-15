---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: UI Controls and Feedback

## Objective
Add user interface controls to set and clear the skip duration for each track.

## Context
- src/components/Player.tsx
- src/components/Player.css

## Tasks

<task type="auto">
  <name>Add skip duration input to Player UI</name>
  <files>src/components/Player.tsx, src/components/Player.css</files>
  <action>
    - Add a numeric input labeled "Skip First (s)" next to the delay dropdown.
    - Bind the input value to the `skipStart` state.
    - On change, update the state and persist to `localStorage`.
    - Style the input to match the existing controls.
  </action>
  <verify>Visual check: The input appears and is styled correctly.</verify>
  <done>User can set the skip duration via the UI.</done>
</task>

<task type="auto">
  <name>Add visual feedback for skipped start</name>
  <files>src/components/Player.tsx</files>
  <action>
    - Show a brief notification or indicator (e.g., "Skipped first Xs") when the auto-skip is triggered.
  </action>
  <verify>Trigger an auto-skip and confirm the indicator appears.</verify>
  <done>User is informed when an auto-skip has occurred.</done>
</task>

## Success Criteria
- [ ] User can easily set and change the skip duration for any track.
- [ ] The UI matches the existing design aesthetic.
