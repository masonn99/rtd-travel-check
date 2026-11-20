---
name: RTD Travel Check
description: A grouped-list visa directory for US Refugee Travel Document holders, built to the category standard.
colors:
  accent: "#2563eb"
  accent-ink: "#ffffff"
  grouped-ground: "#f4f5f7"
  surface: "#ffffff"
  fill: "#ebedf1"
  hairline: "#e2e4e9"
  ink: "#111827"
  ink-secondary: "#4b5563"
  ink-tertiary: "#68707d"
  status-free-bg: "#dff4e6"
  status-free-fg: "#166534"
  status-evisa-bg: "#d2f3f0"
  status-evisa-fg: "#0f6c64"
  status-voa-bg: "#ece7fe"
  status-voa-fg: "#5b21b6"
  status-req-bg: "#fdeed5"
  status-req-fg: "#92400e"
  status-nr-bg: "#fee2e2"
  status-nr-fg: "#b91c1c"
  map-free: "#22a55b"
  map-evisa: "#14a698"
  map-voa: "#8b5cf6"
  map-req: "#f0a020"
  map-nr: "#e5484d"
  map-none: "#dfe2e8"
  map-ocean: "#e9eff7"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
  row-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "21px"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  body-small:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.625
  footnote:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  section-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "18px"
  pill:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "24px"
  tab-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1
rounded:
  pill: "6px"
  mark: "7px"
  popover: "8px"
  field: "10px"
  group: "12px"
  bubble: "18px"
  full: "9999px"
spacing:
  hairline-inset: "52px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  row-height: "52px"
  bar-height: "56px"
components:
  status-pill-free:
    backgroundColor: "{colors.status-free-bg}"
    textColor: "{colors.status-free-fg}"
    typography: "{typography.pill}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "24px"
  status-pill-evisa:
    backgroundColor: "{colors.status-evisa-bg}"
    textColor: "{colors.status-evisa-fg}"
    typography: "{typography.pill}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "24px"
  status-pill-voa:
    backgroundColor: "{colors.status-voa-bg}"
    textColor: "{colors.status-voa-fg}"
    typography: "{typography.pill}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "24px"
  status-pill-required:
    backgroundColor: "{colors.status-req-bg}"
    textColor: "{colors.status-req-fg}"
    typography: "{typography.pill}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "24px"
  status-pill-not-recognized:
    backgroundColor: "{colors.status-nr-bg}"
    textColor: "{colors.status-nr-fg}"
    typography: "{typography.pill}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "24px"
  status-pill-no-data:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.pill}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "24px"
  filter-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "32px"
  filter-chip-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "32px"
  search-field:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 40px"
    height: "44px"
  text-field:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 12px"
    height: "44px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  button-primary-block:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.field}"
    height: "44px"
    width: "100%"
  button-quiet:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  list-group:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.group}"
  country-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.row-title}"
    padding: "7px 16px"
    height: "52px"
  country-row-open:
    backgroundColor: "{colors.fill}"
  tab-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-tertiary}"
    typography: "{typography.tab-label}"
    height: "56px"
  tab-bar-active:
    textColor: "{colors.accent}"
  chat-bubble-user:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.bubble}"
    padding: "10px 14px"
  chat-bubble-assistant:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.bubble}"
    padding: "10px 14px"
---

# Design System: RTD Travel Check

## Overview

**Creative North Star: "The Settings Pane for the World"**

The site is a system list, not a themed destination. Every surface reads like a well-made settings or reference pane: a pale grouped ground, white inset-grouped lists, hairline separators, system UI type, and exactly one blue for selection and links. The craft bar is Stripe Docs and Dashboard for density and typographic discipline, Apple Settings and Health for grouped lists and the phone-first tab bar. Nothing is decorative; the only colour beyond the accent is the five status tints, and they are information.

Density is moderate and phone-first: rows are 52px tall, about eight countries show above the tab bar, and a row grows open in place instead of navigating away. Desktop widens the same list into columns rather than inventing a second layout. Dark mode is a mirror, not a separate theme: every token has a dark counterpart switched by the system setting, never by a toggle.

This world explicitly replaces the previous near-black dashboard with glowing chips, gradient text, glass panels and emoji chrome. None of those return.

**Key Characteristics:**
- Grouped ground plus white inset-grouped lists, hairline-separated, 12px group corners.
- System font stack only; hierarchy by size and weight, never by case or tracking tricks.
- One accent (blue) for selection, links and the primary action; status colour lives only in pills and map fills.
- Drawn line icons from one family (24px grid, 1.75 stroke, round caps); flags are content, not chrome.
- Flat at rest; small shadows only on things that float above the page.
- Disclosure in place: one row open at a time, height animates, nothing re-mounts.

## Colors

A cool neutral ground with one saturated blue, plus five paired status tints that do all the remaining colour work. All tokens are defined as space-separated RGB channels in `app/globals.css` so opacity modifiers work; the hex values above are exact conversions of the light set, and the sidecar carries the dark set.

### Primary
- **Settings Blue** (accent): selected filter chip, active tab icon and label, active desktop nav underline, links (embassy website, phone), the primary button, the user chat bubble, the brand mark tile, focus outline and text caret, and selection highlight at 22% opacity. In dark mode it lifts to a lighter periwinkle-blue for contrast, and its ink flips to near-black.
- **Accent Ink** (accent-ink): text and icons on accent fills.

### Neutral
- **Grouped Ground** (grouped-ground): the page background behind every list; also the sticky search band so it reads as part of the ground, not a bar.
- **Surface White** (surface): list groups, cards, header, tab bar, footer, chat assistant bubbles, floating map controls.
- **Quiet Fill** (fill): search and text fields, quiet buttons, segmented-control track, the "No official data" pill, skeleton bars, and the pressed/open row tint (50 to 60% opacity).
- **Hairline** (hairline): every separator and border: inset row dividers, group borders (at 70%), header and tab bar edges, the stuck-search edge.
- **Ink** (ink): primary text, country names, values.
- **Ink Secondary** (ink-secondary): subtitles, section labels, inactive chip text, de-emphasised names (Not Recognized countries).
- **Ink Tertiary** (ink-tertiary): row secondary lines (stay and report recency), letter headers, chevrons, inactive tabs, icons beside text, footnotes. Chosen to stay AA on the grouped ground.

### Status
Five fixed pairs, each a tinted ground with a deep same-hue text that passes AA in both themes. They map one-to-one to the canonical labels: **Visa Free** (green), **E-Visa** (teal), **Visa on Arrival** (violet), **Visa Required** (amber), **Not Recognized** (red). The red and green pairs double as form error and success notices.

Map fills are the same five hues at area saturation (map-free through map-nr), plus a neutral map-none for countries without data and a cool map-ocean (#e9eff7 light, #141b26 dark) for the globe's sea. Pills and map always agree on hue.

### Named Rules
**The One Blue Rule.** The accent is the only interactive colour. If something is selected, linked or the primary action, it is blue; if it is not, it is neutral. No second accent, no gradient, no glow.

**The Status-Is-Data Rule.** Status hues appear only where they mean a visa status (pill, map fill, legend swatch) or a form outcome (error red, success green). Never use them for decoration, category colour or emphasis.

**The Mirror Rule.** Every colour is a token with a light and dark value switched by `prefers-color-scheme`. A raw hex in a component is a bug; the one exception is the Telegram mark, which keeps its own brand blue.

## Typography

**Display Font:** System UI (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial)
**Body Font:** the same system stack
**Label/Mono Font:** none; numbers use tabular figures from the system face

**Character:** Native and invisible: San Francisco on Apple devices, Segoe or Roboto elsewhere, so the site feels like part of the phone. Weight and size do the work; there is no second family.

### Hierarchy
- **Display** (700, 34px desktop, 28 to 30px on phones, line-height 1.25, -0.025em): the one large title per view (Directory, World map, Stories, AI Chat).
- **Headline** (600, 19px, -0.01em): card titles such as the report form header.
- **Title** (600, 17px): a selected item heading, such as the selected country on the map.
- **Row title** (500, 16px / 21px): country names in list rows; also input text (16px prevents iOS zoom).
- **Body** (400, 15px, relaxed): subtitles, detail values, chat messages, embassy rows. Subtitles cap at 60ch.
- **Body small** (400, 14px): report text, empty-state support copy, chip labels (500).
- **Footnote** (400, 13px / 18px): row secondary lines, counts, disclaimers.
- **Section label** (600, 13px, sentence case): section headings inside detail panels and letter headers in the A to Z list.
- **Pill** (600, 12px): status pills.
- **Tab label** (500, 11px): bottom tab bar labels.

### Named Rules
**The Sentence-Case Rule.** Labels and section headings are sentence case at 13px semibold in ink-secondary or ink-tertiary. No uppercase, no wide tracking, no eyebrow line above a title.

**The Tabular Rule.** Counts, stays and dates use tabular figures so columns of numbers align.

## Layout

Phone first. The shell is a 56px sticky header (mark, name, Join) and, below the md breakpoint, a 56px fixed bottom tab bar padded for the safe area. At md and up the tabs move into the header as a text nav with a 2px accent underline, and the tab bar disappears.

Content uses a 16px side gutter, 24px from sm. List views (Directory, AI Chat) cap at 768px; views with a map or two columns (Globe, Stories) cap at 1024px. Each view opens with its large title and a one-line subtitle, 20 to 24px from the header on phones and 40px on desktop.

The Directory pins search and filter chips in a band directly under the header; the band gains a hairline edge only once stuck. Filter chips scroll horizontally edge to edge on phones. The list is grouped A to Z: a letter header, then one inset group, 16px between groups.

Rows are a fixed grid: 28px flag column, flexible name column, status pill, 14px chevron, 12px gaps, 16px side padding, 52px minimum height. On phones the stay and report recency sit as a second line under the name; at md they move into their own columns (stay 88px, reports 200px, pill 124px). Detail panels indent to the name column on desktop (60px).

Stories uses a 12-column split at lg: report form 5 columns and sticky, country list 7.

## Elevation & Depth

Depth is tonal, not shadowed. White groups sit on the grouped ground, separated by hairlines; that contrast is the whole layering system. Shadows appear only on elements that genuinely float over content, and they are small and neutral.

### Shadow Vocabulary
- **Stuck edge** (`box-shadow: 0 1px 0 rgb(var(--line))`): the sticky search band once content scrolls under it. A hairline, not a shadow.
- **Floating control** (`box-shadow: 0 2px 8px rgba(0,0,0,0.08)`): map zoom controls over the map.
- **Popover** (`box-shadow: 0 4px 16px rgba(0,0,0,0.12)`): the desktop map hover tooltip.
- **Segment thumb** (`box-shadow: 0 1px 3px rgba(0,0,0,0.12)`): the selected segment in a segmented control.

### Named Rules
**The Flat-Ground Rule.** Lists, cards and bars never cast shadows. If it sits in the page flow, it is separated by a hairline; only floating things get a shadow, and never larger than the popover value.

## Shapes

Gently rounded, Apple-native geometry. Inset groups and cards use 12px corners and clip their rows. Fields, block buttons and the segmented track use 10px. Status pills use a tighter 6px so they read as labels, not buttons. Chips and inline buttons are fully round capsules. The brand mark is a 28px tile at 7px. Chat bubbles are 18px with the tail corner cut to 6px (bottom-right for the user, bottom-left for the assistant).

Separators inside a group are inset to start at the text column (52px), never full-bleed, exactly like a system list. Borders are 1px hairlines; groups use the hairline at 70% so the white surface leads.

Icons are one drawn line family on a 24px grid with a 1.75 stroke and round caps and joins, sized 16px inline, 18px in fields and the mark, 24px in the tab bar.

## Components

### Status Pill
The signature label: compact, tinted, never interactive.
- **Shape:** 24px tall, 8px side padding, 6px corners, 12px semibold, no wrap.
- **Color:** one of the five status pairs; countries without official data get a fill-coloured "No official data" pill in ink-secondary at weight 500.
- **Labels:** always the canonical five, rendered from one shared map; never abbreviated or reworded per surface.

### Country Row (signature)
An inset-grouped list row that grows open in place.
- **Structure:** emoji flag, name (Not Recognized names drop to ink-secondary), secondary line (stay and dated report recency, or "No reports yet"), status pill, chevron.
- **States:** hover tints with fill at 50%, press at full fill, open at 60% fill; chevron rotates 90 degrees over 200ms.
- **Disclosure:** the panel animates `grid-template-rows` from 0fr to 1fr over 280ms on `cubic-bezier(0.16, 1, 0.3, 1)`; content mounts on first open and stays mounted so closing animates too. One row open at a time. Reduced motion removes the transition.
- **Detail panel:** sections titled with the section label style and a right-aligned footnote aside (for example "Official baseline"), a two-column definition list (ink-tertiary terms, ink values), hairline-ruled contact rows with 16px tertiary icons and accent links, and a closing footnote disclaimer.

### Buttons
- **Shape:** capsule for inline actions (36px tall, 16px padding, 14px semibold); 10px corners and 44px tall for full-width form actions (16px semibold).
- **Primary:** accent fill with accent ink. One primary per region.
- **Quiet:** fill background with ink text (Join, form Back), hovering to the hairline colour.
- **Outline:** surface with hairline border and ink text (Load more).
- **Disabled:** 60% opacity (40% for chat send), cursor reflects state.
- **Focus:** the global 2px accent outline at 2px offset.

### Chips
- **Style:** 32px capsules, 14px medium, a trailing tabular count in ink-tertiary.
- **State:** inactive is surface with hairline border and ink-secondary text, hovering to ink; active is accent fill, accent border, accent ink, count at 70% opacity. Exposed as toggle buttons (`aria-pressed`).

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** surface on the grouped ground.
- **Shadow Strategy:** none (see Flat-Ground Rule).
- **Border:** 1px hairline at 70%.
- **Internal Padding:** 20px for cards (form card), rows carry their own 16px padding; empty states pad 24px by 40 to 48px and centre their copy with one primary capsule.

### Inputs / Fields
- **Style:** filled, no border: fill background, 44px tall, 10px corners, 16px ink text, ink-tertiary placeholder. Search adds an 18px leading search icon and a trailing clear button. The chat composer is the one capsule field (surface, hairline border).
- **Focus:** a 2px accent ring at 40% opacity replaces the outline; caret is accent.
- **Error:** a 2px ring in the not-recognized red at 70%, plus a red-pair notice; success notices use the green pair.
- **Segmented control:** fill track, 4px inset, 10px corners; the selected segment is a surface thumb with the segment-thumb shadow.
- **Step indicator:** 24 by 6px capsules, accent when reached, hairline when not.

### Navigation
- **Header:** surface bar, 56px, hairline bottom border, sticky. Left: accent mark tile with a white plane icon and the name at 15px semibold. Right: a quiet capsule Join button with the Telegram mark.
- **Desktop nav (md+):** 14px medium text tabs with 16px icons, ink-tertiary hovering to ink, active in ink with a 2px accent underline sitting on the header border.
- **Bottom tab bar (below md):** surface, hairline top border, fixed, safe-area padded; four equal tabs with 24px icon over 11px label; active tab is accent, others ink-tertiary. No badges, no filled-icon swap.

### Chat Bubbles
- **User:** accent fill, accent ink, right-aligned, 18px corners with a 6px bottom-right tail.
- **Assistant:** surface with hairline border at 70%, ink text, left-aligned beside a 32px accent avatar, 6px bottom-left tail. Typing indicator is three 6px ink-tertiary dots pulsing in an assistant bubble.

## Do's and Don'ts

### Do:
- **Do** put every list in a white inset group on the grouped ground, with hairlines inset to the text column (52px).
- **Do** render status only through the shared pill and map fills, using the canonical five labels.
- **Do** date every community report line ("3 reports · 2 wk ago") in the footnote style.
- **Do** expand detail in place with the 280ms disclosure; keep one row open at a time.
- **Do** use the system font stack, sentence case, and tabular figures for counts and stays.
- **Do** draw icons from the single line family (24px grid, 1.75 stroke, round caps).
- **Do** define every new colour as an RGB-channel token with a light and a dark value.
- **Do** keep the large title plus one-line subtitle as the opening of every view.

### Don't:
- **Don't** bring back the old look: near-black dashboard, glowing chips, gradient text, glass or backdrop blur, coloured drop shadows.
- **Don't** use emoji as interface icons in navigation, buttons or headers; flags inside country rows are content and stay.
- **Don't** add a second accent colour or use status hues for decoration.
- **Don't** cast shadows on in-flow surfaces; reserve the four shadow values for floating elements.
- **Don't** use uppercase labels, wide letter-spacing, or an eyebrow line above titles.
- **Don't** load a web font or a display face; the system stack is the brand.
- **Don't** hard-code hex or Tailwind palette colours (zinc, blue-600 and so on) in components.
