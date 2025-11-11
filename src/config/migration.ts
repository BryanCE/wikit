import "dotenv/config";
import { getConfigManager } from "./dynamicConfig";
import type { WikiInstance } from "./configManager";

export interface MigrationOptions {
  dryRun?: boolean;
  overwrite?: boolean;
}

export async function migrateFromEnv(options: MigrationOptions = {}): Promise<void> {
  const configManager = getConfigManager();
  await configManager.initialize();

  // Check for existing .env instances
  const envInstances = getEnvInstances();

  if (envInstances.length === 0) {
    console.log("No .env configuration found to migrate.");
    return;
  }

  console.log(`Found ${envInstances.length} instance(s) in .env configuration:`);
  console.log("");

  for (const instance of envInstances) {
    console.log(`  ${instance.id}: ${instance.name}`);
    console.log(`    URL: ${instance.url}`);
    console.log(`    Key: ${"•".repeat(Math.min(instance.key.length, 20))}`);
    console.log("");
  }

  if (options.dryRun) {
    console.log("Dry run mode - no changes will be made.");
    return;
  }

  console.log("Migrating instances to encrypted configuration...");

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const instance of envInstances) {
    try {
      // Check if instance already exists
      const existingInfo = configManager.getInstanceInfo(instance.id);
      if (existingInfo && !options.overwrite) {
        console.log(`  Skipping ${instance.id} - already exists (use --overwrite to replace)`);
        skipped++;
        continue;
      }

      if (existingInfo && options.overwrite) {
        console.log(`  Updating ${instance.id}...`);
        await configManager.updateInstance(instance.id, instance);
      } else {
        console.log(`  Adding ${instance.id}...`);
        await configManager.addInstance(instance);
      }

      migrated++;
    } catch (error) {
      console.error(`  Error migrating ${instance.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      errors++;
    }
  }

  console.log("");
  console.log(`Migration complete:`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Errors:   ${errors}`);

  if (migrated > 0) {
    console.log("");
    console.log("Your instances are now stored in encrypted configuration at:");
    console.log(`  ${configManager.getConfigPath()}`);
    console.log("Your .env file can be kept for backwards compatibility or removed if no longer needed.");
  }
}

export async function exportToEnv(): Promise<void> {
  const configManager = getConfigManager();
  await configManager.initialize();

  const instanceIds = configManager.getInstanceIds();

  if (instanceIds.length === 0) {
    console.log("No encrypted instances found to export.");
    return;
  }

  console.log("Exporting encrypted instances to .env format:");
  console.log("");

  const envLines: string[] = [];

  for (const instanceId of instanceIds) {
    try {
      const instance = await configManager.getInstance(instanceId);
      if (!instance) continue;

      const envVarPrefix = instanceId.toUpperCase();

      envLines.push(`# ${instance.name}`);
      envLines.push(`${envVarPrefix}_API_URL=${instance.url}`);
      envLines.push(`${envVarPrefix}_API_KEY=${instance.key}`);
      envLines.push("");

      console.log(`Exported ${instanceId} (${instance.name})`);

    } catch (error) {
      console.error(`Error exporting ${instanceId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (envLines.length > 0) {
    console.log("");
    console.log("Add these lines to your .env file:");
    console.log("");
    console.log(envLines.join("\n"));
  }
}

function getEnvInstances(): WikiInstance[] {
  const instances: WikiInstance[] = [];

  // Dynamically detect all *_API_URL and *_API_KEY pairs
  const urlPattern = /_API_URL$/;
  const detectedPrefixes = new Set<string>();

  // Find all env vars ending in _API_URL
  for (const key in process.env) {
    if (urlPattern.test(key)) {
      const prefix = key.replace(/_API_URL$/, '');
      detectedPrefixes.add(prefix);
    }
  }

  // For each prefix, check if both URL and KEY exist
  for (const prefix of detectedPrefixes) {
    const urlKey = `${prefix}_API_URL`;
    const apiKeyKey = `${prefix}_API_KEY`;

    const url = process.env[urlKey];
    const key = process.env[apiKeyKey];

    if (url && key) {
      // Generate instance ID (lowercase)
      const instanceId = prefix
        .toLowerCase()
        .replace(/^wikijs$/, 'rmwiki'); // Special case: WIKIJS → rmwiki for backwards compat

      // Generate display name
      const name = prefix
        .split(/(?=[A-Z])|_/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .replace(/^Wikijs$/, 'RM Wiki'); // Special case

      instances.push({
        id: instanceId,
        name,
        url,
        key,
      });
    }
  }

  return instances;
}

export async function importFromConfig(configPath: string): Promise<void> {
  try {
    const fs = await import("fs");
    await import("path");

    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    const configData = fs.readFileSync(configPath, "utf8");
    let importData: unknown;

    try {
      importData = JSON.parse(configData) as unknown;
    } catch {
      throw new Error("Invalid JSON format in config file");
    }

    if (!importData || typeof importData !== "object" || !("instances" in importData) || !Array.isArray((importData as { instances?: unknown }).instances)) {
      throw new Error("Config file must contain an 'instances' array");
    }

    const configManager = getConfigManager();
    await configManager.initialize();

    const instances = (importData as { instances: unknown[] }).instances;
    console.log(`Importing ${instances.length} instance(s) from ${configPath}:`);
    console.log("");

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const instanceData of instances) {
      try {
        if (!instanceData || typeof instanceData !== "object" ||
            !("id" in instanceData) || !("name" in instanceData) ||
            !("url" in instanceData) || !("key" in instanceData) ||
            !instanceData.id || !instanceData.name || !instanceData.url || !instanceData.key) {
          throw new Error("Missing required fields (id, name, url, key)");
        }

        const instance: WikiInstance = {
          id: instanceData.id as string,
          name: instanceData.name as string,
          url: instanceData.url as string,
          key: instanceData.key as string,
        };

        // Check if instance already exists
        const existingInfo = configManager.getInstanceInfo(instance.id);
        if (existingInfo) {
          console.log(`  Skipping ${instance.id} - already exists`);
          skipped++;
          continue;
        }

        console.log(`  Importing ${instance.id} (${instance.name})...`);
        await configManager.addInstance(instance);
        imported++;

      } catch (error) {
        console.error(`  Error importing instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errors++;
      }
    }

    console.log("");
    console.log(`Import complete:`);
    console.log(`  Imported: ${imported}`);
    console.log(`  Skipped:  ${skipped}`);
    console.log(`  Errors:   ${errors}`);

  } catch (error) {
    throw new Error(`Failed to import config: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}