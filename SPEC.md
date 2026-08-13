# SPEC — WebCV: Personal Portfolio Website

## 1. Overview

A personal portfolio website that presents you — background, work, and
interests — to new people, companies, and recruiters. It consolidates your
CV, project report, internship report, and extracurricular activities into a
single professional, responsive site you can confidently link or hand out in
any context (job applications, networking, LinkedIn bio, etc.).

| | |
|---|---|
| **Status** | Draft |
| **Owner** | asaiyan195@gmail.com |
| **Last updated** | 2026-08-11 |

## 2. Goal

Build a professional personal website that you can present to people at any
company, giving them a fast, credible picture of who you are, what you've
built, and how to reach you.

## 3. Audience & Purpose

- **Primary audience:** hiring managers, recruiters, and companies evaluating
  you for roles or opportunities.
- **Secondary audience:** peers, collaborators, professors — anyone you'd
  network with.
- **Purpose per audience:** answer, within seconds of landing on the page,
  three questions — *who are you, what have you done, how do I contact you.*

## 4. Scope

**In scope**
- A multi-page responsive personal site: a **Home** page plus dedicated
  **Experience** and **Projects** pages (see §7).
- Sections/pages synthesized from: your CV, project report, internship
  report, and extracurriculars.
- An **extensible content model** for Experience and Projects so new
  entries (a new internship, job, or project) can be added later by adding
  one data entry — no page redesign or markup duplication required (§7.5).
- A clear, always-visible way to contact you (email at minimum).
- Mobile and desktop layouts.

**Out of scope** *(unless you want to pull these in later)*
- A CMS or admin panel — content is edited by hand in code/markdown, not via
  a live editor.
- Blog/CMS-driven articles (a static "writing" section is fine if desired,
  but a full blogging engine is not required).
- User accounts, comments, analytics dashboards, or backend databases.
- Multi-language support.

## 5. Constraints

- **Content coverage:** the site must surface, at minimum —
  - Contact info (email, and optionally LinkedIn/GitHub/phone).
  - Work / experience (from internship report + CV).
  - Interests.
- **Source material:** all content is derived from four inputs (§6) — no
  invented credentials or projects.
- **Device support:** must render and be usable on both phones and laptops
  (see §8 for concrete breakpoints/testing).
- **Tone:** professional — this is shown to companies, not a casual/personal
  blog aesthetic.

## 6. Inputs

| Source | What it feeds into |
|---|---|
| CV | About/summary, education, skills, work experience, contact details |
| Project report | Projects page — one entry per project (problem, approach, tech stack, outcome, links); more projects can be added later as additional entries |
| Internship report | Work Experience page — one entry (role, company, duration, responsibilities, impact) under the same "work experience" list as any future job/internship |
| Extracurriculars | A dedicated "Beyond work" / activities section (clubs, competitions, volunteering, sports, etc.) |

**Action needed before content freeze:** gather/confirm these four source
documents in one place (e.g. a `content/` folder) so the site is built from
a single source of truth rather than re-typed from memory.

## 7. Site Structure & Content Sections

The site is **multi-page**: a Home page for the fast overview, plus a
dedicated page each for Experience and Projects — both built to grow over
time (new internships/jobs, new projects) without needing a redesign.

### 7.1 Navigation (all pages)

A persistent top nav present on every page:

`Home` · `Experience` · `Projects` · `Contact` (anchor on Home, or its own
section) — current page indicated with the primary orange accent (§9.1).
Logo/name on the left links back to Home.

### 7.2 Home page (`/`)

1. **Hero / Header**
   - Name, one-line professional tagline (e.g. role + specialization).
   - Primary CTA buttons: "Contact me" (mailto) and "Download CV" (PDF).
2. **About**
   - Short bio (3–5 sentences) synthesized from the CV: background,
     current focus, what you're looking for.
3. **Skills**
   - Grouped (e.g. Languages, Frameworks/Tools, ML/Data, Other) rather than
     one long unsorted list.
4. **Highlights strip** *(optional but recommended)*
   - 2–3 top picks pulled from Experience/Projects with a "See all →" link
     into the respective page, so Home stays short while still teasing the
     fuller pages.
5. **Extracurriculars**
   - Clubs, competitions, volunteering, leadership roles — shows dimension
     beyond coursework/work.
6. **Contact**
   - Email (required), plus optional LinkedIn, GitHub, phone.
   - Prefer a visible `mailto:` link and/or simple contact form (static form
     via a service like Formspree if a backend isn't wanted).
7. **Footer**
   - Quick links (Home/Experience/Projects/Contact), copyright/last-updated
     line. Shared across all pages.

### 7.3 Experience page (`/experience`)

**"Work Experience"** — a single reverse-chronological list that holds
*every* work entry under one umbrella, not a separate "internship" section.
Internships are simply entries in this list tagged accordingly, so a future
full-time role, second internship, freelance gig, or research assistantship
slots into the same page the same way.

Each entry renders from the schema in §7.5 and shows: role/title,
organization, an entry-type badge (Internship / Full-time / Part-time /
Freelance / Volunteer), dates, and 2–4 bullet points of impact (favor
quantified outcomes, pulled from the internship report for the current
entry).

### 7.4 Projects page (`/projects`)

A grid/list of project cards built from the project report(s) and, over
time, any additional projects you add. Each card (schema in §7.5): title,
one-line summary, tech-stack tags, links (repo/demo), and a short
outcome/result line. Optionally support a "featured" flag (uses the
Shokugeki-crimson accent from §9.1, sparingly) to pin standout projects to the
top regardless of date.

Each card links through to its own detail page (`/projects/<slug>`,
resolved — decided, see PLAN.md §2) with the fuller description, tech
stack, outcome, and links (repo/demo/report/slides).

### 7.5 Extensible content model

To satisfy "add any project/experience later without touching the page
itself," both pages render from data, not hand-written per-entry markup.
One card/list-item template per page consumes a list of entries; adding
content means appending an entry to the data file — the template and page
layout don't change.

**Work experience entry**
```yaml
- type: internship        # internship | full-time | part-time | freelance | volunteer
  role: "Software Engineering Intern"
  organization: "Company Name"
  location: "City, Country"        # optional
  start_date: "2025-06"
  end_date: "2025-08"              # or "Present"
  bullets:
    - "Impact bullet 1 (quantified where possible)"
    - "Impact bullet 2"
  tags: ["Python", "PyTorch"]      # optional
  link: "https://company.example"  # optional
```

**Project entry**
```yaml
- title: "Project Name"
  summary: "One-line description of what it does."
  description: "Longer paragraph, optional."
  tech_stack: ["PyTorch", "Flask"]
  outcome: "Short result/impact line, e.g. a metric or what it unlocked."
  links:
    repo: "https://github.com/you/project"
    demo: "https://project-demo.example"   # optional
  thumbnail: "images/projects/project-name.png"  # optional
  featured: false
  date: "2025-11"                          # optional, for sort order
```

New entries are appended to `content/experience.yaml` /
`content/projects.yaml` (see §12) — the site should not require editing
HTML/CSS or duplicating a card's markup to add one more item.

## 8. Non-Functional Requirements

### 8.1 Responsiveness (acceptance-critical)
- Fluid/responsive layout using relative units and a mobile-first CSS
  approach (flexbox/grid), not fixed pixel widths.
- Verify at minimum these breakpoints:

| Breakpoint | Target devices |
|---|---|
| ≤ 480px | Small phones |
| 481–768px | Large phones / small tablets |
| 769–1024px | Tablets / small laptops |
| ≥ 1025px | Laptops / desktops |

- No horizontal scrolling at any breakpoint; tap targets ≥ 44px on touch
  devices; text legible without zooming.
- Manually test on: one real or emulated phone (portrait + landscape), one
  laptop browser window, and a resized desktop browser (down to ~360px wide)
  before calling this done.

### 8.2 Performance
- Fast first load: optimized/compressed images, no unnecessary heavy
  frameworks for a mostly-static site.
- Target: Lighthouse performance score ≥ 90 on both mobile and desktop
  profiles.

### 8.3 Accessibility
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- Sufficient color contrast (WCAG AA), alt text on all images, keyboard
  navigable links/buttons.

### 8.4 SEO / shareability
- Descriptive `<title>` and meta description.
- Open Graph tags so the link previews well when shared (LinkedIn, email,
  Slack, etc.).
- A custom favicon.

### 8.5 Browser support
- Latest two versions of Chrome, Safari, Firefox, Edge — desktop and mobile.

## 9. Presentation & Visual Design

- **Style:** clean, professional, generous whitespace — content and
  credibility should carry the page, not decoration. The palette below
  should read as "warm, confident, deliberate accent color," not as
  fan-art — no character art, jutsu graphics, Jolly Roger, or knife/fire
  iconography on the actual page.

### 9.1 Color palette — three-anime blend (Naruto / One Piece / Food Wars)

One accent color per series — Naruto's jumpsuit orange, One Piece's straw
hat gold, and Food Wars' shokugeki crimson — plus a shared navy/cream base
pair, adapted into a palette that still passes WCAG AA contrast for a
professional site. One dominant accent, not five competing ones.

| Role | Color | Hex | Source |
|---|---|---|---|
| Primary accent (CTAs, links, section highlights) | Naruto Orange | `#E8611C` | *Naruto* — his jumpsuit |
| Primary accent — hover/active | Deep Orange | `#C74C10` | *Naruto* — darker jumpsuit shade |
| Secondary accent (tags, small highlights, focus rings) | Straw Hat Gold | `#8A6116` | *One Piece* — Luffy's straw hat |
| Rare highlight (badges, "featured" flags — use sparingly) | Shokugeki Crimson | `#C81E3A` | *Food Wars* — the title/battle red |
| Dark base (text, dark-mode background, header/footer) | Shinobi Navy | `#1B1F2A` | *Naruto* — night-mission navy-black |
| Light base (page background, light mode) | Scroll Cream | `#FBF6EE` | *Naruto* — ninja scroll / bandage cream |
| Surface (cards, panels) — light mode | Warm White | `#FFFFFF` | — |
| Surface (cards, panels) — dark mode | Deep Slate | `#242938` | — |
| Body text — light mode | Ink | `#232323` | — |
| Body text — dark mode | Off-White | `#EDEAE3` | — |
| Metal accent (dividers, icon strokes, subtle borders) | Headband Steel | `#9CA3AF` | *Naruto* — forehead protector plate |

**Usage rules**
- Orange (`#E8611C`) is the *one* recurring brand color: nav highlight,
  primary buttons, link color, active section indicator. Don't dilute it by
  also using gold/crimson at that same frequency.
- Gold and crimson are accents only — e.g. gold for tech-stack tags or a
  "currently open to work" badge; crimson reserved for a single standout
  element (e.g. a "featured project" ribbon), not body copy or repeated UI.
- Navy/cream are the base pair: light mode = cream background + navy text;
  dark mode = navy background + off-white text. Don't mix warm cream with
  dark-mode navy in the same view.
- Verify contrast pairs before shipping: orange-on-cream and
  navy-on-cream both need a contrast checker pass for WCAG AA
  (orange text on white/cream is the one combination likely to need
  darkening — prefer using orange for large UI elements/buttons with white
  text on top, rather than as small body text on a light background). The
  gold and crimson accents above are already the darkened, text-safe shades
  (deep straw gold rather than bright yellow, deep crimson rather than
  bright red) — don't swap in a brighter/lighter tone for body text.

### 9.2 Typography & consistency
- One heading font + one body font (system font stack is fine and fast);
  consistent type scale across sections.
- Shared spacing/card/button styles reused across Home, the Experience page,
  and the Projects page (and their card templates, §7.5) so the site reads
  as one system across pages, not a different template per page.
- Buttons/links use the primary orange consistently; hover states use the
  darker orange shade, not an unrelated color.

### 9.3 Dark mode
- Recommended, and a natural fit here: light mode = Scroll Cream background
  (§9.1), dark mode = Shinobi Navy background — both already defined above.
  Respect `prefers-color-scheme` if implemented; accent orange stays the
  same in both modes.

### 9.4 Imagery
- A professional photo (optional but recommended) in the hero; project cards
  may include a screenshot/thumbnail where available.
- Keep photography/screenshots realistic and professional — the anime
  influence lives entirely in the color palette and stays out of imagery,
  iconography, and copy.

## 10. Acceptance Criteria

| # | Criterion | How verified |
|---|---|---|
| 1 | Site displays correctly with no layout breakage on phone-width and laptop-width viewports | Manual test at breakpoints in §8.1 |
| 2 | Email (and any other contact method) is visible/reachable within one click from the landing view or top nav | Manual click-through |
| 3 | Work Experience page reflects internship report content accurately, as one entry in the work-experience list | Content review against source doc |
| 4 | Interests/extracurriculars are represented | Content review |
| 5 | Site loads and is usable without console errors on latest Chrome (desktop + mobile emulation) | Manual/dev-tools check |
| 6 | Page is presentable as-is to a company (no placeholder/lorem-ipsum text, no broken links) | Final content pass |
| 7 | Nav links between Home, Experience, and Projects work on both phone and laptop layouts | Manual click-through at breakpoints in §8.1 |
| 8 | Adding a new project or work-experience entry only requires appending an entry to `content/projects.yaml` / `content/experience.yaml` (§7.5) — no HTML/CSS edits | One dry-run: add a dummy entry, confirm it renders correctly, then remove it |

**Definition of done:** all eight criteria above pass, on a real deployed
URL (not just localhost), so it can actually be shared/presented.

## 11. Tech Approach — decided

**Astro**, chosen over Eleventy/plain-HTML/React (see PLAN.md §2). Pages
read `content/experience.yaml` / `content/projects.yaml` directly at build
time via a small loader (`src/lib/content.ts`, using `js-yaml`) rather than
Astro's content-collections API — same "append an entry, no markup
changes" property, without requiring the data files to move into `src/`.

**Deployment: GitHub Pages** (decided, PLAN.md §2), via
`.github/workflows/deploy.yml` (official `actions/deploy-pages` flow,
triggered on push to `main`). `astro.config.mjs` sets `site` + `base` for
the project-pages URL style (`https://<username>.github.io/WebCV/`) — the
username placeholder there still needs filling in before the first deploy,
and the repo's Pages source needs setting to "GitHub Actions" once.

## 12. Project Structure (as built)

```
WebCV/
├── SPEC.md · PLAN.md · README.md
├── package.json · astro.config.mjs · tsconfig.json
├── .github/workflows/deploy.yml     # GitHub Pages deploy on push to main
├── content/
│   ├── *.pdf                        # source CVs/reports (not served directly)
│   ├── cv.md / internships.md / projects.md / extracurriculars.md   # curated prose sources
│   ├── experience.yaml              # work experience list (schema §7.5); append to add more
│   └── projects.yaml                # project list (schema §7.5); append to add more
├── public/
│   ├── favicon.svg · resume.pdf
│   ├── documents/                   # report/slide PDFs actually served (linked from projects.yaml)
│   └── images/{experience,projects}/
└── src/
    ├── lib/content.ts               # reads content/*.yaml at build time (js-yaml)
    ├── pages/
    │   ├── index.astro              # Home (§7.2)
    │   ├── experience.astro         # Experience page (§7.3)
    │   └── projects/
    │       ├── index.astro          # Projects grid (§7.4)
    │       └── [slug].astro         # per-project detail page
    ├── components/
    │   ├── Layout.astro · Nav.astro · Footer.astro
    │   └── ExperienceCard.astro · ProjectCard.astro
    └── styles/global.css            # palette (§9.1) + responsive base styles
```

## 13. Milestones

1. **M1 — Content consolidation**: gather CV, project report, internship
   report, extracurriculars into `content/`; write section copy; set up
   `experience.yaml` and `projects.yaml` with the schema in §7.5 and one
   real entry each (the current internship, the current project(s)).
2. **M2 — Structure & static layout**: build Home, Experience, and Projects
   pages (§7.2–§7.4) with the shared nav (§7.1) and card templates driven
   by the data files, placeholder styling, mobile-first.
3. **M3 — Visual design pass**: apply palette/typography (§9), add
   photo/project thumbnails.
4. **M4 — Responsiveness & QA**: verify breakpoints, accessibility,
   performance (§8), fix issues; dry-run adding a throwaway entry to each
   data file to confirm the extensibility criterion (§10, #8).
5. **M5 — Deploy**: publish to a live URL, verify acceptance criteria (§10)
   on the deployed site, attach custom domain if desired.

## 14. Open Questions

- ~~Do you want a downloadable PDF resume button, or is the site itself
  meant to *be* the resume?~~ — resolved: downloadable PDF button
  (Home hero + Contact section link to `/resume.pdf`).
- ~~Any existing brand/color preference~~ — resolved: three-anime blend
  (Naruto / One Piece / Food Wars) palette (§9.1), orange as primary accent.
- ~~Single-page scroll site, or separate pages per section~~ — resolved:
  multi-page, with dedicated `/experience` and `/projects` pages (§7), plus
  a detail page per project (§7.4).
- ~~Preferred hosting~~ — resolved: GitHub Pages (§11).

Still genuinely open (see PLAN.md §6): the GitHub username in
`astro.config.mjs`'s `site` field, and the "what I'm currently looking
for" line in the Home page About section.
