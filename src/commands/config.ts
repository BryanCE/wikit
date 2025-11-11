import { getConfigManager, getAvailableInstances } from "@/config/dynamicConfig";
import { migrateFromEnv, exportToEnv, importFromConfig } from "@/config/migration";
import { getConfigStatus, resetEncryptedConfig } from "@/config/advancedMigration";
import type { WikiInstance } from "@/config/configManager";
import type { ConfigOptions } from "@/types";

export async function configCommand(options: ConfigOptions = {}): Promise<void> {
  const configManager = getConfigManager();
  await configManager.initialize();

  if (options.list) {
    await listInstances();
  } else if (options.add) {
    await addInstanceInteractive();
  } else if (options.edit) {
    await editInstance(options.edit);
  } else if (options.remove) {
    await removeInstance(options.remove);
  } else if (options.test) {
    await testInstance(options.test);
  } else if (options.setup) {
    await setupWizard();
  } else if (options.migrate) {
    await migrateFromEnv({ dryRun: options.dryRun, overwrite: options.overwrite });
  } else if (options.export) {
    await exportToEnv();
  } else if (options.import) {
    await importFromConfig(options.import);
  } else if (options.status) {
    await showConfigStatus();
  } else if (options.reset) {
    await resetConfigInteractive();
  } else {
    await showConfigMenu();
  }
}

async function listInstances(): Promise<void> {
  console.log("Configured Wiki.js Instances:");
  console.log("");

  const instances = await getAvailableInstances();

  if (instances.length === 0) {
    console.log("No instances configured.");
    console.log("Run 'wikit config --setup' to configure your first instance.");
    return;
  }

  const configManager = getConfigManager();

  for (const instanceId of instances) {
    try {
      const info = configManager.getInstanceInfo(instanceId);
      if (info) {
        console.log(`  ${instanceId}:`);
        console.log(`    Name: ${info.name}`);
        console.log(`    URL:  ${info.url}`);
        console.log("");
      } else {
        // Legacy .env instance
        console.log(`  ${instanceId}: (from .env file)`);
        console.log("");
      }
    } catch {
      console.log(`  ${instanceId}: Error loading configuration`);
      console.log("");
    }
  }
}

async function addInstanceInteractive(): Promise<void> {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise(resolve => rl.question(prompt, resolve));
  };

  try {
    console.log("Add New Wiki.js Instance");
    console.log("");

    const instance: WikiInstance = {
      id: "",
      name: "",
      url: "",
      key: "",
    };

    instance.id = await question("Instance ID (e.g., 'mywiki'): ");
    if (!instance.id.trim()) {
      console.log("Instance ID is required.");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(instance.id)) {
      console.log("Instance ID can only contain letters, numbers, underscores, and dashes.");
      return;
    }

    instance.name = await question("Display Name (e.g., 'My Wiki'): ");
    if (!instance.name.trim()) {
      console.log("Display name is required.");
      return;
    }

    instance.url = await question("API URL (e.g., 'https://your-wiki.com/graphql'): ");
    if (!instance.url.trim()) {
      console.log("API URL is required.");
      return;
    }

    try {
      new URL(instance.url);
    } catch {
      console.log("Invalid URL format.");
      return;
    }

    instance.key = await question("API Key: ");
    if (!instance.key.trim()) {
      console.log("API Key is required.");
      return;
    }

    const configManager = getConfigManager();
    await configManager.addInstance(instance);

    console.log("");
    console.log(`Instance '${instance.name}' added successfully!`);

    const testConnection = await question("Test connection now? (y/N): ");
    if (testConnection.toLowerCase() === "y" || testConnection.toLowerCase() === "yes") {
      await testInstance(instance.id);
    }

  } catch (error) {
    console.error(`Error adding instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    rl.close();
  }
}

async function editInstance(instanceId: string): Promise<void> {
  const configManager = getConfigManager();

  try {
    const instance = await configManager.getInstance(instanceId);
    if (!instance) {
      console.log(`Instance '${instanceId}' not found.`);
      return;
    }

    console.log(`Edit Instance: ${instance.name}`);
    console.log("");
    console.log("Current configuration:");
    console.log(`  ID:   ${instance.id}`);
    console.log(`  Name: ${instance.name}`);
    console.log(`  URL:  ${instance.url}`);
    console.log(`  Key:  ${"•".repeat(Math.min(instance.key.length, 20))}`);
    console.log("");
    console.log("Note: Use the TUI mode for interactive editing: 'wikit tui' then '/config'");

  } catch (error) {
    console.error(`Error loading instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function removeInstance(instanceId: string): Promise<void> {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise(resolve => rl.question(prompt, resolve));
  };

  try {
    const configManager = getConfigManager();
    const info = configManager.getInstanceInfo(instanceId);

    if (!info) {
      console.log(`Instance '${instanceId}' not found.`);
      return;
    }

    console.log(`Remove Instance: ${info.name}`);
    console.log("");
    console.log("This action cannot be undone.");

    const confirm = await question("Are you sure you want to remove this instance? (y/N): ");

    if (confirm.toLowerCase() === "y" || confirm.toLowerCase() === "yes") {
      await configManager.removeInstance(instanceId);
      console.log(`Instance '${info.name}' removed successfully.`);
    } else {
      console.log("Operation cancelled.");
    }

  } catch (error) {
    console.error(`Error removing instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    rl.close();
  }
}

async function testInstance(instanceId: string): Promise<void> {
  console.log(`Testing connection to '${instanceId}'...`);

  try {
    const configManager = getConfigManager();
    const result = await configManager.testConnection(instanceId);

    if (result) {
      console.log("Connection test passed (basic validation)");
    } else {
      console.log("Connection test failed");
    }
  } catch (error) {
    console.error(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function setupWizard(): Promise<void> {
  console.log("Wiki.js CLI Setup Wizard");
  console.log("");
  console.log("This wizard will help you configure your first Wiki.js instance.");
  console.log("");

  const instances = await getAvailableInstances();
  if (instances.length > 0) {
    console.log("You already have instances configured:");
    await listInstances();
    console.log("Use 'wikit config --add' to add more instances.");
    return;
  }

  await addInstanceInteractive();
}

async function showConfigMenu(): Promise<void> {
  console.log("Wiki.js Configuration Management");
  console.log("");
  console.log("Usage: wikit config [options]");
  console.log("");
  console.log("Options:");
  console.log("  --list        List all configured instances");
  console.log("  --add         Add a new instance interactively");
  console.log("  --edit <id>   Show instance details (use TUI for editing)");
  console.log("  --remove <id> Remove an instance");
  console.log("  --test <id>   Test connection to an instance");
  console.log("  --setup       Run the setup wizard for first-time configuration");
  console.log("");
  console.log("Migration & Import/Export:");
  console.log("  --migrate     Migrate .env configuration to encrypted storage");
  console.log("  --dry-run     Show what would be migrated without making changes");
  console.log("  --overwrite   Overwrite existing instances during migration");
  console.log("  --export      Export encrypted config to .env format");
  console.log("  --import <file> Import instances from JSON config file");
  console.log("");
  console.log("Examples:");
  console.log("  wikit config --list");
  console.log("  wikit config --add");
  console.log("  wikit config --setup");
  console.log("");
  console.log("For interactive configuration management, use:");
  console.log("  wikit tui");
  console.log("  Then type '/config'");

  const instances = await getAvailableInstances();
  if (instances.length === 0) {
    console.log("");
    console.log("No instances configured. Run 'wikit config --setup' to get started!");
  }
}

async function showConfigStatus(): Promise<void> {
  console.log("Configuration Status");
  console.log("");

  try {
    const status = await getConfigStatus();

    console.log(`.env Configuration: ${status.hasEnvConfig ?
      `Found (${status.envInstances.length} instances)` :
      'Not found'
    }`);

    if (status.hasEnvConfig) {
      for (const instance of status.envInstances) {
        console.log(`    • ${instance.id} (${instance.name})`);
      }
      console.log("");
    }

    console.log(`Encrypted Configuration: ${status.hasEncryptedConfig ?
      `Found (${status.encryptedInstances.length} instances)` :
      'Not found'
    }`);

    if (status.hasEncryptedConfig) {
      console.log(`    Location: ${status.configPath}`);
      for (const instance of status.encryptedInstances) {
        console.log(`    • ${instance.id} (${instance.name})`);
      }
      console.log("");
    }

    if (!status.hasEnvConfig && !status.hasEncryptedConfig) {
      console.log("");
      console.log("No configuration found. Run 'wikit config --setup' to get started!");
    }

  } catch (error) {
    console.error(`Error checking status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function resetConfigInteractive(): Promise<void> {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise(resolve => rl.question(prompt, resolve));
  };

  try {
    console.log("Reset Encrypted Configuration");
    console.log("");
    console.log("This will completely remove your encrypted configuration file.");
    console.log("Your .env file (if present) will remain untouched.");
    console.log("");
    console.log("This action cannot be undone.");

    const confirm = await question("Are you sure you want to reset the encrypted configuration? (y/N): ");

    if (confirm.toLowerCase() === "y" || confirm.toLowerCase() === "yes") {
      await resetEncryptedConfig();
      console.log("Encrypted configuration reset successfully.");
      console.log("The application will now fall back to .env configuration if available.");
    } else {
      console.log("Operation cancelled.");
    }

  } catch (error) {
    console.error(`Reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    rl.close();
  }
}