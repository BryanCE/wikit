import { readFileSync } from "fs";
import { resolve } from "path";
import type { PageExportData, NavigationExportData, ExportDiffResult } from "@/types";
import { compareExports } from "@/utils/analyzer";

function loadExportFile<T>(filePath: string, fileType: string): T {
  try {
    const absolutePath = resolve(filePath);
    const fileContent = readFileSync(absolutePath, "utf-8");
    return JSON.parse(fileContent) as T;
  } catch (error) {
    throw new Error(`Failed to load ${fileType} export from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function displayPageChanges(result: ExportDiffResult) {
  console.log("\n=== PAGE CHANGES ===");

  if (result.pagesAdded.length > 0) {
    console.log(`\nPages Added (${result.pagesAdded.length}):`);
    for (const page of result.pagesAdded) {
      console.log(`  + ${page.path}`);
      console.log(`    Title: ${page.title}`);
      console.log(`    ID: ${page.id}\n`);
    }
  }

  if (result.pagesRemoved.length > 0) {
    console.log(`\nPages Removed (${result.pagesRemoved.length}):`);
    for (const page of result.pagesRemoved) {
      console.log(`  - ${page.path}`);
      console.log(`    Title: ${page.title}`);
      console.log(`    ID: ${page.id}\n`);
    }
  }

  if (result.pagesModified.length > 0) {
    console.log(`\nPages Modified (${result.pagesModified.length}):`);
    for (const mod of result.pagesModified) {
      console.log(`  ~ ${mod.after.path}`);
      console.log(`    Changes: ${mod.changes.join(", ")}`);
      for (const change of mod.changes) {
        if (change === "title") {
          console.log(`      Title: "${mod.before.title}" -> "${mod.after.title}"`);
        } else if (change === "path") {
          console.log(`      Path: "${mod.before.path}" -> "${mod.after.path}"`);
        } else if (change === "isPublished") {
          console.log(`      Published: ${mod.before.isPublished} -> ${mod.after.isPublished}`);
        }
      }
      console.log("");
    }
  }

  if (result.pagesAdded.length === 0 && result.pagesRemoved.length === 0 && result.pagesModified.length === 0) {
    console.log("No page changes detected.");
  }
}

function displayNavigationChanges(result: ExportDiffResult) {
  console.log("\n=== NAVIGATION CHANGES ===");

  if (result.navItemsAdded.length > 0) {
    console.log(`\nNavigation Items Added (${result.navItemsAdded.length}):`);
    for (const nav of result.navItemsAdded) {
      console.log(`  + [${nav.kind}] ${nav.label ?? "(no label)"}`);
      if (nav.target) {
        console.log(`    Target: ${nav.target}`);
      }
      console.log(`    ID: ${nav.id}\n`);
    }
  }

  if (result.navItemsRemoved.length > 0) {
    console.log(`\nNavigation Items Removed (${result.navItemsRemoved.length}):`);
    for (const nav of result.navItemsRemoved) {
      console.log(`  - [${nav.kind}] ${nav.label ?? "(no label)"}`);
      if (nav.target) {
        console.log(`    Target: ${nav.target}`);
      }
      console.log(`    ID: ${nav.id}\n`);
    }
  }

  if (result.navItemsModified.length > 0) {
    console.log(`\nNavigation Items Modified (${result.navItemsModified.length}):`);
    for (const mod of result.navItemsModified) {
      console.log(`  ~ [${mod.after.kind}] ${mod.after.label ?? "(no label)"}`);
      console.log(`    Changes: ${mod.changes.join(", ")}`);
      for (const change of mod.changes) {
        if (change === "label") {
          console.log(`      Label: "${mod.before.label}" -> "${mod.after.label}"`);
        } else if (change === "target") {
          console.log(`      Target: "${mod.before.target}" -> "${mod.after.target}"`);
        } else if (change === "icon") {
          console.log(`      Icon: "${mod.before.icon}" -> "${mod.after.icon}"`);
        } else if (change === "visibilityGroups") {
          console.log(`      Visibility Groups: ${JSON.stringify(mod.before.visibilityGroups)} -> ${JSON.stringify(mod.after.visibilityGroups)}`);
        }
      }
      console.log("");
    }
  }

  if (result.navItemsAdded.length === 0 && result.navItemsRemoved.length === 0 && result.navItemsModified.length === 0) {
    console.log("No navigation changes detected.");
  }
}

function displaySummary(result: ExportDiffResult) {
  console.log("\n=== SUMMARY ===");
  console.log(`Total Changes: ${result.summary.totalChanges}`);
  console.log(`  Page Changes: ${result.summary.pageChanges}`);
  console.log(`  Navigation Changes: ${result.summary.navChanges}`);
  console.log(`\nComparison completed at: ${result.comparedAt}`);
}

export async function compareExportsCommand(
  oldPagesPath: string,
  newPagesPath: string,
  oldNavPath: string,
  newNavPath: string
) {
  try {
    console.log("Loading export files...");

    const oldPageExport = loadExportFile<PageExportData>(oldPagesPath, "old pages");
    const newPageExport = loadExportFile<PageExportData>(newPagesPath, "new pages");
    const oldNavExport = loadExportFile<NavigationExportData>(oldNavPath, "old navigation");
    const newNavExport = loadExportFile<NavigationExportData>(newNavPath, "new navigation");

    console.log(`Loaded old export: ${oldPageExport.pages.length} pages`);
    console.log(`Loaded new export: ${newPageExport.pages.length} pages`);
    console.log("\nComparing exports...\n");

    const result = compareExports(oldPageExport, newPageExport, oldNavExport, newNavExport);

    displayPageChanges(result);
    displayNavigationChanges(result);
    displaySummary(result);

  } catch (error) {
    console.error(`Error during comparison: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
