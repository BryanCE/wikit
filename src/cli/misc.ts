import type { Command } from "commander";
import { compareForCli } from "@/commands/compare";
import { statusForCli } from "@/commands/status";
import { syncForCli } from "@/commands/sync";
import { configCommand } from "@/commands/config";
import { analyzeCommand } from "@/commands/analyze";
import { compareExportsCommand } from "@/commands/compareExports";
import type { CompareOptions, StatusOptions, SyncOptions, ConfigOptions } from "@/types";

export function register(program: Command) {
  program
    .command("compare")
    .description("Compare configurations between instances")
    .option("--from <instance>", "Source instance")
    .option("--to <instance>", "Target instance")
    .option("--config", "Compare site configuration")
    .option("--theme", "Compare theme configuration")
    .option("--assets", "Compare asset configuration")
    .option("--pages", "Compare page summaries")
    .option("--users", "Compare user summaries")
    .option("--system", "Compare system information")
    .option("--all", "Compare all configurations")
    .option("--details", "Show detailed comparison")
    .option("--page-prefix <prefix>", "Compare pages under specific prefix")
    .action(async (options: CompareOptions) => {
      await compareForCli(options);
    });

  program
    .command("status")
    .description("Show instance status and differences")
    .option("--from <instance>", "First instance")
    .option("--to <instance>", "Second instance")
    .option("--verbose", "Show verbose output")
    .action(async (options: StatusOptions) => {
      await statusForCli(options);
    });

  program
    .command("sync")
    .description("Synchronize configurations between instances")
    .option("--from <instance>", "Source instance")
    .option("--to <instance>", "Target instance")
    .option("--config", "Sync site configuration")
    .option("--theme", "Sync theme configuration")
    .option("--assets", "Sync asset configuration")
    .option("--pages", "Sync pages content")
    .option("--page-prefix <prefix>", "Only sync pages with this path prefix")
    .option("--all", "Sync all configurations and pages")
    .option("--dry-run", "Show what would be synced without making changes")
    .option("--force", "Skip confirmation prompt")
    .action(async (options: SyncOptions) => {
      await syncForCli(options);
    });

  program
    .command("config")
    .description("Manage Wiki.js instances and configuration")
    .option("--list", "List all configured instances")
    .option("--add", "Add a new instance interactively")
    .option("--edit <instanceId>", "Show instance details")
    .option("--remove <instanceId>", "Remove an instance")
    .option("--test <instanceId>", "Test connection to an instance")
    .option("--setup", "Run setup wizard for first-time configuration")
    .option("--status", "Show current configuration status")
    .option("--migrate", "Migrate .env configuration to encrypted storage")
    .option("--dry-run", "Show what would be migrated without making changes")
    .option("--overwrite", "Overwrite existing instances during migration")
    .option("--export", "Export encrypted config to .env format")
    .option("--import <file>", "Import instances from JSON config file")
    .option("--reset", "Reset encrypted configuration")
    .action(async (options: unknown) => {
      await configCommand(options as ConfigOptions);
    });

  program
    .command("analyze")
    .description("Analyze exported navigation and pages for issues")
    .argument("<pages-export>", "Path to pages export JSON file")
    .argument("<nav-export>", "Path to navigation export JSON file")
    .option("--orphaned", "Show only orphaned pages analysis")
    .option("--broken", "Show only broken navigation links analysis")
    .option("--coverage", "Show only navigation coverage analysis")
    .option("--consistency", "Show only title consistency analysis")
    .option("--health", "Show only health score analysis")
    .option("--duplicates", "Show only duplicate paths analysis")
    .option("--visibility", "Show only visibility analysis")
    .action(async (pagesExport: string, navExport: string, options: {
      orphaned?: boolean;
      broken?: boolean;
      coverage?: boolean;
      consistency?: boolean;
      health?: boolean;
      duplicates?: boolean;
      visibility?: boolean;
    }) => {
      await analyzeCommand(pagesExport, navExport, options);
    });

  program
    .command("compare-exports")
    .description("Compare two sets of exported data")
    .argument("<old-pages>", "Path to old pages export JSON file")
    .argument("<new-pages>", "Path to new pages export JSON file")
    .argument("<old-nav>", "Path to old navigation export JSON file")
    .argument("<new-nav>", "Path to new navigation export JSON file")
    .action(async (oldPages: string, newPages: string, oldNav: string, newNav: string) => {
      await compareExportsCommand(oldPages, newPages, oldNav, newNav);
    });
}
