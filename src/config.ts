import "dotenv/config";
import { logger } from "@/utils/logger";

interface WikiConfig {
  url: string;
  key: string;
}

// Dynamically build configs from environment variables
function getConfigsFromEnv(): Record<string, WikiConfig> {
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

// Dynamically build instance labels from environment variables
function getInstanceLabelsFromEnv(): Record<string, string> {
  const labels: Record<string, string> = {};
  const urlPattern = /_API_URL$/;
  const detectedPrefixes = new Set<string>();

  // Find all env vars ending in _API_URL
  for (const key in process.env) {
    if (urlPattern.test(key)) {
      const prefix = key.replace(/_API_URL$/, '');
      detectedPrefixes.add(prefix);
    }
  }

  // For each prefix, generate a label
  for (const prefix of detectedPrefixes) {
    const instanceId = prefix.toLowerCase();

    const name = prefix
      .split(/(?=[A-Z])|_/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    labels[instanceId] = name;
  }

  return labels;
}

export const instanceLabels = getInstanceLabelsFromEnv();

export function getConfig(instance?: string): WikiConfig {
  const configs = getConfigsFromEnv();

  if (!instance) {
    const availableInstances = Object.keys(configs);
    if (availableInstances.length === 0) {
      logger.error("No instances configured in environment");
      process.exit(1);
    }
    instance = availableInstances[0]!;
  }

  const config = configs[instance];

  if (!config) {
    logger.error({ instance, available: Object.keys(configs) }, "Unknown instance");
    process.exit(1);
  }

  if (!config.url || !config.key) {
    logger.error({ instance }, "Missing API_URL or API_KEY for instance");
    process.exit(1);
  }

  return config;
}
