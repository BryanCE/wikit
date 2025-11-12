import type { Command } from "commander";
import {
  listNavigation,
  setNavigationMode,
  addNavigationItem,
  removeNavigationItem,
  moveNavigationItem,
  exportNavigation,
  importNavigation
} from "@/commands/navigation";
import type { NavigationMode } from "@/types";
import { logger } from "@/utils/logger";

export function register(program: Command) {
  const navCommand = program
    .command("nav")
    .description("Manage Wiki.js navigation");

  navCommand
    .command("list")
    .description("Show navigation tree and configuration")
    .action(async () => {
      await listNavigation();
    });

  navCommand
    .command("add")
    .description("Add navigation item")
    .argument("<label>", "Navigation item label")
    .option("-t, --target <path>", "Target page path")
    .option("--target-type <type>", "Target type (page, external)", "page")
    .option("-i, --icon <icon>", "Icon for the navigation item")
    .option("-l, --locale <locale>", "Locale for navigation item", "en")
    .option("-p, --parent <id>", "Parent item ID for nested items")
    .action(async (label: string, options: {
      target?: string;
      targetType?: string;
      icon?: string;
      locale?: string;
      parent?: string;
    }) => {
      await addNavigationItem({
        label,
        target: options.target,
        targetType: options.targetType,
        icon: options.icon,
        locale: options.locale,
        insertAfterId: options.parent,
      });
    });

  navCommand
    .command("remove")
    .description("Remove navigation item")
    .argument("<id>", "Navigation item ID")
    .option("-l, --locale <locale>", "Locale to remove from", "en")
    .action(async (id: string, options: { locale?: string }) => {
      await removeNavigationItem(id, {
        locale: options.locale
      });
    });

  navCommand
    .command("move")
    .description("Move navigation item to new position")
    .argument("<id>", "Navigation item ID to move")
    .option("-a, --after <id>", "Insert after this item ID (omit to move to top)")
    .option("-l, --locale <locale>", "Locale to move in", "en")
    .action(async (id: string, options: { after?: string; locale?: string }) => {
      await moveNavigationItem(id, {
        insertAfterId: options.after,
        locale: options.locale
      });
    });

  navCommand
    .command("mode")
    .description("Get or set navigation mode")
    .argument("[mode]", "Navigation mode (NONE, TREE, MIXED, STATIC)")
    .action(async (mode?: string) => {
      if (mode) {
        const validModes: NavigationMode[] = ["NONE", "TREE", "MIXED", "STATIC"];
        const upperMode = mode.toUpperCase();
        if (!validModes.includes(upperMode as NavigationMode)) {
          logger.error({ mode, validModes }, "Invalid navigation mode");
          return;
        }
        await setNavigationMode(upperMode as NavigationMode);
      } else {
        await listNavigation();
      }
    });

  navCommand
    .command("export")
    .description("Export navigation to JSON file")
    .argument("<file>", "Output file path")
    .action(async (file: string) => {
      await exportNavigation(file);
    });

  navCommand
    .command("import")
    .description("Import navigation from JSON file")
    .argument("<file>", "Input file path")
    .option("--mode", "Also import navigation mode")
    .action(async (file: string, options: { mode?: boolean }) => {
      await importNavigation(file, {
        mode: options.mode
      });
    });
}
