// @ts-check
import { defineConfig } from 'astro/config';

// Hosting decision (PLAN.md §2): GitHub Pages, project-repo style URL
// (https://<username>.github.io/<repo>/). Update `site` below once you
// know your GitHub username — `base` assumes the repo is named "WebCV"
// to match this folder; change both together if either differs.
export default defineConfig({
  site: 'https://Dasa108.github.io',
  base: '/WebCV/', // trailing slash required — import.meta.env.BASE_URL mirrors this exactly; assumes the GitHub repo is named "WebCV"
  output: 'static',
});
