import "dotenv/config";
import { configManager, type IConfigManager } from "@/config/configManager";
import { logger } from "@/utils/logger";

interface WikiConfig {
  url: string;
  key: string;
}

// Dynamically detect legacy .env-based configs
function getLegacyConfigs(): Record<string, WikiConfig> {
  const configs: Record<string, WikiConfig> = {};
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
      const instanceId = prefix.toLowerCase();
      configs[instanceId] = { url, key };
    }
  }

  return configs;
}

// Initialize config manager
let configInitialized = false;

async function ensureConfigInitialized(): Promise<void> {
  if (configInitialized) return;

  try {
    await configManager.initialize();
    configInitialized = true;
  } catch (error) {
    logger.error({ err: error }, "Failed to initialize config manager");
  }
}

export async function getDynamicConfig(instance?: string): Promise<WikiConfig> {
  // If no instance specified, try to use the default from environment
  if (!instance) {
    instance = process.env.WIKIJS_DEFAULT_INSTANCE;
    // If still no instance, use the first available one
    if (!instance) {
      const availableInstances = await getAvailableInstances();
      if (availableInstances.length > 0) {
        instance = availableInstances[0];
        logger.debug({ instance, availableInstances }, "Auto-selected instance");
      } else {
        logger.error("No instances configured");
        process.exit(1);
      }
    }
  }
  await ensureConfigInitialized();

  // At this point, instance is guaranteed to be defined
  const instanceId = instance as string;

  // Try to get from encrypted config first
  try {
    const configInstance = await configManager.getInstance(instanceId);
    if (configInstance) {
      return {
        url: configInstance.url,
        key: configInstance.key
      };
    }
  } catch {
    // Fallback to legacy config
  }

  // Fallback to legacy .env config
  const legacyConfigs = getLegacyConfigs();
  const legacyConfig = legacyConfigs[instanceId];
  if (legacyConfig && legacyConfig.url && legacyConfig.key) {
    return legacyConfig;
  }

  // No valid config found
  const availableInstances = await getAvailableInstances();
  if (availableInstances.length === 0) {
    logger.error("No instances configured");
    process.exit(1);
  }

  logger.error({ instanceId, availableInstances }, "Unknown or unconfigured instance");
  process.exit(1);
}

export async function getAvailableInstances(): Promise<string[]> {
  await ensureConfigInitialized();

  const encryptedInstances = configManager.getInstanceIds();

  // For backwards compatibility with existing users, only include legacy
  // instances if there are no encrypted instances configured
  if (encryptedInstances.length > 0) {
    return encryptedInstances;
  }

  const legacyConfigs = getLegacyConfigs();
  const legacyInstances = Object.keys(legacyConfigs);

  return legacyInstances;
}

export async function getInstanceLabels(): Promise<Record<string, string>> {
  await ensureConfigInitialized();

  const labels: Record<string, string> = {};

  // Add encrypted config instances
  for (const instanceId of configManager.getInstanceIds()) {
    const info = configManager.getInstanceInfo(instanceId);
    if (info) {
      labels[instanceId] = info.name;
    }
  }

  // Add legacy instances with auto-generated labels
  const legacyConfigs = getLegacyConfigs();

  for (const [id, config] of Object.entries(legacyConfigs)) {
    if (config.url && config.key && !labels[id]) {
      // Generate label from instance ID
      const label = id
        .split(/(?=[A-Z])|_/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      labels[id] = label;
    }
  }

  return labels;
}

export function getConfigManager(): IConfigManager {
  return configManager;
}

export async function hasAnyInstances(): Promise<boolean> {
  await ensureConfigInitialized();
  const instances = await getAvailableInstances();
  return instances.length > 0;
}

export async function needsSetup(): Promise<boolean> {
  await ensureConfigInitialized();

  // Only check for encrypted config - ignore legacy for setup purposes
  const hasEncrypted = configManager.getInstanceIds().length > 0;

  // Need setup if we have no encrypted configurations
  return !hasEncrypted;
}

export async function getDefaultTheme(): Promise<string | null> {
  await ensureConfigInitialized();
  return configManager.getDefaultTheme();
}

export async function setDefaultTheme(theme: string): Promise<void> {
  await ensureConfigInitialized();
  configManager.setDefaultTheme(theme);
}