import type { Command } from "commander";
import {
  listGroupsCommand,
  showGroupCommand,
  createGroupCommand,
  deleteGroupCommand,
  assignUserCommand,
  unassignUserCommand,
} from "@/commands/groups";

export function register(program: Command) {
  const groupsCommand = program
    .command("groups")
    .description("Manage Wiki.js groups");

  groupsCommand
    .command("list")
    .description("List all groups")
    .option("-f, --filter <text>", "Filter groups by text")
    .action(async (options: { filter?: string }) => {
      await listGroupsCommand(options);
    });

  groupsCommand
    .command("show")
    .description("Show detailed group information")
    .argument("<id>", "Group ID")
    .action(async (id: string) => {
      await showGroupCommand(parseInt(id));
    });

  groupsCommand
    .command("create")
    .description("Create a new group")
    .argument("<name>", "Group name")
    .action(async (name: string) => {
      await createGroupCommand(name);
    });

  groupsCommand
    .command("delete")
    .description("Delete a group")
    .argument("<id>", "Group ID")
    .action(async (id: string) => {
      await deleteGroupCommand(parseInt(id));
    });

  groupsCommand
    .command("assign")
    .description("Assign user to group")
    .argument("<group-id>", "Group ID")
    .argument("<user-id>", "User ID")
    .action(async (groupId: string, userId: string) => {
      await assignUserCommand(parseInt(groupId), parseInt(userId));
    });

  groupsCommand
    .command("unassign")
    .description("Remove user from group")
    .argument("<group-id>", "Group ID")
    .argument("<user-id>", "User ID")
    .action(async (groupId: string, userId: string) => {
      await unassignUserCommand(parseInt(groupId), parseInt(userId));
    });
}
