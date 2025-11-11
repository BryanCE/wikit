import { type Page, type PageSummary } from "@/types";

export function createPageSummary(pages: Page[]): PageSummary {
  const pagesByLocale: Record<string, number> = {};
  const topLevelPaths = new Set<string>();

  pages.forEach(page => {
    pagesByLocale[page.locale] = (pagesByLocale[page.locale] ?? 0) + 1;

    const topLevel = page.path.split('/')[1];
    if (topLevel) {
      topLevelPaths.add(`/${topLevel}`);
    }
  });

  return {
    totalPages: pages.length,
    publishedPages: pages.filter(page => page.isPublished).length,
    pagesByLocale,
    topLevelPaths: Array.from(topLevelPaths).sort(),
  };
}