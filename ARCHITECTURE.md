# ARCHITECTURE — how this site works, and why

This doc exists so you can explain this project to someone else — a
teammate, a code reviewer, or an interviewer — without having to remember
every decision from scratch. It covers **what each piece does**, **why it
was built that way instead of some other way**, and **what actually broke
along the way** (which tends to be the most interesting part of any
interview answer).

New terms are linked the first time they show up — click through if
something's unfamiliar rather than getting stuck on it. §12 at the bottom
also collects every link in one table for quick reference.

Companion docs: [`SPEC.md`](./SPEC.md) is the requirements doc (what the
site must do). [`PLAN.md`](./PLAN.md) is the execution tracker (what's
done, what's still open). This doc is the "how it's built and why."

---

## 1. The 30-second pitch

> "It's a personal portfolio site built with [Astro](https://astro.build),
> a [static site generator](https://www.cloudflare.com/learning/performance/static-site-generator/).
> Content — my CV, work experience, and projects — lives as plain
> [YAML](https://yaml.org)/Markdown files, completely separate from the
> page code. At build time, Astro reads that data and pre-renders every
> page to plain HTML/CSS, which gets deployed to
> [GitHub Pages](https://docs.github.com/en/pages) via a
> [GitHub Actions](https://docs.github.com/en/actions) pipeline that runs
> automatically on every push. Because content and code are separate,
> adding a new project or job later means editing one YAML file — no
> HTML, no redesign, no redeploy button to remember to press."

If you remember only one sentence from this document, remember that one —
it answers "walk me through your project" in one breath and naturally
invites follow-up questions you're prepared for below.

---

## 2. Big picture: how a page gets from a YAML file to a URL

```
content/experience.yaml  ──┐
content/projects.yaml    ──┼──►  src/lib/content.ts  ──►  src/pages/*.astro  ──►  astro build  ──►  dist/*.html
                            │        (reads YAML,            (templates,          (static site
                            │         parses it,               loops over          generator)
                            │         returns typed             the data)
                            │         JS objects)
                            │
                            ▼
                  (build-time only — this
                   code never runs in the
                   visitor's browser)

dist/*.html + dist/_astro/*.css  ──►  GitHub Actions  ──►  GitHub Pages  ──►  https://dasa108.github.io/WebCV/
                                       (CI/CD pipeline)      (static file host)
```

Two things to internalize here, because they come up in almost every
follow-up question:

1. **Everything happens at [build time, not at request time](https://vercel.com/guides/what-is-the-difference-between-build-time-and-runtime).**
   There is no server that runs when someone visits the site. `astro build`
   runs once (in GitHub's CI runner, not in the visitor's browser),
   produces plain HTML/CSS files, and those files are what gets hosted.
   This is called **[static site generation (SSG)](https://www.cloudflare.com/learning/performance/static-site-generator/)**
   — see the glossary if that term is new.
2. **Content and code are two different layers that only meet at build
   time.** `content/*.yaml` doesn't know anything about HTML. `src/pages/
   *.astro` doesn't know anything about *this specific* internship or
   project — it just knows how to render *any* entry that matches the
   shape defined in `src/lib/content.ts`. That separation is the whole
   reason adding a new project is a one-file edit instead of a code change
   — see §4.

---

## 3. Why Astro? (and what a static site generator is)

**The problem to solve:** almost all of this site's content changes
rarely (my CV doesn't change daily) and there's no user login, no
database, no server-side logic — it's fundamentally a document, not an
application. Serving a full JavaScript app
([React](https://react.dev)/[Next.js](https://nextjs.org)
client-rendered) for that is solving a problem I don't have, at the cost
of a slower first load and more moving parts.

**The three real options I weighed** (this is recorded as a decision in
`SPEC.md` §11):

| Option | What it is | Why not chosen |
|---|---|---|
| Plain HTML/CSS/JS, no build step | Hand-write every page | No templating — adding a project means copy-pasting a whole card's HTML by hand, every time. Doesn't scale (this was the explicit requirement from `PLAN.md`). |
| [React](https://react.dev) / [Next.js](https://nextjs.org) | Full JS framework, client + server rendering | Overkill for a mostly-static content site; ships a JS framework runtime to the browser for pages that don't need interactivity. |
| **[Astro](https://astro.build)** (chosen) | Static site generator with component templating | Renders to plain HTML at build time (fast, simple hosting), but still lets you write reusable components and loop over data — the templating power of React without shipping React to the browser. |

**What "static site generator" means, concretely:** a program that takes
templates + data and produces `.html` files *before* anyone visits the
site, instead of generating HTML on-the-fly for each visitor (that's
**[server-side rendering (SSR)](https://developer.mozilla.org/en-US/docs/Glossary/SSR)**)
or in the visitor's browser with JavaScript (that's a
**[single-page app / client-side rendering](https://developer.mozilla.org/en-US/docs/Glossary/SPA)**).
Astro's default mode — which this project uses explicitly
(`output: 'static'` in [`astro.config.mjs`](https://docs.astro.build/en/reference/configuration-reference/))
— is SSG: build once, serve static files forever, until the next build.

**Why that's a good fit here:** static files are the simplest, cheapest,
fastest thing to host — a **[CDN](https://developer.mozilla.org/en-US/docs/Glossary/CDN)**
can cache them forever, there's no server to crash or patch, and GitHub
Pages hosts them for free. The tradeoff (you have to rebuild to see new
content) is a non-issue because publishing a new build is automatic (§7)
— it just takes a `git push`.

---

## 4. The content model — why `content/` is separate from `src/`

This is the single most important design decision in the project, and the
one most worth being able to explain well, because it's a *general*
software design principle ([separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)
— data separate from presentation), not just an Astro trick.

**The requirement** (from `PLAN.md` §3): adding a new internship or
project later should mean editing **one file**, never touching page
templates or CSS.

**How it's implemented:**

- `content/experience.yaml` and `content/projects.yaml` each hold a flat
  YAML **list** of entries. Each entry is a plain object — a role, an
  organization, some bullet points, some tags. Nothing in these files
  knows about HTML, colors, or layout.
- `src/lib/content.ts` is the *only* code that touches these files. It
  reads them with [Node's](https://nodejs.org) filesystem API
  (`node:fs`) and parses them with the
  [`js-yaml`](https://www.npmjs.com/package/js-yaml) library, and exposes
  typed functions ([TypeScript](https://www.typescriptlang.org) gives the
  "typed" part): `getExperience()`, `getProjects()`,
  `getProjectBySlug(slug)`.
- The page templates (`src/pages/*.astro`) call those functions and loop
  over whatever comes back — they render "however many entries exist,"
  never "these specific N entries."

So the flow for "add a new project" is: open `projects.yaml`, copy the
`TEMPLATE` comment block at the top of the file, fill in the fields, paste
it into the list, commit, push. The Projects page automatically shows one
more card, with zero code changes — because the page was never written to
know how many projects there are.

**Why YAML and not, say, a database or a CMS?**
- A database needs a server to run and a network call to query — pure
  overkill for a few dozen KB of text that changes maybe once a month.
- A [headless CMS](https://www.contentful.com/r/knowledgebase/headless-cms/)
  (like [Contentful](https://www.contentful.com) or
  [Sanity](https://www.sanity.io)) adds an external account, an API key,
  and a network dependency for content that's really just... my own text
  files. YAML in the same git repo means the content is
  version-controlled, diffable, and requires no third-party service.
- YAML specifically (over [JSON](https://www.json.org)) because it
  supports comments — which is what makes the in-file `TEMPLATE` block
  and field-by-field explanations possible. That "self-documenting
  schema" is what makes it usable by someone (future me) who doesn't
  remember the exact field names months later.

**Why not Astro's built-in "[Content Collections](https://docs.astro.build/en/guides/content-collections/)"
feature**, which is the idiomatic way most Astro tutorials handle this?
Content Collections expect one file per entry, living inside
`src/content/`. I deliberately kept the existing "one list file per type"
shape instead, for two reasons: (1) it's simpler to reason about —
"everything is in this one file" vs. "there's a new file per entry plus a
schema file," and (2) the whole point of a scratch-built loader
(`content.ts`) is full control — no framework "magic" between the YAML
and what actually renders, which makes debugging straightforward (it's
just a function call you can `console.log`).

---

## 5. Repo tour

```
WebCV/
├── SPEC.md              # requirements: what the site must do, and why
├── PLAN.md               # execution tracker: what's done, decisions log
├── ARCHITECTURE.md       # this file
├── package.json          # dependencies: astro, js-yaml
├── astro.config.mjs      # site config: static output, GitHub Pages URL/base path
├── .github/workflows/deploy.yml   # CI/CD pipeline (§7)
├── content/               # ← the "data layer" (§4)
│   ├── *.pdf                     # original source documents (CV, reports)
│   ├── cv.md, internships.md,    # human-readable prose notes,
│   │   projects.md, extracurriculars.md   #   not consumed by the site directly
│   ├── experience.yaml           # ← actually renders the Experience page
│   └── projects.yaml             # ← actually renders the Projects pages
├── public/                # ← static assets served AS-IS, unprocessed
│   ├── favicon.svg
│   ├── resume.pdf
│   ├── documents/                # report/slide PDFs linked from projects.yaml
│   └── images/{experience,projects}/
└── src/                    # ← the "presentation layer"
    ├── lib/content.ts             # reads content/*.yaml (§4, §6.1)
    ├── styles/global.css          # design tokens, responsive/dark mode (§6.4)
    ├── components/                # reusable page pieces (§6.2)
    │   ├── Layout.astro, Nav.astro, Footer.astro
    │   └── ExperienceCard.astro, ProjectCard.astro
    └── pages/                      # ← one file = one route (§6.3)
        ├── index.astro             # "/"
        ├── experience.astro        # "/experience"
        └── projects/
            ├── index.astro         # "/projects"
            └── [slug].astro        # "/projects/<anything>" — dynamic route
```

**One subtlety worth explaining if asked: why is there both `content/` and
`public/`?** They look similar (both hold "data") but serve opposite
purposes:
- [`public/`](https://docs.astro.build/en/basics/project-structure/#public)
  is copied **verbatim** into the deployed site — anything in here gets
  its own URL (`public/resume.pdf` → `/WebCV/resume.pdf`).
- `content/` is **never** copied to the deployed site — it's read at
  build time by `content.ts`, turned into HTML, and the original files
  stay private to the repo. This is *deliberate*: the raw PDFs and prose
  notes in `content/` don't need to be individually web-accessible; only
  the specific documents I chose to link (copied into `public/documents/`)
  are. This distinction is what caused one of the two real bugs — see §8.

---

## 6. Code walkthrough

### 6.1 `src/lib/content.ts` — the data layer

```ts
function loadYamlList<T>(filename: string): T[] {
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(raw);
  if (!Array.isArray(data)) {
    throw new Error(`${filename} must parse to a YAML list at the top level`);
  }
  return data as T[];
}
```

This is plain [Node.js](https://nodejs.org): read a file as text, parse
it, sanity-check the shape (fail loudly at build time if someone breaks
the YAML, rather than silently rendering a blank page). `getExperience()`
and `getProjects()` wrap this with the specific filename and a
[TypeScript](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
type, so every page that imports them gets autocomplete and type errors
if a field is misspelled.

`getProjects()` also does the one piece of real logic in this file:
sorting — featured projects first, then newest-by-date. That logic lives
here, once, instead of being duplicated in every page that lists
projects — another instance of the same
"[single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth)"
principle from §4, just applied to *behavior* instead of *data*.

`formatMonthYear()` turns `"2026-07"` into `"Jul 2026"` for display,
using the built-in
[`Intl`-backed `toLocaleDateString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString),
so dates are stored in a sortable/parseable machine format (`YYYY-MM`) in
the YAML but shown in a human-readable format on the page — another
small separation of "data representation" from "display representation."

### 6.2 `src/components/` — Layout, Nav, Footer, Cards

- **[`Layout.astro`](https://docs.astro.build/en/basics/layouts/)** is
  the page shell every page wraps itself in: it emits the
  `<html>`/`<head>` boilerplate once (meta tags, favicon,
  [Open Graph tags](https://ogp.me) for link previews,
  [canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
  for [SEO](https://developer.mozilla.org/en-US/docs/Glossary/SEO) — see
  the "SEO" entry in the glossary if unfamiliar), then renders `<Nav>`,
  [`<slot />`](https://docs.astro.build/en/basics/astro-components/#slots)
  (where the page's own content goes), then `<Footer>`. Every page passes
  it a `title`, `description`, and which nav item is "active."
- **`Nav.astro`** builds its links from
  [`import.meta.env.BASE_URL`](https://docs.astro.build/en/guides/environment-variables/)
  rather than hardcoding `/WebCV/...` — so the same code works whether
  the site is deployed at a subpath (GitHub Pages) or the domain root (if
  it ever moves to a custom domain). It marks the current page with
  [`aria-current="page"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current)
  (an [accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
  attribute screen readers announce, which also happens to be what the
  CSS uses to draw the orange underline).
- **`ExperienceCard.astro`** / **`ProjectCard.astro`** each take one
  entry (the TypeScript types from `content.ts`) as a
  [prop](https://docs.astro.build/en/basics/astro-components/#component-props)
  and render it. They don't know or care how many times they're used —
  the pages loop and call them once per entry (§6.3).

### 6.3 `src/pages/` — file-based routing, and the dynamic-route trick

In Astro (like Next.js), **[the file path *is* the URL](https://docs.astro.build/en/guides/routing/)**
— no separate router config. `src/pages/experience.astro` is served at
`/experience`.

The interesting one is `src/pages/projects/[slug].astro` — the square
brackets mean "this is a
[dynamic route](https://docs.astro.build/en/guides/routing/#dynamic-routes);
the value in `[slug]` comes from data, not a fixed filename." It exports
a function called
[`getStaticPaths()`](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths):

```ts
export function getStaticPaths() {
  return getProjects().map((project) => ({
    params: { slug: project.slug },
    props: { project },
  }));
}
```

At build time, Astro calls this once, gets back a list (currently 2 items
— `verifythevector` and `adversarial-robustness`), and generates one
actual `.html` file per item: `dist/projects/verifythevector/index.html`,
`dist/projects/adversarial-robustness/index.html`. Add a third project to
`projects.yaml` and the *next build* produces a third HTML file
automatically — no route to register, because the route was never
"projects/verifythevector," it was always "however many projects exist."

The rest of that file (§ links, formatting) is templating detail; the
`getStaticPaths` pattern is the one concept worth being able to explain,
because it's the direct mechanism behind "one YAML entry = one live page."

### 6.4 `src/styles/global.css` — design tokens, dark mode, responsiveness

The palette (Naruto-inspired: orange primary accent, navy/cream base
pair, sparing green/red accents — the exact colors and their reasoning
are in `SPEC.md` §9.1) is implemented as
**[CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)**
(a.k.a. CSS variables), not hardcoded hex values scattered through the
stylesheet:

```css
:root {
  --color-accent: #e8611c;
  --color-bg: #fbf6ee;
  --color-text: #232323;
  /* ...more tokens... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1b1f2a;
    --color-text: #edeae3;
    /* accent orange is NOT redefined — stays the same in both modes */
  }
}
```

Every component then uses `var(--color-bg)` etc. instead of a literal
color. This is called a
**[design-token system](https://m3.material.io/foundations/design-tokens/overview)**:
define each color/size *once*, by role ("background," "accent," "border")
rather than by value, then reference the role everywhere. The payoff is
exactly what happens above — dark mode is a ~10-line override block, not
a second copy of every color rule, because only the *tokens* change;
every rule that uses `var(--color-bg)` picks up the new value
automatically. This also respects the visitor's OS-level light/dark
preference automatically via the
[`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
[media query](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries),
with no toggle button or JavaScript required.

Responsiveness follows the same "define once" instinct: layout uses
[CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)/[Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout)
with relative sizing (`grid-template-columns: repeat(auto-fill,
minmax(280px, 1fr))` for card grids — "as many 280px+ columns as fit,"
which reflows from a multi-column grid on desktop to a single column on
phones with no media query needed) plus two breakpoints (`480px`, `768px`)
for the handful of things that need explicit adjustment (nav spacing,
button stacking).
[`clamp()`](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp) is
used for heading sizes so text scales smoothly between a minimum and
maximum instead of jumping at breakpoints. This general approach is
called [responsive web design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design).

---

## 7. CI/CD: how a `git push` becomes a live website

**[CI/CD](https://github.com/resources/articles/software-development/what-is-ci-cd)**
= Continuous Integration / Continuous Deployment: instead of manually
running a build and manually uploading files whenever something changes,
a pipeline runs automatically and does it for you, consistently, every
time. Here that pipeline is a
**[GitHub Actions](https://docs.github.com/en/actions) workflow**,
defined in `.github/workflows/deploy.yml`.

```yaml
on:
  push:
    branches: [main]     # runs automatically on every push to main
  workflow_dispatch:      # ...and can also be triggered manually

permissions:
  contents: read
  pages: write
  id-token: write         # lets this job authenticate to Pages via OIDC,
                           # no manually-managed secret/token needed

jobs:
  build:
    steps:
      - checkout            # clone the repo into the runner
      - setup-node          # install Node.js
      - npm ci               # install dependencies from the lockfile exactly
      - npm run build         # -> produces dist/
      - upload-pages-artifact # hand dist/ off to the next job

  deploy:
    needs: build            # doesn't start until build finishes successfully
    steps:
      - deploy-pages         # publish the artifact to GitHub Pages
```

Two jobs, not one, is a deliberate GitHub Pages convention: `build`
produces the static files and can run with narrow permissions; `deploy`
is the only step that actually needs permission to publish, and it only
runs `needs: build` — i.e., if the build fails (a broken YAML file, a
typo in a component), deploy never runs and the previously-published site
stays live. Nothing broken ever gets automatically published.

[`npm ci`](https://docs.npmjs.com/cli/v10/commands/npm-ci) (not
`npm install`) matters here: it installs *exactly* the versions pinned in
[`package-lock.json`](https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json),
so the CI build uses the identical dependency versions as local
development — reproducible builds, no "works on my machine."

The `concurrency` block (`group: pages, cancel-in-progress: true`) means
if two pushes land close together, the older in-flight deploy gets
cancelled rather than both running and racing to publish — the site
always ends up matching the latest commit, not whichever deploy happened
to finish last.

**[GitHub Pages](https://docs.github.com/en/pages)** itself is just a
static file host built into GitHub — free, and it was pointed at "GitHub
Actions" as its source (as opposed to "a specific branch's raw files,"
the older Pages model), which is what lets this custom build step run at
all.

---

## 8. Two real bugs I hit and fixed

These are worth keeping in your back pocket for "tell me about a bug you
debugged" — they're small, concrete, and show a debugging *process*, not
just a fix.

### Bug 1: broken internal links (`/WebCVexperience` instead of `/WebCV/experience`)

**Symptom:** after the first successful build, every internal link was
missing a slash — `href="/WebCVexperience"` instead of
`href="/WebCV/experience"`.

**Root cause:** [`astro.config.mjs`](https://docs.astro.build/en/reference/configuration-reference/#base)
had `base: '/WebCV'` (no trailing slash). Astro exposes that value to
page code, unmodified, as `import.meta.env.BASE_URL`. Every link in the
codebase was built as `` `${base}experience` `` — string concatenation,
expecting `base` to already end in `/`. Without the trailing slash in the
config, that produced `"/WebCV" + "experience"` = `"/WebCVexperience"`.

**How I found it:** not by staring at code — by *checking the actual
build output*. After `astro build`, I grepped the generated HTML for
every `href="..."` attribute and read them. The build itself didn't
error (concatenating two strings is valid JS), so this was a "silently
wrong output" bug, the kind that's easy to ship if you only check "did
the build succeed" instead of "is the output actually correct."

**Fix:** one character — `base: '/WebCV/'` — plus rebuilding and
re-grepping to confirm every link was now correct. The general lesson:
**config values that get string-concatenated need a documented, enforced
format** (I left a comment on that line explaining exactly why the
trailing slash is required, so it doesn't silently break again).

### Bug 2: report/slide PDF links pointed at files that don't exist in the deployed site

**Symptom:** `projects.yaml` originally had
`report: "/content/Final_Report_VerifyTheVector.pdf"`. That path is valid
*in the repo*, but `content/` is never copied into `dist/` (see §5's
explanation of why `content/` and `public/` are different) — so that link
would [404](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404)
on the live site, even though nothing about the build failed.

**How I found it:** same instinct as Bug 1 — after building, I didn't
just trust that "it built," I actually inspected what got written to
`dist/` and traced whether every linked file existed there.

**Fix:** copied the three linked PDFs into `public/documents/` (the
folder that *does* get deployed) and updated the YAML paths to point
there instead — plus updated the page template to prefix those internal
paths with the base path (same mechanism as Bug 1), while leaving
external links (GitHub repo URLs) untouched, since only internal paths
need the site's own base prefix.

**The general lesson from both bugs:** a successful build (`exit code 0`)
proves the *code compiled*, not that the *output is correct*. Verifying
this project meant actually reading the generated HTML and following the
links, not just trusting a green checkmark.

---

## 9. Design-process decisions worth explaining

- **Why write `SPEC.md` before writing any code?** To separate "what does
  this need to do" from "how do I build it," and to have a written
  artifact of requirements (acceptance criteria, breakpoints to support,
  color palette) that can be checked against later instead of relying on
  memory. This is standard practice on real engineering teams — a
  [design doc](https://www.industrialempathy.com/posts/design-docs-at-google/)
  precedes implementation so decisions get made deliberately, not
  accidentally while typing code.
- **Why `PLAN.md` in addition to `SPEC.md`?** `SPEC.md` answers "what
  must be true when this is done" and barely changes. `PLAN.md` answers
  "what's actually done right now, and what did we decide along the way"
  — it changes constantly and is where decisions (like "use Astro," "use
  GitHub Pages," "this repo is private, don't link it") get written down
  *once*, so they're not re-debated in every future conversation about
  the project.
- **Why per-project detail pages instead of just a grid?** A single grid
  page has to compress every project into a two-line summary. Once
  there's more than a couple of projects, a dedicated page per project
  lets each one carry its full writeup, tech stack, and links without
  cluttering the overview — and it gives each project its own shareable
  URL.

---

## 10. Glossary

- **[Static site generation (SSG)](https://www.cloudflare.com/learning/performance/static-site-generator/):**
  building HTML files once, ahead of time, rather than generating them
  per-request on a server
  ([SSR](https://developer.mozilla.org/en-US/docs/Glossary/SSR)) or in
  the browser via JavaScript
  ([client-side rendering/SPA](https://developer.mozilla.org/en-US/docs/Glossary/SPA)).
- **[Build time vs. runtime](https://vercel.com/guides/what-is-the-difference-between-build-time-and-runtime):**
  "build time" = when `astro build` runs (in CI, before anyone visits);
  "runtime" = when a real visitor's browser is loading the page. This
  project does essentially nothing at runtime beyond serving static
  files — all the YAML-reading and templating happens at build time.
- **[CI/CD](https://github.com/resources/articles/software-development/what-is-ci-cd):**
  Continuous Integration / Continuous Deployment — automatically building
  and publishing on every change, instead of doing it by hand.
- **[YAML](https://yaml.org):** a human-readable data format (like
  [JSON](https://www.json.org), but supports comments and is less
  punctuation-heavy) — used here for `content/*.yaml`.
- **[Design tokens](https://m3.material.io/foundations/design-tokens/overview):**
  named variables for design values (colors, spacing) defined once and
  referenced everywhere, so changing the palette or adding a theme means
  editing one place, not hunting through every file.
- **[`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme):**
  a CSS media query that detects the visitor's OS-level light/dark mode
  preference.
- **[OIDC](https://openid.net/developers/how-connect-works/) (in the GitHub Actions permissions block):**
  a way for the CI job to prove its identity to GitHub Pages without a
  manually-created, manually-rotated secret token.
- **[`getStaticPaths`](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths):**
  an Astro function that says "generate one page per item in this list"
  for a dynamic route — the mechanism behind `/projects/[slug].astro`
  producing one real HTML file per project.
- **Base path:** the URL prefix a site is served under when it's not at a
  domain's root (here, `/WebCV/`, because
  [GitHub Pages project sites](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#types-of-github-pages-sites)
  live at `username.github.io/repo-name/`).

---

## 11. Interview cheat-sheet

**"Walk me through this project."**
→ Use the 30-second pitch in §1, then let them steer with follow-ups.

**"Why Astro instead of React/Next.js?"**
→ The content barely changes and there's no interactivity that needs a
client-side framework; Astro renders to plain HTML at build time so
nothing ships to the browser except what's actually needed, while still
giving me reusable components and data-driven templating.

**"How would you add a new project to the site?"**
→ Copy the template block in `content/projects.yaml`, fill in the fields,
save. Next build/deploy produces a new card on `/projects` and a whole
new detail page at `/projects/<slug>` automatically — no code change.
(Mention `getStaticPaths` if they want the mechanism.)

**"What happens when you push to `main`?"**
→ Walk through §7: GitHub Actions runs a `build` job (`npm ci`, `astro
build`), then a `deploy` job that only runs if `build` succeeded, which
publishes the result to GitHub Pages. Live in under a minute.

**"Tell me about a bug you ran into."**
→ Either bug in §8 — both have a clear symptom, root cause, and fix, and
both illustrate the same lesson: a successful build doesn't guarantee
correct output, so verify the actual generated files, not just the exit
code.

**"How is content separated from code?"**
→ §4: YAML files hold data, a loader (`content.ts`) reads and types it,
page templates loop over whatever the loader returns. Content and
presentation never mix in the same file.

**"How does dark mode work?"**
→ §6.4: CSS custom properties define colors by role; a
`prefers-color-scheme: dark` media query overrides just those variables;
every rule that references a variable updates automatically — no
JavaScript, no toggle, follows the OS setting.

**"Why didn't you use a database / CMS?"**
→ The content is small, changes rarely, and I already have a source of
truth (my own text files in git). A database/CMS adds infrastructure and
a network dependency to solve a problem plain files in version control
already solve for free.

**"What would you do differently / what's not done yet?"**
→ Point to the open items in `PLAN.md` §6 — honest, specific, shows you
know the difference between "shipped" and "perfect," which is itself a
good signal in an interview.

---

## 12. Further reading — every link, in one place

| Term | Link |
|---|---|
| Astro | https://astro.build |
| Astro docs — project structure | https://docs.astro.build/en/basics/project-structure/ |
| Astro docs — components / `.astro` files | https://docs.astro.build/en/basics/astro-components/ |
| Astro docs — layouts | https://docs.astro.build/en/basics/layouts/ |
| Astro docs — routing | https://docs.astro.build/en/guides/routing/ |
| Astro docs — `getStaticPaths` | https://docs.astro.build/en/reference/routing-reference/#getstaticpaths |
| Astro docs — content collections | https://docs.astro.build/en/guides/content-collections/ |
| Astro docs — environment variables (`BASE_URL`) | https://docs.astro.build/en/guides/environment-variables/ |
| Astro docs — config reference | https://docs.astro.build/en/reference/configuration-reference/ |
| React | https://react.dev |
| Next.js | https://nextjs.org |
| Node.js | https://nodejs.org |
| npm — `npm ci` | https://docs.npmjs.com/cli/v10/commands/npm-ci |
| npm — `package-lock.json` | https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json |
| TypeScript | https://www.typescriptlang.org |
| `js-yaml` (npm package) | https://www.npmjs.com/package/js-yaml |
| YAML | https://yaml.org |
| JSON | https://www.json.org |
| Static site generation (concept) | https://www.cloudflare.com/learning/performance/static-site-generator/ |
| Server-side rendering (SSR) | https://developer.mozilla.org/en-US/docs/Glossary/SSR |
| Single-page app / client-side rendering | https://developer.mozilla.org/en-US/docs/Glossary/SPA |
| Build time vs. runtime | https://vercel.com/guides/what-is-the-difference-between-build-time-and-runtime |
| CDN | https://developer.mozilla.org/en-US/docs/Glossary/CDN |
| Separation of concerns | https://en.wikipedia.org/wiki/Separation_of_concerns |
| Single source of truth | https://en.wikipedia.org/wiki/Single_source_of_truth |
| Headless CMS | https://www.contentful.com/r/knowledgebase/headless-cms/ |
| CI/CD | https://github.com/resources/articles/software-development/what-is-ci-cd |
| GitHub Actions | https://docs.github.com/en/actions |
| GitHub Pages | https://docs.github.com/en/pages |
| OpenID Connect (OIDC) — how it works | https://openid.net/developers/how-connect-works/ |
| OIDC in GitHub Actions specifically | https://docs.github.com/en/actions/concepts/security/openid-connect |
| CSS custom properties (variables) | https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties |
| `prefers-color-scheme` | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme |
| CSS media queries | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries |
| CSS Grid | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout |
| CSS Flexbox | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout |
| `clamp()` | https://developer.mozilla.org/en-US/docs/Web/CSS/clamp |
| Responsive web design | https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design |
| Design tokens | https://m3.material.io/foundations/design-tokens/overview |
| Web accessibility (a11y) | https://developer.mozilla.org/en-US/docs/Web/Accessibility |
| `aria-current` | https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current |
| SEO basics | https://developer.mozilla.org/en-US/docs/Glossary/SEO |
| Open Graph protocol | https://ogp.me |
| Canonical URLs | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |
| Design docs (why write a spec first) | https://www.industrialempathy.com/posts/design-docs-at-google/ |
