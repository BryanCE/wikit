import type { Page } from "@/types/page/pageTypes";
import type { NavigationItem } from "@/types/navigation/navigationTypes";

export interface UnlistedPage {
  page: Page;
  reason: "published_not_in_nav" | "unpublished_not_in_nav";
}

export interface BrokenNavLink {
  navItem: NavigationItem;
  target: string;
  reason: "page_not_found" | "page_unpublished";
}

export interface TitleInconsistency {
  page: Page;
  navItem: NavigationItem;
  pageTitle: string;
  navLabel: string;
}

export interface DuplicatePath {
  paths: string[];
  pages: Page[];
}

export interface NavigationCoverage {
  totalPages: number;
  pagesInNavigation: number;
  pagesNotInNavigation: number;
  coveragePercentage: number;
  unlistedPages: Page[];
}

export interface VisibilityAnalysis {
  publicPages: number;
  restrictedPages: number;
  pagesByGroup: Record<string, Page[]>;
}

export interface HealthScore {
  score: number;
  maxScore: number;
  percentage: number;
  issues: {
    category: string;
    severity: "critical" | "warning" | "info";
    count: number;
    points: number;
  }[];
}

export interface AnalysisResult {
  unlistedPages: UnlistedPage[];
  brokenNavLinks: BrokenNavLink[];
  titleInconsistencies: TitleInconsistency[];
  duplicatePaths: DuplicatePath[];
  navigationCoverage: NavigationCoverage;
  visibilityAnalysis: VisibilityAnalysis;
  healthScore: HealthScore;
  analyzedAt: string;
}

export interface ExportDiffResult {
  pagesAdded: Page[];
  pagesRemoved: Page[];
  pagesModified: {
    before: Page;
    after: Page;
    changes: string[];
  }[];
  navItemsAdded: NavigationItem[];
  navItemsRemoved: NavigationItem[];
  navItemsModified: {
    before: NavigationItem;
    after: NavigationItem;
    changes: string[];
  }[];
  summary: {
    totalChanges: number;
    pageChanges: number;
    navChanges: number;
  };
  comparedAt: string;
}

export interface PageLinkItem {
  id: number;
  path: string;
  title: string;
  links: string[];
}

export interface OrphanedPage {
  page: Page;
  incomingLinkCount: number;
  outgoingLinkCount: number;
  reason: "published_no_links" | "unpublished_no_links";
}

export interface OrphanAnalysisResult {
  orphanedPages: OrphanedPage[];
  totalPages: number;
  analyzedAt: string;
}
