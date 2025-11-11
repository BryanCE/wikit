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

export async function compareInstances(
  options: CompareOptions
): Promise<CompareResults> {
  const instance1 = options.from ?? "rmwiki";
  const instance2 = options.to ?? "tlwiki";

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
    const [config1, config2] = await Promise.all([
      getSiteConfig(instance1),
      getSiteConfig(instance2),
    ]);
    results.siteConfig = compareObjects(
      config1,
      config2,
      "Site Configuration",
      instance1Name,
      instance2Name
    );
  }

  if ((options.theme ?? false) || shouldCompareAll) {
    const [theme1, theme2] = await Promise.all([
      getThemeConfig(instance1),
      getThemeConfig(instance2),
    ]);
    results.themeConfig = compareObjects(
      theme1,
      theme2,
      "Theme Configuration",
      instance1Name,
      instance2Name
    );
  }

  if ((options.localization ?? false) || shouldCompareAll) {
    const [localization1, localization2] = await Promise.all([
      getLocalizationConfig(instance1),
      getLocalizationConfig(instance2),
    ]);
    results.localizationConfig = compareObjects(
      localization1,
      localization2,
      "Localization Configuration",
      instance1Name,
      instance2Name
    );
  }

  if ((options.navigation ?? false) || shouldCompareAll) {
    const [navigation1, navigation2] = await Promise.all([
      getNavigationConfig(instance1),
      getNavigationConfig(instance2),
    ]);
    results.navigationConfig = compareObjects(
      navigation1,
      navigation2,
      "Navigation Configuration",
      instance1Name,
      instance2Name
    );
  }

  if ((options.users ?? false) || shouldCompareAll) {
    const [users1, users2] = await Promise.all([
      getUserSummary(instance1),
      getUserSummary(instance2),
    ]);
    results.userSummary = compareObjects(
      users1,
      users2,
      "User Summary",
      instance1Name,
      instance2Name
    );
  }

  if ((options.system ?? false) || shouldCompareAll) {
    const [system1, system2] = await Promise.all([
      getSystemInfo(instance1),
      getSystemInfo(instance2),
    ]);
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
      const [pages1, pages2] = await Promise.all([
        getAllPages(instance1),
        getAllPages(instance2),
      ]);

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
      const [pages1, pages2] = await Promise.all([
        getAllPages(instance1),
        getAllPages(instance2),
      ]);

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
  const instance1Name =
    instanceLabels[options.from ?? "rmwiki"] ?? options.from ?? "rmwiki";
  const instance2Name =
    instanceLabels[options.to ?? "tlwiki"] ?? options.to ?? "tlwiki";

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
