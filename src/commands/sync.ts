import { getSiteConfig, getThemeConfig, getAssetInfo } from "@/api/config";
import { updateSiteConfig, updateThemeConfig, updateAssetInfo } from "@/api/sync";
import { getAllPages, getPageContent, createPage } from "@/api/pages";
import { instanceLabels } from "@/config";
import { type SyncOptions, type SyncResult, type SyncSummary, type SyncCommandOptions } from "@/types";
import { InstanceContext } from "@/contexts/InstanceContext";

async function syncSiteConfig(fromInstance: string, toInstance: string, dryRun = false): Promise<SyncResult> {
  try {
    InstanceContext.setInstance(fromInstance);
    const sourceConfig = await getSiteConfig();
    InstanceContext.setInstance(toInstance);
    const targetConfig = await getSiteConfig();

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    let hasChanges = false;

    Object.keys(sourceConfig).forEach(key => {
      const sourceValue = (sourceConfig as Record<string, unknown>)[key];
      const targetValue = (targetConfig as Record<string, unknown>)[key];

      if (sourceValue !== targetValue) {
        changes[key] = { from: targetValue, to: sourceValue };
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      return {
        category: "Site Configuration",
        success: true,
        message: "No changes needed - configurations match",
      };
    }

    if (dryRun) {
      return {
        category: "Site Configuration",
        success: true,
        message: `Would update ${Object.keys(changes).length} field(s)`,
        changes,
      };
    }

    InstanceContext.setInstance(toInstance);
    const result = await updateSiteConfig(sourceConfig);

    if (result.succeeded) {
      return {
        category: "Site Configuration",
        success: true,
        message: `Updated ${Object.keys(changes).length} field(s)`,
        changes,
      };
    } else {
      return {
        category: "Site Configuration",
        success: false,
        message: result.message ?? "Update failed",
      };
    }

  } catch (error) {
    return {
      category: "Site Configuration",
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function syncThemeConfig(fromInstance: string, toInstance: string, dryRun = false): Promise<SyncResult> {
  try {
    InstanceContext.setInstance(fromInstance);
    const sourceTheme = await getThemeConfig();
    InstanceContext.setInstance(toInstance);
    const targetTheme = await getThemeConfig();

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    let hasChanges = false;

    Object.keys(sourceTheme).forEach(key => {
      const sourceValue = (sourceTheme as Record<string, unknown>)[key];
      const targetValue = (targetTheme as Record<string, unknown>)[key];

      if (sourceValue !== targetValue) {
        changes[key] = { from: targetValue, to: sourceValue };
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      return {
        category: "Theme Configuration",
        success: true,
        message: "No changes needed - theme configurations match",
      };
    }

    if (dryRun) {
      return {
        category: "Theme Configuration",
        success: true,
        message: `Would update ${Object.keys(changes).length} theme setting(s)`,
        changes,
      };
    }

    InstanceContext.setInstance(toInstance);
    const result = await updateThemeConfig(sourceTheme);

    if (result.succeeded) {
      return {
        category: "Theme Configuration",
        success: true,
        message: `Updated ${Object.keys(changes).length} theme setting(s)`,
        changes,
      };
    } else {
      return {
        category: "Theme Configuration",
        success: false,
        message: result.message ?? "Theme update failed",
      };
    }

  } catch (error) {
    return {
      category: "Theme Configuration",
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function syncAssetInfo(fromInstance: string, toInstance: string, dryRun = false): Promise<SyncResult> {
  try {
    InstanceContext.setInstance(fromInstance);
    const sourceAssets = await getAssetInfo();
    InstanceContext.setInstance(toInstance);
    const targetAssets = await getAssetInfo();

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    let hasChanges = false;

    Object.keys(sourceAssets).forEach(key => {
      const sourceValue = (sourceAssets as Record<string, unknown>)[key];
      const targetValue = (targetAssets as Record<string, unknown>)[key];

      if (sourceValue !== targetValue) {
        changes[key] = { from: targetValue, to: sourceValue };
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      return {
        category: "Asset Configuration",
        success: true,
        message: "No changes needed - asset configurations match",
      };
    }

    if (dryRun) {
      return {
        category: "Asset Configuration",
        success: true,
        message: `Would update ${Object.keys(changes).length} asset setting(s)`,
        changes,
      };
    }

    InstanceContext.setInstance(toInstance);
    const result = await updateAssetInfo(sourceAssets);

    if (result.succeeded) {
      return {
        category: "Asset Configuration",
        success: true,
        message: `Updated ${Object.keys(changes).length} asset setting(s)`,
        changes,
      };
    } else {
      return {
        category: "Asset Configuration",
        success: false,
        message: result.message ?? "Asset update failed",
      };
    }

  } catch (error) {
    return {
      category: "Asset Configuration",
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function syncPages(fromInstance: string, toInstance: string, pagePrefix?: string, dryRun = false): Promise<SyncResult> {
  try {
    InstanceContext.setInstance(fromInstance);
    const sourcePages = await getAllPages();
    InstanceContext.setInstance(toInstance);
    const targetPages = await getAllPages();

    const filteredPages = pagePrefix
      ? sourcePages.filter(page => page.path.startsWith(pagePrefix))
      : sourcePages;

    const targetPaths = new Set(targetPages.map(page => page.path));
    const pagesToCopy = filteredPages.filter(page => !targetPaths.has(page.path));

    if (pagesToCopy.length === 0) {
      return {
        category: "Pages",
        success: true,
        message: "No new pages to sync",
      };
    }

    if (dryRun) {
      return {
        category: "Pages",
        success: true,
        message: `Would copy ${pagesToCopy.length} page(s)`,
        changes: Object.fromEntries(
          pagesToCopy.map(page => [page.path, { from: "not exists", to: "exists" }])
        ),
      };
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const page of pagesToCopy) {
      try {
        InstanceContext.setInstance(fromInstance);
        const fullPageData = await getPageContent(page.path);
        if (!fullPageData) {
          errors.push(`Failed to get content for ${page.path}`);
          errorCount++;
          continue;
        }

        InstanceContext.setInstance(toInstance);
        const result = await createPage({
          path: fullPageData.path,
          title: fullPageData.title,
          content: fullPageData.content,
          description: fullPageData.description,
          editor: fullPageData.editor,
          locale: fullPageData.locale,
          isPublished: fullPageData.isPublished,
          isPrivate: fullPageData.isPrivate,
          tags: fullPageData.tags?.map(tag => tag.title),
        });

        if (result.responseResult.succeeded) {
          successCount++;
        } else {
          errors.push(`${page.path}: ${result.responseResult.message}`);
          errorCount++;
        }
      } catch (error) {
        errors.push(`${page.path}: ${error instanceof Error ? error.message : String(error)}`);
        errorCount++;
      }
    }

    if (errorCount > 0) {
      return {
        category: "Pages",
        success: false,
        message: `Copied ${successCount} page(s), failed ${errorCount}: ${errors.slice(0, 3).join("; ")}${errors.length > 3 ? "..." : ""}`,
      };
    }

    return {
      category: "Pages",
      success: true,
      message: `Copied ${successCount} page(s)`,
    };

  } catch (error) {
    return {
      category: "Pages",
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function performSync(options: { from: string; to: string; config?: boolean; theme?: boolean; assets?: boolean; pages?: boolean; pagePrefix?: string; all?: boolean; dryRun?: boolean }): Promise<SyncSummary> {
  const fromInstanceName = instanceLabels[options.from] ?? options.from;
  const toInstanceName = instanceLabels[options.to] ?? options.to;

  const results: SyncResult[] = [];
  const shouldSyncAll = options.all ?? (!options.config && !options.theme && !options.assets && !options.pages);

  if ((options.config ?? false) || shouldSyncAll) {
    const result = await syncSiteConfig(options.from, options.to, options.dryRun);
    results.push(result);
  }

  if ((options.theme ?? false) || shouldSyncAll) {
    const result = await syncThemeConfig(options.from, options.to, options.dryRun);
    results.push(result);
  }

  if ((options.assets ?? false) || shouldSyncAll) {
    const result = await syncAssetInfo(options.from, options.to, options.dryRun);
    results.push(result);
  }

  if ((options.pages ?? false) || shouldSyncAll) {
    const result = await syncPages(options.from, options.to, options.pagePrefix, options.dryRun);
    results.push(result);
  }

  const totalChanges = results.reduce((sum, result) => {
    return sum + (result.changes ? Object.keys(result.changes).length : 0);
  }, 0);

  const totalErrors = results.filter(result => !result.success).length;

  return {
    fromInstance: fromInstanceName,
    toInstance: toInstanceName,
    results,
    totalChanges,
    totalErrors,
    dryRun: options.dryRun ?? false,
  };
}

export async function syncForCli(options: SyncOptions): Promise<void> {
  if (!options.from || !options.to) {
    console.error("❌ Both --from and --to parameters are required for sync");
    process.exit(1);
  }

  const fromInstance = options.from;
  const toInstance = options.to;

  if (fromInstance === toInstance) {
    console.error("❌ Cannot sync instance with itself");
    process.exit(1);
  }

  const syncOptions: SyncOptions = {
    from: fromInstance,
    to: toInstance,
    config: options.config,
    theme: options.theme,
    assets: options.assets,
    pages: options.pages,
    pagePrefix: options.pagePrefix,
    all: options.all,
    dryRun: options.dryRun,
  };

  try {
    if (options.dryRun) {
      console.log(`🔍 Dry run: Checking what would be synced from ${syncOptions.from} to ${syncOptions.to}...\n`);
    } else {
      console.log(`🔄 Syncing from ${fromInstance} to ${toInstance}...\n`);

      if (!options.force) {
        console.log("⚠️  This will overwrite configurations in the target instance.");
        process.stdout.write("Type 'yes' to confirm: ");

        process.stdin.setRawMode(false);
        const input = await new Promise<string>((resolve) => {
          const handler = (data: Buffer) => {
            process.stdin.off("data", handler);
            resolve(data.toString().trim());
          };
          process.stdin.once("data", handler);
        });

        if (input.toLowerCase() !== "yes") {
          console.log("❌ Sync cancelled");
          process.exit(0);
        }
      }
    }

    const summary = await performSync(syncOptions);

    console.log(`\n📊 Sync Summary:`);
    console.log(`From: ${summary.fromInstance}`);
    console.log(`To: ${summary.toInstance}`);
    console.log(`Mode: ${summary.dryRun ? "Dry Run" : "Live Sync"}\n`);

    summary.results.forEach(result => {
      const icon = result.success ? "✅" : "❌";
      console.log(`${icon} ${result.category}: ${result.message}`);

      if (result.changes && Object.keys(result.changes).length > 0) {
        Object.entries(result.changes).forEach(([field, change]) => {
          console.log(`  ${field}: "${String(change.from)}" → "${String(change.to)}"`);
        });
      }
    });

    if (summary.totalErrors > 0) {
      console.log(`\n❌ ${summary.totalErrors} error(s) occurred during sync`);
      process.exit(1);
    } else if (summary.totalChanges === 0) {
      console.log(`\n✅ No changes needed - instances are already synchronized`);
    } else if (summary.dryRun) {
      console.log(`\n💡 ${summary.totalChanges} change(s) would be made. Use without --dry-run to apply changes.`);
    } else {
      console.log(`\n✅ Successfully synchronized ${summary.totalChanges} change(s)`);
    }

  } catch (error) {
    console.error(`❌ Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

export async function syncForTui(options: SyncCommandOptions): Promise<SyncSummary> {
  if (!options.from || !options.to) {
    throw new Error("Both from and to instance parameters are required for sync");
  }

  const fromInstance = options.from;
  const toInstance = options.to;

  const syncOptions: SyncOptions = {
    from: fromInstance,
    to: toInstance,
    config: options.config,
    theme: options.theme,
    assets: options.assets,
    pages: options.pages,
    pagePrefix: options.pagePrefix,
    all: options.all,
    dryRun: options.dryRun,
  };

  return performSync(syncOptions);
}