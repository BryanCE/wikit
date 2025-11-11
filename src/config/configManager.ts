import { createHash, randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface WikiInstance {
  id: string;
  name: string;
  url: string;
  key: string;
}

export interface EncryptedConfig {
  version: string;
  instances: {
    id: string;
    name: string;
    url: string;
    encryptedKey: string;
    iv: string;
  }[];
  salt: string;
  preferences?: {
    defaultTheme?: string;
  };
}

export interface IConfigManager {
  initialize(password?: string): Promise<void>;
  addInstance(instance: WikiInstance): Promise<void>;
  updateInstance(instanceId: string, updates: Partial<WikiInstance>): Promise<void>;
  removeInstance(instanceId: string): Promise<void>;
  getInstanceIds(): string[];
  getInstanceInfo(instanceId: string): { id: string; name: string; url: string } | null;
  getInstance(instanceId: string): Promise<WikiInstance | null>;
  testConnection(instanceId: string): Promise<boolean>;
  hasConfigFile(): boolean;
  getConfigPath(): string;
  resetConfig(): Promise<void>;
  getAllInstances(): Array<{ id: string; name: string; url: string }>;
  getDefaultTheme(): string | null;
  setDefaultTheme(theme: string): void;
}

const ALGORITHM = "aes-256-gcm";
const CONFIG_DIR = join(homedir(), ".config", "wikit");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

class ConfigManager {
  private encryptionKey: Buffer | null = null;
  private config: EncryptedConfig | null = null;

  private deriveKey(password: string, salt: Buffer): Buffer {
    return createHash("sha256")
      .update(password)
      .update(salt)
      .digest();
  }

  private encrypt(text: string, key: Buffer): { encrypted: string; iv: string; tag: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex")
    };
  }

  private decrypt(encryptedData: string, key: Buffer, iv: string, tag: string): string {
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(tag, "hex"));

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  private generateSystemId(): string {
    // Generate a unique system identifier
    const { platform, arch, release } = process;
    const systemInfo = `${platform}-${arch}-${release.name}`;
    return createHash("sha256").update(systemInfo).digest("hex").slice(0, 16);
  }

  private getDefaultPassword(): string {
    // Use system info as default encryption password
    return this.generateSystemId();
  }

  async initialize(password?: string): Promise<void> {
    const configPassword = password ?? this.getDefaultPassword();

    if (existsSync(CONFIG_FILE)) {
      await this.loadConfig(configPassword);
    } else {
      await this.createDefaultConfig(configPassword);
    }
  }

  private async loadConfig(password: string): Promise<void> {
    try {
      const configData = readFileSync(CONFIG_FILE, "utf8");
      this.config = JSON.parse(configData) as EncryptedConfig;

      if (!this.config?.salt) {
        throw new Error("Invalid config format");
      }

      const salt = Buffer.from(this.config.salt, "hex");
      this.encryptionKey = this.deriveKey(password, salt);
    } catch (error) {
      throw new Error(`Failed to load config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createDefaultConfig(password: string): Promise<void> {
    // Ensure config directory exists
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }

    const salt = randomBytes(32);
    this.encryptionKey = this.deriveKey(password, salt);

    this.config = {
      version: "1.0.0",
      instances: [],
      salt: salt.toString("hex"),
      preferences: {}
    };

    this.saveConfig();
  }

  private saveConfig(): void {
    if (!this.config) {
      throw new Error("No config to save");
    }

    writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  async addInstance(instance: WikiInstance): Promise<void> {
    if (!this.config || !this.encryptionKey) {
      throw new Error("Config not initialized");
    }

    // Check if instance ID already exists
    if (this.config.instances.some(i => i.id === instance.id)) {
      throw new Error(`Instance with ID '${instance.id}' already exists`);
    }

    const { encrypted, iv, tag } = this.encrypt(instance.key, this.encryptionKey);

    this.config.instances.push({
      id: instance.id,
      name: instance.name,
      url: instance.url,
      encryptedKey: `${encrypted}:${tag}`,
      iv
    });

    this.saveConfig();
  }

  async updateInstance(instanceId: string, updates: Partial<WikiInstance>): Promise<void> {
    if (!this.config || !this.encryptionKey) {
      throw new Error("Config not initialized");
    }

    const instanceIndex = this.config.instances.findIndex(i => i.id === instanceId);
    if (instanceIndex === -1) {
      throw new Error(`Instance '${instanceId}' not found`);
    }

    const instance = this.config.instances[instanceIndex];
    if (!instance) {
      throw new Error(`Instance '${instanceId}' not found`);
    }

    if (updates.name) instance.name = updates.name;
    if (updates.url) instance.url = updates.url;
    if (updates.key) {
      const { encrypted, iv, tag } = this.encrypt(updates.key, this.encryptionKey);
      instance.encryptedKey = `${encrypted}:${tag}`;
      instance.iv = iv;
    }

    this.saveConfig();
  }

  async removeInstance(instanceId: string): Promise<void> {
    if (!this.config) {
      throw new Error("Config not initialized");
    }

    const instanceIndex = this.config.instances.findIndex(i => i.id === instanceId);
    if (instanceIndex === -1) {
      throw new Error(`Instance '${instanceId}' not found`);
    }

    this.config.instances.splice(instanceIndex, 1);
    this.saveConfig();
  }

  getInstanceIds(): string[] {
    return this.config?.instances.map(i => i.id) ?? [];
  }

  getInstanceInfo(instanceId: string): { id: string; name: string; url: string } | null {
    const instance = this.config?.instances.find(i => i.id === instanceId);
    if (!instance) return null;

    return {
      id: instance.id,
      name: instance.name,
      url: instance.url
    };
  }

  async getInstance(instanceId: string): Promise<WikiInstance | null> {
    if (!this.config || !this.encryptionKey) {
      throw new Error("Config not initialized");
    }

    const instance = this.config.instances.find(i => i.id === instanceId);
    if (!instance) return null;

    try {
      const parts = instance.encryptedKey.split(":");
      if (parts.length !== 2) {
        throw new Error("Invalid encrypted key format");
      }
      const [encrypted, tag] = parts;

      if (!encrypted || !tag) {
        throw new Error("Invalid encrypted key format: missing encrypted data or tag");
      }

      if (!instance.iv) {
        throw new Error("Missing IV for instance decryption");
      }

      const key = this.decrypt(encrypted, this.encryptionKey, instance.iv, tag);

      return {
        id: instance.id,
        name: instance.name,
        url: instance.url,
        key
      };
    } catch (error) {
      throw new Error(`Failed to decrypt instance '${instanceId}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(instanceId: string): Promise<boolean> {
    const instance = await this.getInstance(instanceId);
    if (!instance) return false;

    // Basic validation - could be enhanced with actual API test
    try {
      new URL(instance.url);
      return instance.key.length > 0;
    } catch {
      return false;
    }
  }

  hasConfigFile(): boolean {
    return existsSync(CONFIG_FILE);
  }

  getConfigPath(): string {
    return CONFIG_FILE;
  }

  async resetConfig(): Promise<void> {
    const fs = await import("fs");

    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }

    this.config = null;
    this.encryptionKey = null;
  }

  getAllInstances(): Array<{ id: string; name: string; url: string }> {
    return this.config?.instances.map(i => ({
      id: i.id,
      name: i.name,
      url: i.url
    })) ?? [];
  }

  getDefaultTheme(): string | null {
    return this.config?.preferences?.defaultTheme ?? null;
  }

  setDefaultTheme(theme: string): void {
    if (!this.config) {
      throw new Error("Config not initialized");
    }

    this.config.preferences ??= {};

    this.config.preferences.defaultTheme = theme;
    this.saveConfig();
  }
}

export const configManager = new ConfigManager();