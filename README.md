# WebCV

Personal portfolio website.

- [`SPEC.md`](./SPEC.md) — requirements: page structure, color palette,
  responsiveness/accessibility targets, acceptance criteria.
- [`PLAN.md`](./PLAN.md) — execution plan, content inventory, and the
  playbook for adding new projects/experience entries later.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — how the code works and why,
  written to explain (e.g. to an interviewer): the tech-stack decisions,
  a full component/code walkthrough, the CI/CD pipeline, and two real
  bugs hit and fixed along the way.
- [`ARCHITECTURE.pdf`](./ARCHITECTURE.pdf) — the same explainer, typeset
  as a standalone PDF for reading/sharing outside the repo (source:
  [`ARCHITECTURE.tex`](./ARCHITECTURE.tex); rebuild with
  `tectonic ARCHITECTURE.tex` or any `pdflatex`/`xelatex`).

Content sources (CV, project/internship reports) live in `content/`.
`content/experience.yaml` and `content/projects.yaml` are the structured
data that actually drives the Experience and Projects pages — see
`PLAN.md` for how to extend them.

## Running locally

Built with [Astro](https://astro.build). Needs Node.js 20+.

```sh
npm install
npm run dev       # http://localhost:4321/WebCV/
npm run build     # -> dist/
npm run preview   # serve the built dist/ locally
```

If this machine has no Node.js, install it via
[nvm](https://github.com/nvm-sh/nvm) — see `PLAN.md` §6 for the exact
commands used here.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages. Before the first deploy: fill in your GitHub
username in `astro.config.mjs`'s `site` field, and set this repo's
**Settings → Pages → Source** to "GitHub Actions" once.
