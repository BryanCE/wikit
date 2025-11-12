import {
  getSiteConfig,
  getThemeConfig,
  getLocalizationConfig,
  getUserSummary,
  getSystemInfo,
} from "@/api/config";
import { getNavigationConfig } from "@/api/navigation";
import { getAllPages } from "@/api/pages";
import { createPageSummary } from "@/utils/pages";
import { instanceLabels } from "@/config";
import {
  compareObjects,
  comparePageLists,
  printComparison,
  printPageComparison,
} from "@/utils/diff";
import type {
  CompareOptions,
  CompareResults,
} from "@/types";
import { InstanceContext } from "@/contexts/InstanceContext";

export async function compareInstances(
  options: CompareOptions
): Promise<CompareResults> {
  if (!options.from || !options.to) {
    throw new Error("Both --from and --to instance parameters are required for comparison");
  }

  const instance1 = options.from;
  const instance2 = options.to;

  const instance1Name = instanceLabels[instance1] ?? instance1;
  const instance2Name = instanceLabels[instance2] ?? instance2;

  const results: CompareResults = {
    instance1Name,
    instance2Name,
  };

  const shouldCompareAll =
    options.all ??
    (!options.config &&
      !options.pages &&
      !options.users &&
      !options.theme &&
      !options.system &&
      !options.localization &&
      !options.navigation);

  if ((options.config ?? false) || shouldCompareAll) {
    InstanceContext.setInstance(instance1);
    const config1 = await getSiteConfig();
    InstanceContext.setInstance(instance2);
    const config2 = await getSiteConfig();
    results.siteConfig = compareObjects(
      config1,
      config2,
      "Site Configuration",
      instance1Name,
      instance2Name
    );
  }

  if ((options.theme ?? false) || shouldCompareAll) {
    InstanceContext.setInstance(instance1);
    const theme1 = await getThemeConfig();
    InstanceContext.setInstance(instance2);
    const theme2 = await getThemeConfig();
    results.themeConfig = compareObjects(
      theme1,
      theme2,
      "Theme Configuration",
      instance1Name,
      instance2Name
    );
  }

  if ((options.localization ?? false) || shouldCompareAll) {
    InstanceContext.setInstance(instance1);
    const localization1 = await getLocalizationConfig();
    InstanceContext.setInstance(instance2);
    const localization2 = await getLocalizationConfig();
    results.localizationConfig = compareObjects(
      localization1,
      localization2,
      "Localization Configuration",
      instance1Name,
      instance2Name
    );
  }

  if ((options.navigation ?? false) || shouldCompareAll) {
    InstanceContext.setInstance(instance1);
    const navigation1 = await getNavigationConfig();
    InstanceContext.setInstance(instance2);
    const navigation2 = await getNavigationConfig();
    results.navigationConfig = compareObjects(
      navigation1,
      navigation2,
      "Navigation Configuration",
      instance1Name,
      instance2Name
    );
  }

  if ((options.users ?? false) || shouldCompareAll) {
    InstanceContext.setInstance(instance1);
    const users1 = await getUserSummary();
    InstanceContext.setInstance(instance2);
    const users2 = await getUserSummary();
    results.userSummary = compareObjects(
      users1,
      users2,
      "User Summary",
      instance1Name,
      instance2Name
    );
  }

  if ((options.system ?? false) || shouldCompareAll) {
    InstanceContext.setInstance(instance1);
    const system1 = await getSystemInfo();
    InstanceContext.setInstance(instance2);
    const system2 = await getSystemInfo();
    results.systemInfo = compareObjects(
      system1,
      system2,
      "System Information",
      instance1Name,
      instance2Name
    );
  }

  if ((options.pages ?? false) || shouldCompareAll) {
    if (options.pagePrefix) {
      InstanceContext.setInstance(instance1);
      const pages1 = await getAllPages();
      InstanceContext.setInstance(instance2);
      const pages2 = await getAllPages();

      const filteredPages1 = pages1
        .filter((p) => p.path.startsWith(options.pagePrefix!))
        .map((p) => p.path);
      const filteredPages2 = pages2
        .filter((p) => p.path.startsWith(options.pagePrefix!))
        .map((p) => p.path);

      results.pageComparison = comparePageLists(
        filteredPages1,
        filteredPages2,
        `Pages under '${options.pagePrefix}'`
      );
    } else {
      InstanceContext.setInstance(instance1);
      const pages1 = await getAllPages();
      InstanceContext.setInstance(instance2);
      const pages2 = await getAllPages();

      const summary1 = createPageSummary(pages1);
      const summary2 = createPageSummary(pages2);

      results.pageSummary = compareObjects(
        summary1,
        summary2,
        "Page Summary",
        instance1Name,
        instance2Name
      );
    }
  }

  return results;
}

export async function compareForCli(options: CompareOptions): Promise<void> {
  if (!options.from || !options.to) {
    console.error("❌ Both --from and --to parameters are required for comparison");
    process.exit(1);
  }

  const instance1Name =
    instanceLabels[options.from] ?? options.from;
  const instance2Name =
    instanceLabels[options.to] ?? options.to;

  console.log(`🔍 Comparing ${instance1Name} vs ${instance2Name}...\n`);

  try {
    const results = await compareInstances(options);

    let hasDifferences = false;

    if (results.siteConfig) {
      printComparison(
        results.siteConfig,
        instance1Name,
        instance2Name,
        options.details
      );
      if (results.siteConfig.hasDifferences) hasDifferences = true;
    }

    if (results.themeConfig) {
      printComparison(
        results.themeConfig,
        instance1Name,
        instance2Name,
        options.details
      );
      if (results.themeConfig.hasDifferences) hasDifferences = true;
    }

    if (results.localizationConfig) {
      printComparison(
        results.localizationConfig,
        instance1Name,
        instance2Name,
        options.details
      );
      if (results.localizationConfig.hasDifferences) hasDifferences = true;
    }

    if (results.navigationConfig) {
      printComparison(
        results.navigationConfig,
        instance1Name,
        instance2Name,
        options.details
      );
      if (results.navigationConfig.hasDifferences) hasDifferences = true;
    }

    if (results.userSummary) {
      printComparison(
        results.userSummary,
        instance1Name,
        instance2Name,
        options.details
      );
      if (results.userSummary.hasDifferences) hasDifferences = true;
    }

    if (results.systemInfo) {
      printComparison(
        results.systemInfo,
        instance1Name,
        instance2Name,
        options.details
      );
      if (results.systemInfo.hasDifferences) hasDifferences = true;
    }

    if (results.pageSummary) {
      printComparison(
        results.pageSummary,
        instance1Name,
        instance2Name,
        options.details
      );
      if (results.pageSummary.hasDifferences) hasDifferences = true;
    }

    if (results.pageComparison) {
      printPageComparison(
        results.pageComparison,
        instance1Name,
        instance2Name,
        options.details
      );
      if (results.pageComparison.hasDifferences) hasDifferences = true;
    }

    console.log(`\n${hasDifferences ? "❌" : "✅"} Comparison complete`);

    if (hasDifferences) {
      console.log("💡 Use --details flag to see full comparison details");
      console.log("💡 Use 'wikit sync' to synchronize configurations");
    }
  } catch (error) {
    console.error(
      `❌ Comparison failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    process.exit(1);
  }
}

export async function compareForTui(
  options: CompareOptions
): Promise<CompareResults> {
  return compareInstances(options);
}
