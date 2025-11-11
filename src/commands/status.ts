import {
  getSiteConfig,
  getThemeConfig,
  getUserSummary,
  getSystemInfo,
} from "@/api/config";
import { getAllPages } from "@/api/pages";
import { createPageSummary } from "@/utils/pages";
import { getAvailableInstances, getInstanceLabels } from "@/config/dynamicConfig";
import {
  type StatusOptions,
  type InstanceStatus,
  type StatusResult,
  type HealthStatus,
  type AllInstancesStatusResult,
} from "@/types";
import { InstanceContext } from "@/contexts/InstanceContext";

async function getInstanceStatus(instance: string): Promise<InstanceStatus> {
  InstanceContext.setInstance(instance);
  const [siteConfig, themeConfig, userSummary, systemInfo, allPages, instanceLabels] =
    await Promise.all([
      getSiteConfig(),
      getThemeConfig(),
      getUserSummary(),
      getSystemInfo(),
      getAllPages(),
      getInstanceLabels(),
    ]);

  const pageSummary = createPageSummary(allPages);

  return {
    instanceName: instanceLabels[instance] ?? instance,
    siteTitle: siteConfig.title,
    theme: themeConfig.theme,
    logoUrl: siteConfig.logoUrl,
    totalPages: pageSummary.totalPages,
    publishedPages: pageSummary.publishedPages,
    totalUsers: userSummary.totalUsers,
    adminUsers: userSummary.adminUsers,
    version: systemInfo.currentVersion,
    locales: Object.keys(pageSummary.pagesByLocale),
  };
}

async function checkInstanceHealth(instance: string): Promise<HealthStatus> {
  const startTime = Date.now();

  try {
    InstanceContext.setInstance(instance);
    // Test basic connectivity by getting system info
    const systemInfo = await getSystemInfo();
    const responseTime = Date.now() - startTime;

    return {
      isHealthy: true,
      responseTime,
      statusMessage: "Instance is responding normally",
      version: systemInfo.currentVersion,
      uptime: undefined,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      isHealthy: false,
      responseTime,
      statusMessage:
        error instanceof Error ? error.message : "Unknown error",
      version: "unknown",
    };
  }
}

async function getInstanceStatusWithHealth(
  instance: string
): Promise<StatusResult> {
  const [instanceStatus, health] = await Promise.all([
    getInstanceStatus(instance),
    checkInstanceHealth(instance),
  ]);

  return {
    instance: instanceStatus,
    health,
  };
}

export async function statusForCli(_options: StatusOptions): Promise<void> {
  try {
    const [instances, instanceLabels] = await Promise.all([
      getAvailableInstances(),
      getInstanceLabels(),
    ]);
    console.log("Checking all instance health...\n");

    // Pre-fetch all configs (including decryption) before timing
    await Promise.all(
      instances.map((instance) => import("@/config/dynamicConfig").then(m => m.getDynamicConfig(instance)))
    );

    const results = await Promise.allSettled(
      instances.map((instance) => getInstanceStatusWithHealth(instance))
    );

    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      const result = results[i];

      if (result && result.status === "fulfilled") {
        const data = result.value;
        const healthStatus = data.health.isHealthy ? "HEALTHY" : "UNHEALTHY";

        console.log(`${data.instance.instanceName}: ${healthStatus}`);
        console.log(`  Status: ${data.health.statusMessage}`);
        console.log(`  Response Time: ${data.health.responseTime}ms`);
        if (data.health.uptime) {
          console.log(`  Uptime: ${data.health.uptime}`);
        }
        console.log(
          `  Pages: ${data.instance.publishedPages}/${data.instance.totalPages} published`
        );
        console.log(
          `  Users: ${data.instance.totalUsers} total, ${data.instance.adminUsers} admins`
        );
        console.log(`  Version: ${data.instance.version}`);
      } else if (result) {
        const rejectedReason = result.reason as Error;
        console.log(`${instance ? instanceLabels[instance] ?? instance : 'Unknown'}: UNREACHABLE`);
        console.log(
          `  Error: ${
            rejectedReason instanceof Error
              ? rejectedReason.message
              : String(rejectedReason)
          }`
        );
      }

      if (i < instances.length - 1) {
        console.log();
      }
    }
  } catch (error) {
    console.error(
      `Status check failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    process.exit(1);
  }
}

export async function statusForTui(
  _options: StatusOptions
): Promise<AllInstancesStatusResult> {
  const [instances, instanceLabels] = await Promise.all([
    getAvailableInstances(),
    getInstanceLabels(),
  ]);

  // Pre-fetch all configs (including decryption) before timing
  await Promise.all(
    instances.map((instance) => import("@/config/dynamicConfig").then(m => m.getDynamicConfig(instance)))
  );

  const results = await Promise.allSettled(
    instances.map((instance) => getInstanceStatusWithHealth(instance))
  );

  const instanceResults = results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      const instance = instances[index];
      return {
        instance: {
          instanceName: instance ? instanceLabels[instance] ?? instance : 'Unknown',
          siteTitle: "Unavailable",
          theme: "Unknown",
          logoUrl: "",
          totalPages: 0,
          publishedPages: 0,
          totalUsers: 0,
          adminUsers: 0,
          version: "Unknown",
          locales: [],
        },
        health: {
          isHealthy: false,
          responseTime: 0,
          statusMessage:
            result.reason instanceof Error
              ? result.reason.message
              : "Connection failed",
          version: "Unknown",
        },
      };
    }
  });

  return { instances: instanceResults };
}
