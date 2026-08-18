// Theme system source of truth (SPEC.md §7.1) — the three selectable
// themes, in slider order, plus the localStorage/init logic shared by
// ThemeSwitcher.astro. The anti-flash blocking script in Layout.astro
// duplicates the small "read + apply" half of this inline (it must run
// as a classic synchronous script before first paint, so it can't just
// `import` this module) — keep the two in sync if the logic changes.

export const THEMES = ['foodwars', 'naruto', 'free'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  foodwars: 'Food Wars',
  naruto: 'Naruto',
  free: 'Free!',
};

export const STORAGE_KEY = 'webcv-theme';

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** Resolves the theme to apply on first visit: saved choice, else OS dark-mode
 *  preference (Naruto), else the default (Food Wars). Free! is never
 *  auto-selected — it's always an explicit opt-in via the slider (SPEC §7.1). */
export function getInitialTheme(): Theme {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (isTheme(saved)) return saved;
  const prefersDark =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'naruto' : 'foodwars';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}
