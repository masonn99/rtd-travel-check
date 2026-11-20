---
version: 1
slug: "app-components-tableview-jsx"
primary_target: "app/components/TableView.jsx"
related_targets: ["app/page.tsx","app/components/Header.jsx","app/components/BottomNav.jsx"]
---

# Surface brief: Directory (phone first)

Scope: the Directory view and the app shell around it (header, bottom tab bar, footer). Mode: Operate. Other views (Globe, Stories, AI Chat) follow this world in later passes.

Audience and job: an RTD holder on their phone checks which countries accept the document and what entry takes, then opens one country for the rule, the US embassy contact and holders' reports.

Constraints: mobile-first; official rule first, community reports labelled and dated; canonical labels Visa Free · E-Visa · Visa on Arrival · Visa Required · Not Recognized; no invented stats.

## Direction contract

THESIS: The category standard, played straight: a clean visa-checker list (flag, country, status pill) at Stripe/Apple Settings craft. It refuses the incumbent near-black dashboard with glowing chips and emoji chrome.

OWN-WORLD: Light grouped ground (#f4f5f7) with white inset-grouped lists, hairline separators, system UI type, one blue accent (#2563eb) for selection and links. Five tinted status pills carry the only other colour. Drawn line icons, never emoji, in the chrome. Dark mode mirrors it from the system setting.

STORY: The visitor sees at once how many countries fall in each status, finds a country by search or filter, opens it, and reads the official rule, the embassy contact and dated holder reports, clearly separated, with the advice to confirm before travel.

FIRST VIEWPORT: Compact top bar (mark, name, Join). Large title "Directory" with a one-line subtitle. Search field full width. Scrolling filter chips with counts. Then the A-Z inset-grouped list: flag, name, a secondary line (max stay and report recency), status pill, chevron; about eight rows visible above the bottom tab bar.

FORM: Category standard (the standing exit, taken by the user); not on the ranked list. seed:17a3c99ae0fbcf12. Signature interaction: inline row expansion that grows open in place (grid-row 0fr to 1fr, ease-out) into Official rule / Embassy / Traveler reports, one country open at a time. Signature detail: each row's report recency ("3 reports · latest 2 wk ago") so community evidence is always dated.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
