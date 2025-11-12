#!/usr/bin/env node
import { Command } from "commander";
import { logger } from "@/utils/logger";
import { startTui } from "@/tui/AppContent";
import { InstanceContext } from "@/contexts/InstanceContext";
import type { GlobalOptions } from "@/types";

import { register as registerNavigation } from "@/cli/navigation";
import { register as registerUsers } from "@/cli/users";
import { register as registerPages } from "@/cli/pages";
import { register as registerGroups } from "@/cli/groups";
import { register as registerMisc } from "@/cli/misc";

const program = new Command();

program
  .name("wikit")
  .description("CLI and TUI toolkit for Wiki.js")
  .version("0.1.0")
  .option("-i, --instance <name>", "Wiki instance to use");

// Set InstanceContext before any command action runs
// This eliminates the need to pass instance to every command function
program.hook("preAction", () => {
  const globalOptions = program.opts<GlobalOptions>();
  InstanceContext.setInstance(globalOptions.instance ?? null);
});

registerMisc(program);
registerNavigation(program);
registerUsers(program);
registerPages(program);
registerGroups(program);

program
  .command("tui")
  .description("Launch interactive TUI mode")
  .action(() => {
    const globalOptions = program.opts<GlobalOptions>();
    startTui(globalOptions.instance);
  });

try {
  await program.parseAsync(process.argv);
} catch (error) {
  logger.error({ err: error }, "CLI command error");
  process.exit(1);
}
