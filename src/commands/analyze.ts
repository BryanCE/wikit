import { readFileSync } from "fs";
import { resolve } from "path";
import type { PageExportData, NavigationExportData, AnalysisResult } from "@/types";
import { analyzeExports } from "@/utils/analyzer";

interface AnalyzeOptions {
  orphaned?: boolean;
  broken?: boolean;
  coverage?: boolean;
  consistency?: boolean;
  health?: boolean;
  duplicates?: boolean;
  visibility?: boolean;
}

function loadExportFile<T>(filePath: string, fileType: string): T {
  try {
    const absolutePath = resolve(filePath);
    const fileContent = readFileSync(absolutePath, "utf-8");
    return JSON.parse(fileContent) as T;
  } catch (error) {
    throw new Error(`Failed to load ${fileType} export from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function displayUnlistedPages(result: AnalysisResult) {
  console.log("\n=== UNLISTED PAGES (Not in Navigation) ===");
  if (result.unlistedPages.length === 0) {
    console.log("No unlisted pages found.");
    return;
  }

  console.log(`Found ${result.unlistedPages.length} unlisted page(s):\n`);
  for (const unlisted of result.unlistedPages) {
    console.log(`  ${unlisted.page.path} - ${unlisted.page.title}`);
    console.log(`    ID: ${unlisted.page.id}`);
    console.log(`    Published: ${unlisted.page.isPublished ? "Yes" : "No"}\n`);
  }
}

function displayBrokenNavLinks(result: AnalysisResult) {
  console.log("\n=== BROKEN NAVIGATION LINKS ===");
  if (result.brokenNavLinks.length === 0) {
    console.log("No broken navigation links found.");
    return;
  }

  console.log(`Found ${result.brokenNavLinks.length} broken link(s):\n`);
  for (const broken of result.brokenNavLinks) {
    console.log(`  [${broken.reason}] ${broken.navItem.label ?? "(no label)"}`);
    console.log(`    Target: ${broken.target}`);
    console.log(`    Nav ID: ${broken.navItem.id}\n`);
  }
}

function displayNavigationCoverage(result: AnalysisResult) {
  console.log("\n=== NAVIGATION COVERAGE ===");
  const { navigationCoverage } = result;

  console.log(`Total Pages: ${navigationCoverage.totalPages}`);
  console.log(`Pages in Navigation: ${navigationCoverage.pagesInNavigation}`);
  console.log(`Pages NOT in Navigation: ${navigationCoverage.pagesNotInNavigation}`);
  console.log(`Coverage: ${navigationCoverage.coveragePercentage.toFixed(2)}%`);
}

function displayTitleInconsistencies(result: AnalysisResult) {
  console.log("\n=== TITLE INCONSISTENCIES ===");
  if (result.titleInconsistencies.length === 0) {
    console.log("No title inconsistencies found.");
    return;
  }

  console.log(`Found ${result.titleInconsistencies.length} inconsistency(ies):\n`);
  for (const inconsistency of result.titleInconsistencies) {
    console.log(`  Page: ${inconsistency.page.path}`);
    console.log(`    Page Title: "${inconsistency.pageTitle}"`);
    console.log(`    Nav Label:  "${inconsistency.navLabel}"\n`);
  }
}

function displayDuplicatePaths(result: AnalysisResult) {
  console.log("\n=== DUPLICATE PATHS ===");
  if (result.duplicatePaths.length === 0) {
    console.log("No duplicate paths found.");
    return;
  }

  console.log(`Found ${result.duplicatePaths.length} duplicate path group(s):\n`);
  for (const duplicate of result.duplicatePaths) {
    console.log(`  Duplicate paths: ${duplicate.paths.join(", ")}`);
    console.log(`  Pages:`);
    for (const page of duplicate.pages) {
      console.log(`    - ID: ${page.id}, Title: ${page.title}`);
    }
    console.log("");
  }
}

function displayVisibilityAnalysis(result: AnalysisResult) {
  console.log("\n=== VISIBILITY ANALYSIS ===");
  const { visibilityAnalysis } = result;

  console.log(`Public Pages: ${visibilityAnalysis.publicPages}`);
  console.log(`Restricted Pages: ${visibilityAnalysis.restrictedPages}`);

  const groups = Object.keys(visibilityAnalysis.pagesByGroup);
  if (groups.length > 0) {
    console.log("\nPages by Group:");
    for (const groupKey of groups) {
      const pages = visibilityAnalysis.pagesByGroup[groupKey];
      if (pages) {
        console.log(`  ${groupKey}: ${pages.length} page(s)`);
      }
    }
  }
}

function displayHealthScore(result: AnalysisResult) {
  console.log("\n=== HEALTH SCORE ===");
  const { healthScore } = result;

  console.log(`Score: ${healthScore.score}/${healthScore.maxScore} (${healthScore.percentage.toFixed(2)}%)`);

  if (healthScore.issues.length > 0) {
    console.log("\nIssues:");
    for (const issue of healthScore.issues) {
      const severitySymbol = issue.severity === "critical" ? "!!" : issue.severity === "warning" ? "!" : "i";
      console.log(`  [${severitySymbol}] ${issue.category}: ${issue.count} (${issue.points} points)`);
    }
  }
}

export async function analyzeCommand(
  pagesExportPath: string,
  navExportPath: string,
  options: AnalyzeOptions = {}
) {
  try {
    console.log("Loading export files...");

    const pageExport = loadExportFile<PageExportData>(pagesExportPath, "pages");
    const navExport = loadExportFile<NavigationExportData>(navExportPath, "navigation");

    console.log(`Loaded ${pageExport.pages.length} pages from ${pagesExportPath}`);
    console.log(`Loaded navigation from ${navExportPath}`);
    console.log("\nRunning analysis...\n");

    const result = analyzeExports(pageExport, navExport);

    const allOptions = !options.orphaned && !options.broken && !options.coverage &&
                       !options.consistency && !options.health && !options.duplicates &&
                       !options.visibility;

    if (options.health ?? allOptions) {
      displayHealthScore(result);
    }

    if (options.coverage ?? allOptions) {
      displayNavigationCoverage(result);
    }

    if (options.orphaned ?? allOptions) {
      displayUnlistedPages(result);
    }

    if (options.broken ?? allOptions) {
      displayBrokenNavLinks(result);
    }

    if (options.consistency ?? allOptions) {
      displayTitleInconsistencies(result);
    }

    if (options.duplicates ?? allOptions) {
      displayDuplicatePaths(result);
    }

    if (options.visibility ?? allOptions) {
      displayVisibilityAnalysis(result);
    }

    console.log(`\nAnalysis completed at: ${result.analyzedAt}`);

  } catch (error) {
    console.error(`Error during analysis: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
