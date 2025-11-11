import type { Command } from "commander";
import {
  listGroupsCommand,
  showGroupCommand,
  createGroupCommand,
  deleteGroupCommand,
  assignUserCommand,
  unassignUserCommand,
} from "@/commands/groups";
import type { GlobalOptions } from "@/types";

export function register(program: Command) {
  const groupsCommand = program
    .command("groups")
    .description("Manage Wiki.js groups");

  groupsCommand
    .command("list")
    .description("List all groups")
    .option("-f, --filter <text>", "Filter groups by text")
    .action(async (options: { filter?: string }) => {
      const globalOptions = program.opts<GlobalOptions>();
      await listGroupsCommand({ ...options, instance: globalOptions.instance });
    });

  groupsCommand
    .command("show")
    .description("Show detailed group information")
    .argument("<id>", "Group ID")
    .action(async (id: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await showGroupCommand(parseInt(id), { instance: globalOptions.instance });
    });

  groupsCommand
    .command("create")
    .description("Create a new group")
    .argument("<name>", "Group name")
    .action(async (name: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await createGroupCommand(name, { instance: globalOptions.instance });
    });

  groupsCommand
    .command("delete")
    .description("Delete a group")
    .argument("<id>", "Group ID")
    .action(async (id: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await deleteGroupCommand(parseInt(id), { instance: globalOptions.instance });
    });

  groupsCommand
    .command("assign")
    .description("Assign user to group")
    .argument("<group-id>", "Group ID")
    .argument("<user-id>", "User ID")
    .action(async (groupId: string, userId: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await assignUserCommand(
        parseInt(groupId),
        parseInt(userId),
        { instance: globalOptions.instance }
      );
    });

  groupsCommand
    .command("unassign")
    .description("Remove user from group")
    .argument("<group-id>", "Group ID")
    .argument("<user-id>", "User ID")
    .action(async (groupId: string, userId: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await unassignUserCommand(
        parseInt(groupId),
        parseInt(userId),
        { instance: globalOptions.instance }
      );
    });
}
