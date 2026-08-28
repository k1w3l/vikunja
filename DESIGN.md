---
name: VikunjaX
description: The task manager you actually own — a split inspector of lists and boards.
colors:
  cadmium: "#e24e1b"
  cadmium-deep: "#b33a12"
  sage: "#2a7954"
  sage-text: "#256a4a"
  brick: "#ce341c"
  brick-text: "#ac2915"
  ochre: "#cc8914"
  ochre-text: "#916312"
  info: "#4b646c"
  panel: "#fffcf7"
  ground: "#f4f1ea"
  paper-50: "#f7f3eb"
  border: "#d6d0c6"
  ink: "#1c1917"
  ink-strong: "#1c1917"
  ink-muted: "#57534e"
  ink-900: "#1c1917"
  logo-ink: "#1c1917"
  rail-bg: "#1c1917"
  rail-ink: "#f5f0e8"
  rail-muted: "#c4bdb4"
  rail-active: "#2a2522"
  rail-line: "#3f3a36"
  button-text: "#ffffff"
typography:
  display:
    fontFamily: "Recursive, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Recursive, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Recursive, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Recursive, Helvetica, Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 450
    lineHeight: 1.45
  ui:
    fontFamily: "Recursive, sans-serif"
    fontSize: "1rem"
    fontWeight: 450
    lineHeight: 1.45
  label:
    fontFamily: "Recursive, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 620
    letterSpacing: "0"
rounded:
  xs: "2px"
  sm: "4px"
  lg: "6px"
  full: "100%"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.5rem"
  6: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.cadmium}"
    textColor: "{colors.button-text}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 0.7rem"
    height: "2rem"
  button-primary-hover:
    backgroundColor: "{colors.cadmium-deep}"
    textColor: "{colors.button-text}"
    rounded: "{rounded.sm}"
    height: "2rem"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-900}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 0.7rem"
    height: "2rem"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: "2rem"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
    height: "2.5rem"
  nav-item:
    textColor: "{colors.rail-ink}"
    typography: "{typography.body}"
    padding: "0.38rem 0.45rem"
    height: "44px"
  chip:
    backgroundColor: "{colors.border}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.5rem"
---

# Design System: Vikunja

## Overview

**Creative North Star: "The Split Inspector"**

A three-column operator: dark project rail, linen work surface, cream task inspector that appears only while a task is open. Cadmium is the one hot tool — primary actions, focus, “you are here,” and the **X** in VikunjaX. Recursive (CASL 0) is the single face for headings and work. The mark is `vikunjax.svg` (cadmium disc, llama with shades); the wordmark is Vikunja + cadmium X.

Pocket Workshop (Owned Blue, Quicksand, Open Sans, 8px, modal task detail) is the discarded incumbent. Do not split the difference.

**Key Characteristics:**
- Three columns: 15rem rail | work | 30rem inspector
- One accent (Cadmium `#e24e1b`)
- Linen ground `#f4f1ea`, cream panel `#fffcf7`, stone ink `#1c1917`
- Recursive for everything; CASL 0
- 4px corners
- Inspector is a pane, not a modal. Hidden until a task is selected. Drawer below 1100px. Rail overlay below 720px.
- Top bar is ground; inspector is panel; rail is dark; work canvas is ground.

## Colors

Warm linen desk, dark rail, one cadmium tool. Status is earth: sage, ochre, brick. Cool greys and neon Bulma greens/blues are out.

### Primary
- **Cadmium** (`cadmium`): `--primary`, `theme-color`, buttons, links, focus. Hover uses **Cadmium Deep**.

### Neutral
- **Ground** (`ground`): Site canvas (`--site-background` / `--grey-100`).
- **Panel** (`panel`): Cards, inspector (`--inspector-bg` / `--white`).
- **Border** (`border`): Hairline (`--grey-200`).
- **Ink / Ink Muted**: `#1c1917` / `#57534e` (`--text-strong` / `--text-muted`). Cool 220° muted is gone.
- **Rail BG / Rail Ink / Rail Muted**: `#1c1917` / `#f5f0e8` / `#c4bdb4`.
- **Button-text**: `#ffffff` always — never `--white`.

### Status
- **Sage** (`sage` / `sage-text`): success fill and text. Not neon `#00db60`.
- **Ochre** (`ochre` / `ochre-text`): warning fill (and favorites on the dark rail) vs text on linen. Hue 38° so it cannot be mistaken for cadmium 15°.
- **Brick** (`brick` / `brick-text`): danger fill and text. Crimson, not a second cadmium.
- **Info** (`info`): oxidized slate. Not Owned Blue.

### Dark
Night desk, same warm family. Canvas `hsl(22, 18%, 9%)`, elevated `hsl(22, 14%, 13%)`, rail a step darker `hsl(20, 20%, 6%)`. Do not invert to cool 210° greys. Semantic text lightens (`--*-text-l`); primary buttons stay dark enough for white labels, in-text links lift separately.

### Task complete
Checking a task off is a sage stroke, not a cadmium wash. The checkbox stamps (180ms), the title is struck in sage, and the toast says “Done.” Cadmium is the tool that does the work; sage is the mark it leaves.

### Named Rules
**The Cadmium Tool Rule.** Cadmium is for actions, links, and “you are here.” Not a background wash.

**The Set-Down Rule.** Completing a task is quiet and certain. No confetti, no extra delay, no “successfully marked as.” Undo stays on the toast.

**The Button-White Rule.** Primary labels are `button-text` (`#ffffff`), never `--white`.

**The Earth Status Rule.** Success, warning, and danger sit on the linen desk (sage, ochre, brick). Neon greens, candy oranges, and Bulma blue are anti-references.

## Typography

**Display Font:** Recursive (fallback: sans-serif)
**Body Font:** Recursive (fallback: Helvetica, Arial, sans-serif)
**Label/Mono Font:** Recursive 620 for UI labels; JetBrains Mono only inside the rich-text editor

**Character:** Recursive is a working sans with a slight industrial cut. CASL 0 everywhere; no casual axis on body copy. One face for chrome and content.

### Hierarchy
- **Display** (Recursive, 650, 1.75rem): Page-level `h1`.
- **Headline** (Recursive, 650, 1.5rem): Editable titles.
- **Title** (Recursive, 650, 1.25rem): Section titles (`h2`).
- **Body** (Recursive, 450, 0.95rem / 1.45): Default UI, lists, kanban titles.
- **Label** (Recursive, 620, 0.82rem): Buttons — sentence case, not uppercase.

### Named Rules
**The One Face Rule.** Recursive for headings, chrome, and work. Do not bring back Quicksand or Open Sans.

**The Sentence-Case Tool Rule.** Buttons are sentence case. Do not uppercase task titles, project names, or running text.

### Copy
**Task.** Not item, card, or to-do.
**Project.** Not list (list is a view).
**Label.** Not tag.
**Due date** is the deadline. **Start / end** is the scheduled window.
**Add task** opens the form; the same words submit it.

Routine outcomes are one word: Created. Saved. Done. Deleted.

## Layout

Ground fills the viewport. Below a slim 3.25rem ground top bar: dark rail `15rem` | work | inspector `30rem` when a task is open. The inspector is sticky panel cream, distinct from the top bar and the linen work surface. Below 1100px the inspector is a drawer (`transform`, not width). Below tablet the rail overlays.

Density is operator-grade. Home is a work surface (start-aligned tasks). Mobile starts at 320px. Logical properties for spacing.

## Motion

Work slips are laid onto the linen blotter. List and kanban tiles enter from slightly above with a top-to-bottom clip (`280ms` expo, `24ms` stagger, cap eight). Not a fade-up from below. Completing a task is a separate sage stamp.

### Named Rules
**The Blotter Rule.** Page-load tiles are placed down, once per view. Do not restagger on filter, drag, or scroll-load.

## Elevation & Depth

**Border-plus-lift.** At rest, a surface is a 1px hairline and **no** shadow. Shadows mark hover, overlay, and press only. The inspector may carry a soft left shade (`-10px 0 24px` ink at 6%).

### Shadow Vocabulary
- **xs** (`--shadow-xs`): Pressed / active; resting buttons.
- **sm** (`--shadow-sm`): Hover on cards and buttons.
- **md** (`--shadow-md`): Menus.
- **lg** (`--shadow-lg`): Rare overlays.

### Named Rules
**The Border-Plus-Lift Rule.** Resting cards are hairline-only. Shadows appear on hover or overlay.

## Shapes

Sharp chips: the system radius is **4px** (`$radius: 0.25rem`). Circles are reserved for avatars and loaders. Rail nav items are 4px. Hairlines are 1px; focus is a 2px Cadmium halo.

### Named Rules
**The Four-Pixel Rule.** 4px for controls, cards, inputs, tags. Full circles for people. No 8px+ “app rounding.”

## Components

### Buttons
Chips: sentence case, 0.82rem weight 620, 4px, height 2rem, no border.

- **Primary:** Cadmium fill, fixed white label. Hover: Cadmium Deep.
- **Secondary:** Panel fill, ink label, 1px line.
- **Tertiary:** No fill; hover ground wash.
- **Focus:** 2px solid Cadmium with 2px offset.

### Chips
Task labels keep their own hex. They are data, not chrome.

### Progress
Hairline track (`3–4px`), sage fill, `scaleX` (composite, not width). Cadmium only for upload. Not a native `<progress>` and not a ring.

### Cards / Containers
- **Corner Style:** 4px
- **Background:** Panel
- **Shadow Strategy:** hairline only at rest
- **Kanban card:** Same radius, hairline, body-size title; done cards recede

### Inputs / Fields
- **Style:** Panel fill, 1px border, 4px radius
- **Focus:** Border to Cadmium; keyboard ring via `.user-is-tabbing`

### Navigation
Slim ground top bar: project title and trailing tools on the inline-end (no duplicate logo on desktop). Project edit is a hover-only pencil. Dark rail: cream wordmark, 4px items that fit the rail width without stray scrollbars, muted `#c4bdb4` idle, `#2a2522` active. Every item including projects has an icon (project glyphs derived from title). Inspector mounts only while a task is open.

## Do's and Don'ts

### Do:
- **Do** keep the VikunjaX wordmark (cadmium X). Cadmium is the only brand accent.
- **Do** keep the inspector as a pane, never a modal overlay, on desktop.
- **Do** hide subtasks as loose rows unless “Show in list” is on.
- **Do** use logical properties for spacing.
- **Do** honor `prefers-reduced-motion`.
- **Do** prefix any Tailwind utility with `tw-`.

### Don't:
- **Don't** bring back Owned Blue, Quicksand, Open Sans, or 8px rounding.
- **Don't** paint large surfaces with Cadmium (The Cadmium Tool Rule).
- **Don't** use `--white` for text on primary buttons.
- **Don't** invert dark mode to cool 210° greys, or restore neon success / candy orange warning.
- **Don't** uppercase task, project, or button labels.
- **Don't** drop the 1px card border in favor of shadow-only lift.
- **Don't** round past 4px except for avatars and spinners.
- **Don't** animate inspector/rail width — `transform` only.
