import type { Command } from "commander";
import {
  listUsersCommand,
  searchUsersCommand,
  showUserCommand,
  lastLoginsCommand,
  createUserCommand,
  updateUserCommand,
  deleteUserCommand,
  activateUserCommand,
  deactivateUserCommand,
  verifyUserCommand,
  enable2FACommand,
  disable2FACommand,
  resetPasswordCommand,
} from "@/commands/users";
import type { GlobalOptions } from "@/types";

export function register(program: Command) {
  const usersCommand = program
    .command("users")
    .description("Manage Wiki.js users");

  usersCommand
    .command("list")
    .description("List all users")
    .option("-f, --filter <text>", "Filter users by text")
    .option("-o, --order-by <field>", "Order by field")
    .action(async (options: { filter?: string; orderBy?: string }) => {
      const globalOptions = program.opts<GlobalOptions>();
      await listUsersCommand({ ...options, instance: globalOptions.instance });
    });

  usersCommand
    .command("search")
    .description("Search users")
    .argument("<query>", "Search query")
    .action(async (query: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await searchUsersCommand(query, { instance: globalOptions.instance });
    });

  usersCommand
    .command("show")
    .description("Show detailed user information")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await showUserCommand(parseInt(id), { instance: globalOptions.instance });
    });

  usersCommand
    .command("last-logins")
    .description("Show users with recent login times")
    .action(async () => {
      const globalOptions = program.opts<GlobalOptions>();
      await lastLoginsCommand({ instance: globalOptions.instance });
    });

  usersCommand
    .command("create")
    .description("Create a new user")
    .requiredOption("-e, --email <email>", "User email")
    .requiredOption("-n, --name <name>", "User name")
    .option("-p, --password <password>", "User password")
    .option("--provider <key>", "Auth provider key", "local")
    .option("-g, --groups <ids>", "Comma-separated group IDs", "2")
    .option("--must-change-password", "User must change password on first login")
    .option("--send-welcome-email", "Send welcome email to user")
    .action(async (options: {
      email: string;
      name: string;
      password?: string;
      provider: string;
      groups: string;
      mustChangePassword?: boolean;
      sendWelcomeEmail?: boolean;
    }) => {
      const globalOptions = program.opts<GlobalOptions>();
      const groups = options.groups.split(",").map((g) => parseInt(g.trim()));
      await createUserCommand(
        {
          email: options.email,
          name: options.name,
          passwordRaw: options.password,
          providerKey: options.provider,
          groups,
          mustChangePassword: options.mustChangePassword,
          sendWelcomeEmail: options.sendWelcomeEmail,
        },
        { instance: globalOptions.instance }
      );
    });

  usersCommand
    .command("update")
    .description("Update user information")
    .argument("<id>", "User ID")
    .option("-e, --email <email>", "New email")
    .option("-n, --name <name>", "New name")
    .option("-p, --password <password>", "New password")
    .option("-g, --groups <ids>", "Comma-separated group IDs")
    .option("-l, --location <location>", "Location")
    .option("-j, --job-title <title>", "Job title")
    .option("-t, --timezone <tz>", "Timezone")
    .option("--date-format <format>", "Date format")
    .option("-a, --appearance <theme>", "Appearance theme")
    .action(async (id: string, options: {
      email?: string;
      name?: string;
      password?: string;
      groups?: string;
      location?: string;
      jobTitle?: string;
      timezone?: string;
      dateFormat?: string;
      appearance?: string;
    }) => {
      const globalOptions = program.opts<GlobalOptions>();
      const updateData = {
        id: parseInt(id),
        email: options.email,
        name: options.name,
        newPassword: options.password,
        groups: options.groups?.split(",").map((g) => parseInt(g.trim())),
        location: options.location,
        jobTitle: options.jobTitle,
        timezone: options.timezone,
        dateFormat: options.dateFormat,
        appearance: options.appearance,
      };
      await updateUserCommand(updateData, { instance: globalOptions.instance });
    });

  usersCommand
    .command("delete")
    .description("Delete a user")
    .argument("<id>", "User ID to delete")
    .requiredOption("-r, --replace-with <id>", "User ID to reassign content to")
    .action(async (id: string, options: { replaceWith: string }) => {
      const globalOptions = program.opts<GlobalOptions>();
      await deleteUserCommand(
        parseInt(id),
        parseInt(options.replaceWith),
        { instance: globalOptions.instance }
      );
    });

  usersCommand
    .command("activate")
    .description("Activate a user account")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await activateUserCommand(parseInt(id), { instance: globalOptions.instance });
    });

  usersCommand
    .command("deactivate")
    .description("Deactivate a user account")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await deactivateUserCommand(parseInt(id), { instance: globalOptions.instance });
    });

  usersCommand
    .command("verify")
    .description("Verify a user email")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await verifyUserCommand(parseInt(id), { instance: globalOptions.instance });
    });

  usersCommand
    .command("enable-2fa")
    .description("Enable two-factor authentication")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await enable2FACommand(parseInt(id), { instance: globalOptions.instance });
    });

  usersCommand
    .command("disable-2fa")
    .description("Disable two-factor authentication")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await disable2FACommand(parseInt(id), { instance: globalOptions.instance });
    });

  usersCommand
    .command("reset-password")
    .description("Send password reset email")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      const globalOptions = program.opts<GlobalOptions>();
      await resetPasswordCommand(parseInt(id), { instance: globalOptions.instance });
    });
}
