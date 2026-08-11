// Reads content/experience.yaml and content/projects.yaml (repo root, kept
// OUTSIDE src/ on purpose — see PLAN.md §3/§4) at build time, so adding a
// new entry to either file is all that's needed to change what the site
// renders. No Astro content-collection machinery, just YAML -> typed array.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, '../../content');

export type ExperienceType =
  | 'internship'
  | 'full-time'
  | 'part-time'
  | 'freelance'
  | 'volunteer';

export interface ExperienceEntry {
  type: ExperienceType;
  role: string;
  organization: string;
  location?: string;
  start_date: string;
  end_date: string; // "YYYY-MM" or "Present"
  bullets: string[];
  tags?: string[];
  logo?: string | null;
  link?: string | null;
  project_link?: string | null;
  supervisor?: string | null;
}

export interface ProjectLinks {
  repo?: string | null;
  demo?: string | null;
  report?: string | null;
  slides?: string | null;
}

export interface ProjectEntry {
  slug: string;
  title: string;
  summary: string;
  description?: string;
  tech_stack: string[];
  outcome?: string;
  links: ProjectLinks;
  thumbnail?: string | null;
  featured?: boolean;
  date?: string; // "YYYY-MM"
}

function loadYamlList<T>(filename: string): T[] {
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(raw);
  if (!Array.isArray(data)) {
    throw new Error(`${filename} must parse to a YAML list at the top level`);
  }
  return data as T[];
}

/** Work experience, newest first (source order in experience.yaml). */
export function getExperience(): ExperienceEntry[] {
  return loadYamlList<ExperienceEntry>('experience.yaml');
}

/** Projects, sorted: featured first, then by date (newest first). */
export function getProjects(): ProjectEntry[] {
  const projects = loadYamlList<ProjectEntry>('projects.yaml');
  return [...projects].sort((a, b) => {
    if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
    return (b.date ?? '').localeCompare(a.date ?? '');
  });
}

export function getProjectBySlug(slug: string): ProjectEntry | undefined {
  return getProjects().find((p) => p.slug === slug);
}

/** Formats "YYYY-MM" -> "Mon YYYY"; passes "Present" through unchanged. */
export function formatMonthYear(value: string): string {
  if (value === 'Present') return value;
  const [year, month] = value.split('-');
  if (!year || !month) return value;
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
