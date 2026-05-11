import type { EncryptedConfig } from "./model";

export const CURRENT_CONFIG_VERSION = "0.1.1";

type ConfigTransform = (cfg: EncryptedConfig) => EncryptedConfig;

const TRANSFORMS: ConfigTransform[] = [
  stampCurrentVersion,
];

function stampCurrentVersion(cfg: EncryptedConfig): EncryptedConfig {
  return cfg.version === CURRENT_CONFIG_VERSION
    ? cfg
    : { ...cfg, version: CURRENT_CONFIG_VERSION };
}

export function migrateConfigVersion(cfg: EncryptedConfig): {
  config: EncryptedConfig;
  changed: boolean;
} {
  let current = cfg;
  for (const transform of TRANSFORMS) {
    current = transform(current);
  }
  const changed = JSON.stringify(cfg) !== JSON.stringify(current);
  return { config: current, changed };
}
