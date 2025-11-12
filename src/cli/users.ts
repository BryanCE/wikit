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
      await listUsersCommand(options);
    });

  usersCommand
    .command("search")
    .description("Search users")
    .argument("<query>", "Search query")
    .action(async (query: string) => {
      await searchUsersCommand(query);
    });

  usersCommand
    .command("show")
    .description("Show detailed user information")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      await showUserCommand(parseInt(id));
    });

  usersCommand
    .command("last-logins")
    .description("Show users with recent login times")
    .action(async () => {
      await lastLoginsCommand();
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
      const groups = options.groups.split(",").map((g) => parseInt(g.trim()));
      await createUserCommand({
        email: options.email,
        name: options.name,
        passwordRaw: options.password,
        providerKey: options.provider,
        groups,
        mustChangePassword: options.mustChangePassword,
        sendWelcomeEmail: options.sendWelcomeEmail,
      });
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
      await updateUserCommand(updateData);
    });

  usersCommand
    .command("delete")
    .description("Delete a user")
    .argument("<id>", "User ID to delete")
    .requiredOption("-r, --replace-with <id>", "User ID to reassign content to")
    .action(async (id: string, options: { replaceWith: string }) => {
      await deleteUserCommand(
        parseInt(id),
        parseInt(options.replaceWith)
      );
    });

  usersCommand
    .command("activate")
    .description("Activate a user account")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      await activateUserCommand(parseInt(id));
    });

  usersCommand
    .command("deactivate")
    .description("Deactivate a user account")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      await deactivateUserCommand(parseInt(id));
    });

  usersCommand
    .command("verify")
    .description("Verify a user email")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      await verifyUserCommand(parseInt(id));
    });

  usersCommand
    .command("enable-2fa")
    .description("Enable two-factor authentication")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      await enable2FACommand(parseInt(id));
    });

  usersCommand
    .command("disable-2fa")
    .description("Disable two-factor authentication")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      await disable2FACommand(parseInt(id));
    });

  usersCommand
    .command("reset-password")
    .description("Send password reset email")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      await resetPasswordCommand(parseInt(id));
    });
}
