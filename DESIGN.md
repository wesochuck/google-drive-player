---
name: Chorus
description: A focused, high-fidelity MP3 playlist player.
colors:
  primary: "#111827"
  neutral-bg: "#f3f4f6"
  accent: "#4f46e5"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.1
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "16px"
  lg: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "24px"
---

# Design System: Chorus

## 1. Overview

**Creative North Star: "The Studio Journal"**

Chorus is designed with the raw, focused aesthetic of a high-end recording studio's journal. It prioritizes structure and clarity over decorative flair, using monochromatic tones and strong typography to create a sense of professional purpose. The system rejects the "AI slop" of generic gradients and glassmorphism, instead relying on bold geometry and structural depth to guide the user.

**Key Characteristics:**
- Monochromatic foundation with a single, high-contrast accent.
- Bold structural depth through deliberate shadowing and layering.
- High-density typography that feels engineered and precise.
- Large, confident radii and generous internal spacing.

## 2. Colors

The Chorus palette is grounded in deep neutrals to evoke the feel of professional audio hardware.

### Primary
- **Studio Ink** (#111827): Used for primary headings and high-contrast UI elements.

### Neutral
- **Paper Gray** (#f3f4f6): The primary background color, providing a clean, low-glare surface.
- **Lead** (#4b5563): Secondary text and UI indicators.

### Accent
- **Electric Blue** (#4f46e5): Used sparingly for active states, playback indicators, and primary actions.

**The Ten Percent Rule.** The accent color is used on ≤10% of any given screen. Its rarity creates focus and preserves the "Journal" aesthetic.

## 3. Typography

Chorus uses a single, high-quality sans-serif stack to maintain a technical, cohesive feel.

**Display Font:** Inter (with system fallbacks)
**Body Font:** Inter (with system fallbacks)

### Hierarchy
- **Display** (800, 32px, 1.1): Used for the main player branding and track titles.
- **Headline** (700, 24px, 1.2): Used for section headers like "Playlist".
- **Body** (400, 16px, 1.5): Standard reading text and metadata.
- **Label** (600, 14px, normal): For buttons, inputs, and micro-metadata.

## 4. Elevation

Chorus uses **Structural Elevation**. Depth is conveyed through distinct, sharp shadows that make elements feel like physical objects placed on a surface.

### Shadow Vocabulary
- **Surface Shadow** (`box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)`): Standard depth for cards and containers.
- **Action Shadow** (`box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)`): Increased depth for elements that have been interacted with or are currently active.

## 5. Components

### Buttons
- **Shape:** Bold rounded edges (8px).
- **Primary:** Studio Ink background with white text. High-density padding (12px 24px).
- **Hover:** Slight scale reduction (0.98) and subtle shadow deepening.

### Cards
- **Corner Style:** Large radii (16px).
- **Background:** Pure white in light mode, deep gray in dark mode.
- **Internal Padding:** Generous (24px) to ensure content has room to breathe.

### Inputs
- **Style:** Thick 1px border with a large radius (12px).
- **Focus:** Strong Electric Blue ring (2px) to clearly indicate the active field.

## 6. Do's and Don'ts

### Do:
- **Do** use OKLCH for all new color declarations to ensure perceptual consistency.
- **Do** align all elements to an 8px grid.
- **Do** use bold font weights for interactive labels.

### Don't:
- **Don't** use text gradients. Use solid Studio Ink or Electric Blue instead.
- **Don't** use side-stripe borders as accents. Use background tints or full borders.
- **Don't** use generic hex grays (#999). Use tinted neutrals that lean toward the primary hue.
- **Don't** allow cards to feel "floaty" with soft, large-radius blurs. Keep shadows structural and defined.
