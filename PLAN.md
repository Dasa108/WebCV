# PLAN — WebCV execution plan & content playbook

This is the working/status doc, separate from [`SPEC.md`](./SPEC.md).
`SPEC.md` says *what the site must be*; this doc tracks *what exists right
now*, records decisions so they don't get re-litigated, and — the main
point — spells out exactly how to keep adding projects and internships
later without touching any page code.

| | |
|---|---|
| **Status** | **Live**: https://dasa108.github.io/WebCV/ |
| **Last updated** | 2026-08-11 |

## 1. Source inventory

Everything under `content/` today, and where it flows:

| File | What it is | Status |
|---|---|---|
| `Sudarshana_Chaitanya_CV.pdf` | Canonical CV (chosen over the alternate version, see §3) | ✅ source, used |
| `ONe_version_cv.pdf` | Alternate/older CV | ⏸ unused — kept for reference only |
| `Final_Report_VerifyTheVector.pdf` | Full internship/project report | ✅ source for `experience.yaml` + `projects.yaml` |
| `Adversarial_Robustness.pdf` | Project report (NeurIPS-template write-up for a UMC 203 course project — the venue header is template boilerplate, not an actual submission) | ✅ source for `projects.yaml` |
| `AIML__Project_Presentation.pdf` | Slide deck for the *same* Adversarial Robustness project (not a third project) | ✅ linked as `slides` in `projects.yaml` |
| `cv.md` | Already-curated CV markdown (bio/education/skills, with citations back to the PDF) | ✅ already filled — **not a placeholder**, left as-is |
| `extracurriculars.md` | Already-curated leadership/volunteering list | ✅ already filled — left as-is |
| `internships.md` | Already-curated, detailed internship writeup (fuller than the CV's one-liner: real May–July 2026 timeline, 7 solid bullets) | ✅ already filled — used as the primary source for `experience.yaml` |
| `projects.md` | Already-curated Adversarial Robustness writeup (real March–April 2026 timeline, mentor name) | ✅ already filled — used as the primary source for `projects.yaml` |
| `experience.yaml` *(new)* | Structured data the Experience page will render | ✅ created this pass |
| `projects.yaml` *(new)* | Structured data the Projects page will render | ✅ created this pass |

**Correction to an earlier assumption:** the four `.md` files were reported
empty (0 bytes) in an initial scan, and the very first `PLAN.md` draft
assumed they'd need writing from scratch. By the time of writing, they were
already filled with more detail and more accurate dates than the one-page
CV alone provides (e.g. the internship's real end-to-end timeline, May–July
2026, not just "July 2026"). `experience.yaml`/`projects.yaml` were built
from that richer content, not from a from-scratch PDF read.

## 2. Locked content decisions

From this session — don't re-ask these:

- **Canonical CV:** `Sudarshana_Chaitanya_CV.pdf` → copied to
  `public/resume.pdf`. `ONe_version_cv.pdf` is unused.
- **Public contact email:** `sudarshanab@iisc.ac.in` (institutional —
  matches the CV, reads as current-student to recruiters).
- **School marks / entrance-exam ranks:** intentionally **omitted** from
  the public site. `cv.md` still has them (from the source PDF) for your
  own reference — the site itself should stay focused on the IISc degree,
  skills, projects, and experience.
- **Tech stack:** **Astro**, reading `content/experience.yaml` /
  `content/projects.yaml` directly at build time via `src/lib/content.ts`
  (no content-collections migration — data stays where the playbook in §3
  says it lives).
- **Hosting:** **GitHub Pages**, via `.github/workflows/deploy.yml`.
- **Resume presentation:** downloadable PDF button (not site-as-resume) —
  `public/resume.pdf`, linked from the Home hero and Contact section.
- **Project detail pages:** yes — each project card links to its own
  `/projects/<slug>` page (`src/pages/projects/[slug].astro`), not just an
  anchor on the index.
- **VerifyTheVector repo link:** intentionally omitted — the repo is
  private. `projects.yaml`'s `links.repo` stays `null`.
- **Thumbnails:** skipped for now on both projects — `thumbnail: null` in
  `projects.yaml`. The site renders fine without them (§7.4's `<img>` is
  conditional).

## 3. Scalability playbook — adding a new project or internship

This is the payoff of the data-driven content model in SPEC §7.5: growth
means editing one YAML file, never touching a page or component.

**To add a new project:**
1. Open `content/projects.yaml`.
2. Copy the `TEMPLATE` block at the top of the file.
3. Fill in `slug`, `title`, `summary`, `tech_stack`, `outcome`, `links`.
4. If you have a screenshot, drop it in `public/images/projects/` and set
   `thumbnail` to its filename.
5. Paste the filled-in block into the list. Done — no other file changes.

**To add a new internship/job:**
1. Open `content/experience.yaml`.
2. Copy the `TEMPLATE` block at the top of the file.
3. Fill in `type`, `role`, `organization`, dates, `bullets` (favor
   quantified impact, like the existing entry does).
4. If relevant, set `project_link` to cross-reference a matching entry in
   `projects.yaml` (this repo's one internship and one project already do
   this, both pointing at `verifythevector`).
5. Paste it at the top of the list (newest first). Done.

**What still needs a manual touch each time** (can't be automated away):
a thumbnail/logo image if you want one, and a repo/demo link once one
exists. Everything else — layout, styling, page structure — stays
untouched by design.

## 4. Schema deltas from SPEC.md §7.5

Two small, natural additions were made while filling in real data; SPEC.md
§7.5 should be updated to match the next time it's touched, so the two
docs don't drift:

- `projects.yaml` entries gained `slug` (stable anchor/URL id) and
  `links.slides` (in addition to `links.repo`/`links.demo`/`links.report`).
- `experience.yaml` entries gained `logo` (mirrors `thumbnail` on
  projects), `project_link` (cross-link to a Projects entry), and
  `supervisor` (common for research internships — this repo's one entry
  uses it).

## 5. Folder status

```
WebCV/
├── SPEC.md · PLAN.md · README.md            ✅ docs
├── package.json · astro.config.mjs          ✅ NEW — Astro project (site/base set for GitHub Pages)
├── tsconfig.json · .gitignore               ✅ NEW
├── .github/workflows/deploy.yml             ✅ NEW — builds + deploys dist/ to GitHub Pages on push to main
├── content/
│   ├── *.pdf (5 files)                      ✅ source material (not served directly — see public/documents/)
│   ├── cv.md / internships.md /
│   │   projects.md / extracurriculars.md    ✅ already curated (untouched)
│   ├── experience.yaml                      ✅ 1 entry — renders Experience page
│   └── projects.yaml                        ✅ 2 entries — renders Projects grid + detail pages
├── public/
│   ├── resume.pdf                           ✅ copy of canonical CV
│   ├── favicon.svg                          ✅ placeholder mark (Naruto palette)
│   ├── documents/                           ✅ NEW — report/slide PDFs actually served to the site
│   └── images/{experience,projects}/        ✅ READMEs; no images yet (intentional, §2)
└── src/
    ├── lib/content.ts                       ✅ NEW — YAML loader (js-yaml), typed
    ├── styles/global.css                    ✅ NEW — palette + responsive base styles
    ├── components/                          ✅ NEW — Layout, Nav, Footer, ExperienceCard, ProjectCard
    └── pages/                               ✅ NEW — index, experience, projects/index, projects/[slug]
```

Verified: `npm run build` produces 5 static pages with no errors; base-path
links (`/WebCV/...`) resolve correctly; `npm run preview` serves `/WebCV/`
and a project detail page with HTTP 200.

## 6. Open TODOs

**Done:**
- [x] `astro.config.mjs` — `site: 'https://Dasa108.github.io'`,
      `base: '/WebCV/'`.
- [x] GitHub repo created (`Dasa108/WebCV`), Pages source set to
      "GitHub Actions" (via `gh api repos/Dasa108/WebCV/pages -f
      build_type=workflow`), initial commit pushed.
- [x] Deploy workflow verified green end-to-end — live at
      **https://dasa108.github.io/WebCV/** (all 5 routes return HTTP 200).
- [x] `src/pages/index.astro` — replaced the bracketed `[TODO: ...]` line in
      the About section with what you're actually currently looking for.

**Still open:**
- [ ] Local git identity on this machine auto-resolved to
      `sudarshanab@admin-68.iisclab.internal` rather than a real email —
      fine for now, but run `git config --global user.email you@example.com`
      (and `user.name`) if you want commits attributed differently going
      forward.

**Local dev environment note:** this machine had no Node.js; it was
installed via `nvm` (`~/.nvm`) to build/verify the site. Run
`export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"` before `npm run dev`
in a fresh shell, or open a new terminal (nvm's init line is now in
`~/.bashrc`).

**Resolved, not TODOs anymore (§2):** VerifyTheVector's repo link (private,
stays unlinked) and thumbnails for either project (skipped for now).
