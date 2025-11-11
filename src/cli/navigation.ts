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
import type { NavigationMode, GlobalOptions } from "@/types";
import { logger } from "@/utils/logger";

export function register(program: Command) {
  const navCommand = program
    .command("nav")
    .description("Manage Wiki.js navigation");

  navCommand
    .command("list")
    .description("Show navigation tree and configuration")
    .action(async () => {
      const globalOptions = program.opts<GlobalOptions>();
      await listNavigation({ instance: globalOptions.instance });
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
      const globalOptions = program.opts<GlobalOptions>();
      await addNavigationItem({
        label,
        target: options.target,
        targetType: options.targetType,
        icon: options.icon,
        locale: options.locale,
        insertAfterId: options.parent,
      }, { instance: globalOptions.instance });
    });

  navCommand
    .command("remove")
    .description("Remove navigation item")
    .argument("<id>", "Navigation item ID")
    .option("-l, --locale <locale>", "Locale to remove from", "en")
    .action(async (id: string, options: { locale?: string }) => {
      const globalOptions = program.opts<GlobalOptions>();
      await removeNavigationItem(id, {
        instance: globalOptions.instance,
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
      const globalOptions = program.opts<GlobalOptions>();
      await moveNavigationItem(id, {
        instance: globalOptions.instance,
        insertAfterId: options.after,
        locale: options.locale
      });
    });

  navCommand
    .command("mode")
    .description("Get or set navigation mode")
    .argument("[mode]", "Navigation mode (NONE, TREE, MIXED, STATIC)")
    .action(async (mode?: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      if (mode) {
        const validModes: NavigationMode[] = ["NONE", "TREE", "MIXED", "STATIC"];
        const upperMode = mode.toUpperCase();
        if (!validModes.includes(upperMode as NavigationMode)) {
          logger.error({ mode, validModes }, "Invalid navigation mode");
          return;
        }
        await setNavigationMode(upperMode as NavigationMode, { instance: globalOptions.instance });
      } else {
        await listNavigation({ instance: globalOptions.instance });
      }
    });

  navCommand
    .command("export")
    .description("Export navigation to JSON file")
    .argument("<file>", "Output file path")
    .action(async (file: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await exportNavigation(file, { instance: globalOptions.instance });
    });

  navCommand
    .command("import")
    .description("Import navigation from JSON file")
    .argument("<file>", "Input file path")
    .option("--mode", "Also import navigation mode")
    .action(async (file: string, options: { mode?: boolean }) => {
      const globalOptions = program.opts<GlobalOptions>();
      await importNavigation(file, {
        instance: globalOptions.instance,
        mode: options.mode
      });
    });
}
