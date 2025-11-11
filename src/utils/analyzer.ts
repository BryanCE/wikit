import type {
  Page,
  PageExportData,
  NavigationExportData,
  NavigationItem,
  AnalysisResult,
  UnlistedPage,
  BrokenNavLink,
  TitleInconsistency,
  DuplicatePath,
  NavigationCoverage,
  VisibilityAnalysis,
  HealthScore,
  ExportDiffResult,
  PageLinkItem,
  OrphanedPage,
  OrphanAnalysisResult,
} from "@/types";

function getAllNavigationLinks(items: NavigationItem[]): NavigationItem[] {
  const links: NavigationItem[] = [];

  for (const item of items) {
    if (item.kind === "link" && item.target) {
      links.push(item);
    }
    if (item.children) {
      links.push(...getAllNavigationLinks(item.children));
    }
  }

  return links;
}

function normalizePagePath(path: string): string {
  let normalized = path.toLowerCase().trim();
  if (normalized.startsWith("/en/")) {
    normalized = normalized.substring(4);
  }
  if (normalized.startsWith("/")) {
    normalized = normalized.substring(1);
  }
  return normalized;
}

export function findUnlistedPages(
  pageExport: PageExportData,
  navExport: NavigationExportData
): UnlistedPage[] {
  const unlisted: UnlistedPage[] = [];

  const navLinks = navExport.tree.flatMap(tree => getAllNavigationLinks(tree.items));
  const navTargets = new Set(
    navLinks.map(link => normalizePagePath(link.target ?? ""))
  );

  for (const page of pageExport.pages) {
    const normalizedPath = normalizePagePath(page.path);

    if (!navTargets.has(normalizedPath)) {
      unlisted.push({
        page,
        reason: page.isPublished ? "published_not_in_nav" : "unpublished_not_in_nav",
      });
    }
  }

  return unlisted;
}

export function findBrokenNavLinks(
  pageExport: PageExportData,
  navExport: NavigationExportData
): BrokenNavLink[] {
  const broken: BrokenNavLink[] = [];

  const pagesByPath = new Map<string, Page>();
  for (const page of pageExport.pages) {
    pagesByPath.set(normalizePagePath(page.path), page);
  }

  const navLinks = navExport.tree.flatMap(tree => getAllNavigationLinks(tree.items));

  for (const navItem of navLinks) {
    if (!navItem.target) continue;

    const normalizedTarget = normalizePagePath(navItem.target);
    const page = pagesByPath.get(normalizedTarget);

    if (!page) {
      broken.push({
        navItem,
        target: navItem.target,
        reason: "page_not_found",
      });
    } else if (!page.isPublished) {
      broken.push({
        navItem,
        target: navItem.target,
        reason: "page_unpublished",
      });
    }
  }

  return broken;
}

export function findTitleInconsistencies(
  pageExport: PageExportData,
  navExport: NavigationExportData
): TitleInconsistency[] {
  const inconsistencies: TitleInconsistency[] = [];

  const pagesByPath = new Map<string, Page>();
  for (const page of pageExport.pages) {
    pagesByPath.set(normalizePagePath(page.path), page);
  }

  const navLinks = navExport.tree.flatMap(tree => getAllNavigationLinks(tree.items));

  for (const navItem of navLinks) {
    if (!navItem.target || !navItem.label) continue;

    const normalizedTarget = normalizePagePath(navItem.target);
    const page = pagesByPath.get(normalizedTarget);

    if (page && page.title !== navItem.label) {
      inconsistencies.push({
        page,
        navItem,
        pageTitle: page.title,
        navLabel: navItem.label,
      });
    }
  }

  return inconsistencies;
}

export function findDuplicatePaths(pageExport: PageExportData): DuplicatePath[] {
  const duplicates: DuplicatePath[] = [];
  const pathGroups = new Map<string, Page[]>();

  for (const page of pageExport.pages) {
    const normalized = normalizePagePath(page.path);
    const group = pathGroups.get(normalized) ?? [];
    group.push(page);
    pathGroups.set(normalized, group);
  }

  for (const [, pages] of pathGroups) {
    if (pages.length > 1) {
      duplicates.push({
        paths: pages.map(p => p.path),
        pages,
      });
    }
  }

  return duplicates;
}

export function calculateNavigationCoverage(
  pageExport: PageExportData,
  navExport: NavigationExportData
): NavigationCoverage {
  const unlisted = findUnlistedPages(pageExport, navExport);
  const totalPages = pageExport.pages.length;
  const pagesNotInNavigation = unlisted.length;
  const pagesInNavigation = totalPages - pagesNotInNavigation;

  return {
    totalPages,
    pagesInNavigation,
    pagesNotInNavigation,
    coveragePercentage: totalPages > 0 ? (pagesInNavigation / totalPages) * 100 : 0,
    unlistedPages: unlisted.map(o => o.page),
  };
}

export function analyzeVisibility(
  pageExport: PageExportData,
  navExport: NavigationExportData
): VisibilityAnalysis {
  const pagesByPath = new Map<string, Page>();
  for (const page of pageExport.pages) {
    pagesByPath.set(normalizePagePath(page.path), page);
  }

  const pagesByGroup: Record<string, Page[]> = {};
  let publicPages = 0;
  let restrictedPages = 0;

  const navLinks = navExport.tree.flatMap(tree => getAllNavigationLinks(tree.items));

  for (const navItem of navLinks) {
    if (!navItem.target) continue;

    const normalizedTarget = normalizePagePath(navItem.target);
    const page = pagesByPath.get(normalizedTarget);

    if (!page) continue;

    if (!navItem.visibilityGroups || navItem.visibilityGroups.length === 0) {
      publicPages++;
    } else {
      restrictedPages++;
      for (const groupId of navItem.visibilityGroups) {
        const groupKey = `group_${groupId}`;
        pagesByGroup[groupKey] = pagesByGroup[groupKey] ?? [];
        pagesByGroup[groupKey].push(page);
      }
    }
  }

  return {
    publicPages,
    restrictedPages,
    pagesByGroup,
  };
}

export function calculateHealthScore(
  pageExport: PageExportData,
  navExport: NavigationExportData
): HealthScore {
  const unlisted = findUnlistedPages(pageExport, navExport);
  const broken = findBrokenNavLinks(pageExport, navExport);
  const inconsistencies = findTitleInconsistencies(pageExport, navExport);
  const duplicates = findDuplicatePaths(pageExport);

  const issues = [
    {
      category: "Broken Navigation Links",
      severity: "critical" as const,
      count: broken.length,
      points: broken.length * 10,
    },
    {
      category: "Unlisted Pages",
      severity: "warning" as const,
      count: unlisted.length,
      points: unlisted.length * 5,
    },
    {
      category: "Title Inconsistencies",
      severity: "info" as const,
      count: inconsistencies.length,
      points: inconsistencies.length * 2,
    },
    {
      category: "Duplicate Paths",
      severity: "critical" as const,
      count: duplicates.length,
      points: duplicates.length * 10,
    },
  ];

  const totalPoints = issues.reduce((sum, issue) => sum + issue.points, 0);
  const maxScore = 100;
  const score = Math.max(0, maxScore - totalPoints);
  const percentage = (score / maxScore) * 100;

  return {
    score,
    maxScore,
    percentage,
    issues: issues.filter(issue => issue.count > 0),
  };
}

export function analyzeExports(
  pageExport: PageExportData,
  navExport: NavigationExportData
): AnalysisResult {
  return {
    unlistedPages: findUnlistedPages(pageExport, navExport),
    brokenNavLinks: findBrokenNavLinks(pageExport, navExport),
    titleInconsistencies: findTitleInconsistencies(pageExport, navExport),
    duplicatePaths: findDuplicatePaths(pageExport),
    navigationCoverage: calculateNavigationCoverage(pageExport, navExport),
    visibilityAnalysis: analyzeVisibility(pageExport, navExport),
    healthScore: calculateHealthScore(pageExport, navExport),
    analyzedAt: new Date().toISOString(),
  };
}

function normalizePathForLinkMatching(path: string): string {
  let normalized = path.toLowerCase().trim();

  // Remove leading slash if present
  if (normalized.startsWith("/")) {
    normalized = normalized.substring(1);
  }

  // Remove locale prefix (en/, fr/, etc.)
  if (normalized.match(/^[a-z]{2}\//)) {
    normalized = normalized.substring(3);
  }

  // Remove trailing slash if present
  if (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

export function findOrphanedPages(
  pages: Page[],
  pageLinks: PageLinkItem[]
): OrphanAnalysisResult {
  const incomingLinks = new Map<string, Set<string>>();
  const outgoingLinks = new Map<string, number>();

  const pathToPage = new Map<string, Page>();
  for (const page of pages) {
    const normalized = normalizePathForLinkMatching(page.path);
    pathToPage.set(normalized, page);
    incomingLinks.set(normalized, new Set());
    outgoingLinks.set(normalized, 0);
  }

  for (const linkItem of pageLinks) {
    const sourcePath = normalizePathForLinkMatching(linkItem.path);

    const validLinks = (linkItem.links ?? []).filter(link => {
      // Filter out external links, anchors, and special links
      return link &&
             !link.startsWith('http://') &&
             !link.startsWith('https://') &&
             !link.startsWith('mailto:') &&
             !link.startsWith('#');
    });

    outgoingLinks.set(sourcePath, validLinks.length);

    for (const targetLink of validLinks) {
      // Remove anchor fragments from internal links
      const cleanLink = targetLink.split('#')[0];
      if (!cleanLink) continue;

      const targetPath = normalizePathForLinkMatching(cleanLink);
      const incomingSet = incomingLinks.get(targetPath);
      if (incomingSet) {
        incomingSet.add(sourcePath);
      }
    }
  }

  // Normalize excluded paths the same way
  const excludedPaths = new Set(["", "home"]);

  // Path prefixes to exclude (dynamically linked pages)
  const excludedPrefixes = ["news/", "blog/", "archive/"];

  const orphanedPages: OrphanedPage[] = [];

  for (const [path, incomingSet] of incomingLinks) {
    if (excludedPaths.has(path)) continue;

    // Skip paths that match excluded prefixes
    if (excludedPrefixes.some(prefix => path.startsWith(prefix))) continue;

    if (incomingSet.size === 0) {
      const page = pathToPage.get(path);
      if (page) {
        orphanedPages.push({
          page,
          incomingLinkCount: 0,
          outgoingLinkCount: outgoingLinks.get(path) ?? 0,
          reason: page.isPublished ? "published_no_links" : "unpublished_no_links",
        });
      }
    }
  }

  return {
    orphanedPages,
    totalPages: pages.length,
    analyzedAt: new Date().toISOString(),
  };
}

export function compareExports(
  oldPageExport?: PageExportData,
  newPageExport?: PageExportData,
  oldNavExport?: NavigationExportData,
  newNavExport?: NavigationExportData
): ExportDiffResult {
  const pagesAdded: Page[] = [];
  const pagesRemoved: Page[] = [];
  const pagesModified: { before: Page; after: Page; changes: string[] }[] = [];

  // Only compare pages if both old and new page exports are provided
  if (oldPageExport && newPageExport) {
    const oldPagesById = new Map(oldPageExport.pages.map(p => [p.id, p]));
    const newPagesById = new Map(newPageExport.pages.map(p => [p.id, p]));

    for (const newPage of newPageExport.pages) {
      const oldPage = oldPagesById.get(newPage.id);
      if (!oldPage) {
        pagesAdded.push(newPage);
      } else {
        const changes: string[] = [];
        if (oldPage.title !== newPage.title) changes.push("title");
        if (oldPage.path !== newPage.path) changes.push("path");
        if (oldPage.isPublished !== newPage.isPublished) changes.push("isPublished");

        if (changes.length > 0) {
          pagesModified.push({ before: oldPage, after: newPage, changes });
        }
      }
    }

    for (const oldPage of oldPageExport.pages) {
      if (!newPagesById.has(oldPage.id)) {
        pagesRemoved.push(oldPage);
      }
    }
  }

  const navItemsAdded: NavigationItem[] = [];
  const navItemsRemoved: NavigationItem[] = [];
  const navItemsModified: { before: NavigationItem; after: NavigationItem; changes: string[] }[] = [];

  // Only compare navigation if both old and new navigation exports are provided
  if (oldNavExport && newNavExport) {
    const oldNavLinks = oldNavExport.tree.flatMap(tree => getAllNavigationLinks(tree.items));
    const newNavLinks = newNavExport.tree.flatMap(tree => getAllNavigationLinks(tree.items));

    const oldNavById = new Map(oldNavLinks.map(n => [n.id, n]));
    const newNavById = new Map(newNavLinks.map(n => [n.id, n]));

    for (const newNav of newNavLinks) {
      const oldNav = oldNavById.get(newNav.id);
      if (!oldNav) {
        navItemsAdded.push(newNav);
      } else {
        const changes: string[] = [];
        if (oldNav.label !== newNav.label) changes.push("label");
        if (oldNav.target !== newNav.target) changes.push("target");
        if (oldNav.icon !== newNav.icon) changes.push("icon");
        if (JSON.stringify(oldNav.visibilityGroups) !== JSON.stringify(newNav.visibilityGroups)) {
          changes.push("visibilityGroups");
        }

        if (changes.length > 0) {
          navItemsModified.push({ before: oldNav, after: newNav, changes });
        }
      }
    }

    for (const oldNav of oldNavLinks) {
      if (!newNavById.has(oldNav.id)) {
        navItemsRemoved.push(oldNav);
      }
    }
  }

  const pageChanges = pagesAdded.length + pagesRemoved.length + pagesModified.length;
  const navChanges = navItemsAdded.length + navItemsRemoved.length + navItemsModified.length;

  return {
    pagesAdded,
    pagesRemoved,
    pagesModified,
    navItemsAdded,
    navItemsRemoved,
    navItemsModified,
    summary: {
      totalChanges: pageChanges + navChanges,
      pageChanges,
      navChanges,
    },
    comparedAt: new Date().toISOString(),
  };
}
