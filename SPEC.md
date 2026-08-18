# SPEC — WebCV: Personal Portfolio Website

| | |
|---|---|
| **Status** | Draft |
| **Owner** | asaiyan195@gmail.com |
| **Last updated** | 2026-08-17 |

## 1. Overview & Goal

A multi-page personal portfolio site consolidating your CV, project report,
internship report, and extracurriculars into one professional site you can
confidently link to companies, recruiters, and collaborators. Within
seconds of landing, a visitor should know **who you are, what you've built,
and how to reach you.**

## 2. Scope

**In scope**
- Multi-page responsive site: **Home**, **About**, **Experience**,
  **Projects** (+ per-project detail pages), shared nav/footer.
- Content synthesized from CV, project report, internship report,
  extracurriculars — no invented credentials.
- **Data-driven** Experience/Projects pages — new entries append to a YAML
  file, no markup changes (§5).
- **Three switchable visual themes** — Food Wars (default), Naruto (dark
  mode), Fairy Tail (alternate) — see §7.
- Mobile + desktop layouts, always-visible contact info (email minimum).

**Out of scope**
- CMS/admin panel, blog engine, user accounts/comments/analytics,
  multi-language support.

## 3. Inputs

| Source | Feeds into |
|---|---|
| CV | About page, education, skills, contact |
| Project report | Projects page — one entry per project |
| Internship report | Experience page — one entry under "work experience" |
| Extracurriculars | "Beyond work" section on About, with per-theme
  decorative background elements (§7.6) |

Gather all four into `content/` before content freeze — single source of
truth, not re-typed from memory.

## 4. Site Structure

**Nav (all pages):** `Home · About · Experience · Projects · Contact`, plus
a **theme switcher rendered as a 3-point slider** (Food Wars — Naruto —
Fairy Tail, left to right) in the nav on every page — one shared, global
control, not a per-page setting. Dragging or clicking a stop re-themes the
entire current page instantly and the choice carries to every other page
on navigation. Current nav page and current theme are both indicated via
the active theme's accent; logo/name links Home.

- **Home (`/`)** — hero (name, tagline, "Contact me" + "Download CV" CTAs) →
  About teaser → Highlights strip (2-3 top picks, "See all →") → Contact →
  footer.
- **About (`/about`)** — full bio (3–5 sentences), education table, skills
  grouped by category, **extracurriculars with themed background
  elements** (§7.6), repeat CTA.

**Contact & social links** — email is the required minimum; GitHub
(https://github.com/Dasa108) and LinkedIn
(https://www.linkedin.com/in/sudarshana-chaitanya-b-n-935167319) are shown
alongside it, not buried in a single icon-only row:
- **Footer**, every page — plain text links, always visible regardless of
  scroll position.
- **Contact section**, Home and About — next to the email line and as
  `.btn-secondary` buttons in the CTA row (`Contact me` / `Download CV` /
  `GitHub` / `LinkedIn`).
All three (email/GitHub/LinkedIn) are defined once in `src/lib/site.ts` and
imported everywhere they're used, so there's a single place to update if
any of them change.
- **Experience (`/experience`)** — single reverse-chronological work list
  (internships, jobs, freelance, volunteer all tagged in one list, not
  separated). Each entry: role, org, type badge, dates, 2–4 impact bullets.
  The connecting visual motif **changes with the active theme** (§7.5):
  - **Naruto (dark mode):** the original gnarled tree trunk — thick at top
    (most recent), tapering to a root at the bottom, thorn accents, a nod
    to the God-Tree/Ten-Tails silhouette without literal character art.
  - **Food Wars:** a glossy stream of melted butter running down the page
    in place of the trunk — a warm golden ribbon with soft highlight/sheen
    gradients and small pooling "drips" at each entry, alternating
    left/right the same way the trunk's branches did.
  - **Fairy Tail:** a chain of abstract elemental magic circles/orbs (fire,
    water, ice, lightning) connecting entries, linked by a thin glowing
    line — each entry's orb colored by its element, no guild emblem or
    character silhouettes.
  All three collapse to a single-side layout below 768px (§6).
- **Projects (`/projects`)** — card grid (title, one-line summary, tech
  tags, links, outcome line); optional "featured" flag using the active
  theme's rare-highlight accent, sparingly; each card → its own
  `/projects/<slug>` detail page.


## 5. Extensible Content Model

Both pages render from YAML, not hand-written markup — adding content means
appending an entry to `content/experience.yaml` or `content/projects.yaml`.

```yaml
# experience.yaml entry
- type: internship        # internship | full-time | part-time | freelance | volunteer
  role: "Software Engineering Intern"
  organization: "Company Name"
  start_date: "2025-06"
  end_date: "2025-08"      # or "Present"
  bullets: ["Quantified impact 1", "Quantified impact 2"]
  tags: ["Python", "PyTorch"]     # optional
  link: "https://company.example" # optional

# projects.yaml entry
- title: "Project Name"
  summary: "One-line description."
  description: "Longer paragraph, optional."
  tech_stack: ["PyTorch", "Flask"]
  outcome: "Short result/impact line."
  links: { repo: "...", demo: "..." }
  thumbnail: "images/projects/name.png"  # optional
  featured: false
  date: "2025-11"          # optional, sort order
```

## 6. Non-Functional Requirements

- **Responsive:** mobile-first flex/grid, no fixed pixel widths. Test at
  ≤480px, 481–768px, 769–1024px, ≥1025px — no horizontal scroll, tap
  targets ≥44px.
- **Performance:** Lighthouse ≥90 (mobile + desktop), compressed images, no
  heavy frameworks. Theme assets (butter-stream/magic-circle SVGs) should
  be lightweight inline SVG, not large raster images, to keep this intact
  across all three themes.
- **Accessibility:** semantic HTML, WCAG AA contrast **in all three
  themes**, alt text, keyboard navigable, theme switcher operable via
  keyboard.
- **SEO/shareability:** descriptive title/meta, Open Graph tags, favicon.
- **Browser support:** latest two versions of Chrome, Safari, Firefox, Edge.

## 7. Visual Design

Clean, professional, generous whitespace — content carries the page. Anime
influence lives entirely in palette, the Experience-page connector motif,
and light extracurriculars decoration (§7.6) — never in character art,
jutsu graphics, guild emblems, or knife/fire iconography used literally.

### 7.1 Theme system

The site ships **three selectable themes**, not just a light/dark toggle:
**Food Wars** (default, light), **Naruto** (dark mode — its palette already
reads as a night/dark aesthetic, so it's repurposed as the dark-mode
option rather than sitting alongside light mode), and **Fairy Tail**
(alternate, magic-toned).

**Control:** a single **3-point slider** in the nav — three fixed stops,
Food Wars / Naruto / Fairy Tail left to right — not a dropdown or a pair of
toggle buttons. It's a **global, site-wide** control: it lives in the
shared `Nav.astro`, so it renders identically on Home/About/Experience/
Projects, and one choice governs the whole site at once rather than being
set per page.

**Mechanics:** implemented as CSS custom properties swapped via a
`data-theme` attribute on `<html>`, driven by the slider's position;
choice persists to `localStorage` and is re-applied on every page load so
navigating between pages never resets it. `prefers-color-scheme` can set
the initial Food Wars/Naruto stop on first visit; Fairy Tail is always an
explicit opt-in via the slider. The slider itself must be reachable by
keyboard (arrow keys move between the three stops) and announce the
selected theme to screen readers. Shared spacing/type scale/card/button
styles stay identical across themes — only color tokens and the
Experience-page connector motif change.

### 7.2 Food Wars theme (default / light)

| Role | Color | Hex |
|---|---|---|
| Background | Plating Cream | `#FFF9F0` |
| Primary accent (CTAs, links, active nav) | Shokugeki Crimson | `#E8283F` |
| Primary accent — hover/active | Deep Crimson | `#C0142B` |
| Secondary accent (tags, badges, focus rings) | Golden Saffron | `#F5A623` |
| Rare highlight ("featured" flags) | Butter Amber | `#E8A33D` |
| Surface (cards/panels) | `#FFFFFF` |
| Body text | Ink `#232323` |

Crimson is the one recurring brand color at this theme's high frequency —
buttons and large UI elements with white text on top, not small body copy
on cream (check contrast before shipping). Gold is for tags/badges; amber
reserved for the sparing "featured" flag.

### 7.3 Naruto theme (dark mode)

| Role | Color | Hex |
|---|---|---|
| Background | Shinobi Navy | `#1B1F2A` |
| Primary accent (CTAs, links, active nav) | Naruto Orange | `#E8611C` |
| Primary accent — hover/active | Deep Orange | `#C74C10` |
| Secondary accent (tags, badges, focus rings) | Rasengan Blue | `#4FA8E8` |
| Rare highlight ("featured" flags) | Sage Gold | `#D6A419` |
| Surface (cards/panels) | Deep Slate `#242938` |
| Body text | Off-White `#EDEAE3` |
| Metal accent (dividers, tree-trunk strokes) | Headband Steel | `#9CA3AF` |

Orange remains the single dominant accent; blue is reserved for small
highlights/focus states so it doesn't compete with orange.

### 7.4 Fairy Tail theme (alternate)

| Role | Color | Hex |
|---|---|---|
| Background | Guildhall Indigo | `#241B3A` |
| Primary accent (CTAs, links, active nav) | Dragon-Flame Coral | `#FF6B4A` |
| Primary accent — hover/active | Deep Ember | `#D9502F` |
| Secondary accent (tags, badges, focus rings) | Celestial Gold | `#FFD166` |
| Rare highlight ("featured" flags) | Titania Scarlet | `#D7263D` |
| Elemental accent set (Experience-page orbs only, §4) | Fire `#FF6B4A` · Water `#3FA7D6` · Ice `#8FE3FF` · Lightning `#F5E663` |
| Surface (cards/panels) | `#2E2350` |
| Body text | Pale Lavender `#EDE7F6` |

Coral is the dominant accent (buttons/links); gold and scarlet stay rare
accents exactly as in the other two themes. The elemental set is scoped
only to the Experience-page connector orbs (§4) — it doesn't leak into
buttons or body UI, keeping "one dominant accent" true in every theme.

### 7.5 Cross-theme consistency

- Every theme keeps the same contrast discipline: verify AA for primary
  accent vs. background at each theme's actual color pair before shipping,
  not just the original Food Wars pair.
- One heading font + one body font (system stack), identical type scale,
  spacing, card, and button geometry reused across all three themes — only
  color tokens and the Experience connector motif differ.
- Photos/screenshots stay realistic and professional in every theme; the
  anime influence never touches imagery or copy.

### 7.6 Extracurriculars background elements & entities (About page)

The extracurriculars section (§4) is the one place on the site that leans
fully playful — everywhere else stays professional-first, but here a set
of **original chibi-proportioned pixel-art mascots** carries real visual
weight, plus a light theme-matched decorative background:

- **Chibi mascots, one per activity/club entry:** each extracurricular
  item (club, competition, volunteering, sport) gets its own small
  original chibi-proportioned pixel-art figure next to it — big head,
  small body, simple expressive eyes, in the chibi *style* popularized by
  fan art, but each figure is an **original design**: original silhouette,
  outfit, color story, and props tied loosely to the activity itself
  (e.g. a mascot holding a trophy for a competition, a mascot with a
  book for an academic club) rather than to any specific licensed
  character. No character's actual hairstyle, outfit, insignia, or
  signature prop is reproduced.
- **Theme recoloring, not redesign:** the same mascot roster is recolored
  per active theme using that theme's palette (§7.2–7.4) — Food Wars
  theme tints mascots warm crimson/gold, Naruto theme tints them navy/
  orange, Fairy Tail tints them indigo/coral — so switching the slider
  restyles the whole extracurriculars page including its mascots, without
  swapping in different character designs per theme.
- **Background:** a faint theme-matched decorative layer behind the
  section — steam-wisp/plating-splatter shapes (Food Wars), leaf
  silhouettes + a chakra-spiral watermark (Naruto), or magic-circle rings
  + elemental sparkle particles (Fairy Tail) — kept abstract/geometric,
  no logos or emblems.

All mascots share one pixel-art grid/sprite size/outline weight so the
roster reads as one consistent system across entries and across themes.
Still no likeness of any specific copyrighted character — "chibi" here
describes the art style (proportions, simple linework), not a copy of an
existing character redrawn smaller.

## 8. Acceptance Criteria

1. No layout breakage at any breakpoint (§6), **in all three themes** —
   manual test.
2. Email reachable within one click from landing view or nav.
3. Experience page accurately reflects the internship report, as one entry
   in the unified work list.
4. Extracurriculars represented, with one original chibi-proportioned
   mascot per entry plus theme-matched background elements (§7.6)
   rendering correctly per theme.
5. No console errors, latest Chrome (desktop + mobile emulation), across
   all three themes.
6. No placeholder/lorem-ipsum text, no broken links.
7. Nav works between all pages, both phone and laptop layouts.
8. Adding a project or experience entry requires only appending to the
   relevant YAML — no HTML/CSS edits (dry-run: add + remove a dummy entry).
9. The 3-point theme slider is present and in sync on every page, moves
   correctly between all three stops (click, drag, and arrow-key), re-
   themes the whole page including the Experience-page connector motif
   (tree / butter stream / magic orbs), and persists the choice across a
   reload and across navigation.

**Done** = all nine criteria pass on a live deployed URL, not just
localhost.

## 9. Tech Approach — decided

**Astro**, reading `content/experience.yaml` / `content/projects.yaml` at
build time via `src/lib/content.ts` (`js-yaml`), not Astro's content
collections. Theme system: CSS custom properties per theme, swapped via a
`data-theme` attribute on `<html>` driven by a single global 3-point
slider component (`ThemeSwitcher.astro`) living in `Nav.astro` so it's
present, in sync, and reachable identically on every page; choice
persisted to `localStorage` and re-read on each page load. The Experience
page's connector renders as inline SVG and reads the same `data-theme`
attribute to pick tree / butter-stream / magic-orb markup. **Deployment:
GitHub Pages** via `.github/workflows/deploy.yml`
(`actions/deploy-pages`, triggered on push to `main`).

## 10. Project Structure

```
WebCV/
├── SPEC.md · PLAN.md · README.md
├── package.json · astro.config.mjs · tsconfig.json
├── .github/workflows/deploy.yml
├── content/
│   ├── *.pdf, cv.md, internships.md, projects.md, extracurriculars.md
│   ├── experience.yaml
│   └── projects.yaml
├── public/
│   ├── favicon.svg · resume.pdf
│   ├── documents/
│   └── images/{experience,projects,mascots}/
└── src/
    ├── lib/content.ts
    ├── lib/theme.ts               # theme toggle + localStorage persistence
    ├── lib/site.ts                # email/GitHub/LinkedIn — single source of truth (§4)
    ├── pages/ (index, about, experience, projects/index, projects/[slug])
    ├── components/
    │   ├── Layout.astro · Nav.astro · Footer.astro · ThemeSwitcher.astro
    │   ├── ExperienceCard.astro · ProjectCard.astro
    │   └── connectors/ (TreeConnector.astro · ButterConnector.astro ·
    │       MagicConnector.astro)
    └── styles/
        ├── global.css              # shared layout/type/spacing
        └── themes/ (foodwars.css · naruto.css · fairytail.css)
```

## 11. Milestones

1. **M1** — Content consolidation into `content/`; seed `experience.yaml` /
   `projects.yaml` with one real entry each.
2. **M2** — Build Home/About/Experience/Projects with shared nav + data-
   driven card templates, mobile-first, placeholder styling.
3. **M3** — Apply the three theme palettes (§7.2–7.4), build the
   ThemeSwitcher and per-theme Experience connectors (tree / butter stream
   / magic orbs), add extracurriculars background elements (§7.6), add
   photo/thumbnails.
4. **M4** — QA breakpoints, accessibility, and performance **across all
   three themes**; dry-run the extensibility criterion (§8, #8) and the
   theme-persistence criterion (§8, #9).
5. **M5** — Deploy to a live URL, verify all acceptance criteria on the
   deployed site.

## 12. Open Questions

Still open: the GitHub username in `astro.config.mjs`'s `site` field, and
the "what I'm currently looking for" line on the About page.