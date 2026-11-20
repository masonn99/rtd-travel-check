# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Holders of a US Refugee Travel Document (Form I-571, applied for via I-131) and US re-entry permits. The main situation is **browsing what's possible**: an RTD holder exploring where they could travel at all, then narrowing down to destinations worth pursuing. Many arrive from, or contribute to, the I-131 Telegram group chat whose shared experiences seeded the data.

## Product Purpose

Help RTD holders see, per country, whether their document is accepted and what entry requires (visa not required, e-visa, visa on arrival, visa required, or document not recognized), alongside real travel experiences from other holders. Success means a holder can quickly see their realistic options and trust the answer enough to take the next step: an application, an embassy contact, or a trip.

## Positioning

Mainstream visa checkers are built for passports and largely ignore refugee travel documents. RTD Travel Check is specific to US-issued RTDs and grounded in first-hand reports from a real community of holders, with those reports captured automatically from the Telegram group.

## Operating Context

- Four views: Globe (world map by visa status), Directory (searchable country table), Stories (community experiences), and AI Chat.
- Community reports come in two ways: a multi-step submission form (country, travel date, visa type, processing time, difficulty 1–5, green-card status, entry experience, tips, optional author name) and a Telegram bot that pulls structured reports out of group messages with an LLM.
- The AI chat answers from site data only (official rules plus community reports), giving the official rule first.
- Embassy directory data (US-based embassies: name, website, phone, address) supports the next step after browsing.

## Capabilities and Constraints

- Next.js 15 (App Router), React 18, Tailwind 3, Neon Postgres, deployed on Vercel; Gemini and Groq used for extraction and chat, each falling back to the other.
- **Mobile-first:** most use is on phones. Mobile has a bottom tab bar and opens on the Directory instead of the Globe.
- **Trust order: official first, community adds.** Official or known rules are the baseline; community reports add lived detail. Neither replaces checking with the embassy or airline, and the site says so.
- Canonical visa status labels (decided 2026-11-19): **Visa Free · E-Visa · Visa on Arrival · Visa Required · Not Recognized**. `data.json` still stores older wording ("Visa not required", "E-visa", "Does not recognize US issued Refugee Travel Document"); the UI maps it to these labels.
- Submissions are spam-filtered and rate-limited on the client.

## Brand Commitments

- Name: **RTD Travel Check**.
- Standing disclaimer: community-driven information; always verify with official sources.
- Visual standard (decided 2026-11-19): the site follows its category's conventions (a clean visa-checker list, flag, country, status) executed at full craft, not a themed visual world. Quality bar: Stripe Docs/Dashboard and Apple Settings/Health.
- Must never feel like a glossy travel ad, or like an anonymous forum where report age and reliability are invisible.

## Evidence on Hand

- `data.json`: 99 countries with visa requirement, duration, and notes.
- `embassies.json`: embassy contacts per country (sourced from Wikidata plus `scripts/embassy-supplements.json`).
- Live community experiences in the Neon `experiences` table, with helpful votes and monthly counts.
- No testimonials, press, usage figures, or partner endorsements exist; future work must not invent them.

## Product Principles

1. **Show what's possible at a glance.** Browsing is the main job, so country status must read instantly, on a phone first.
2. **Official baseline, lived detail on top.** Always make clear which is which.
3. **Honest about uncertainty.** Rules for RTDs change and vary by case; mark reports with dates and never claim certainty the data can't support.
4. **The community is the source.** Contributing a report should be easy and feel worthwhile.
