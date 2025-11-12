import * as userApi from "@/api/users";
import type { CreateUserInput, UpdateUserInput, UserMinimal } from "@/types";
import { getProviderName } from "@/utils/users";

export async function listUsersCommand(
  options: { filter?: string; orderBy?: string }
): Promise<void> {
  const users = await userApi.listUsers(
    { filter: options.filter, orderBy: options.orderBy }
  );

  if (users.length === 0) {
    console.log("No users found");
    return;
  }

  console.log(`\nFound ${users.length} user(s):\n`);
  console.log(
    "ID".padEnd(6) +
    "Name".padEnd(25) +
    "Email".padEnd(30) +
    "Provider".padEnd(12) +
    "Active".padEnd(8) +
    "System"
  );
  console.log("-".repeat(110));

  for (const user of users) {
    console.log(
      String(user.id).padEnd(6) +
      user.name.padEnd(25) +
      user.email.padEnd(30) +
      user.providerKey.padEnd(12) +
      (user.isActive ? "[X]" : "[ ]").padEnd(8) +
      (user.isSystem ? "[X]" : "[ ]")
    );
  }
  console.log();
}

export async function searchUsersCommand(
  query: string
): Promise<void> {
  const users = await userApi.searchUsers(query);

  if (users.length === 0) {
    console.log(`No users found matching: ${query}`);
    return;
  }

  console.log(`\nFound ${users.length} user(s) matching "${query}":\n`);
  console.log(
    "ID".padEnd(6) +
    "Name".padEnd(25) +
    "Email".padEnd(30) +
    "Provider".padEnd(12) +
    "Active"
  );
  console.log("-".repeat(85));

  for (const user of users) {
    console.log(
      String(user.id).padEnd(6) +
      user.name.padEnd(25) +
      user.email.padEnd(30) +
      user.providerKey.padEnd(12) +
      (user.isActive ? "[X]" : "[ ]")
    );
  }
  console.log();
}

export async function showUserCommand(
  id: number
): Promise<void> {
  const user = await userApi.getUser(id);

  console.log("\nUser Details:\n");
  console.log(`ID:              ${user.id}`);
  console.log(`Name:            ${user.name}`);
  console.log(`Email:           ${user.email}`);
  console.log(`Provider:        ${user.providerKey}${user.providerName ? ` (${user.providerName})` : ""}`);
  console.log(`Active:          ${user.isActive ? "Yes" : "No"}`);
  console.log(`Verified:        ${user.isVerified ? "Yes" : "No"}`);
  console.log(`System User:     ${user.isSystem ? "Yes" : "No"}`);
  console.log(`2FA Active:      ${user.tfaIsActive ? "Yes" : "No"}`);
  console.log(`Location:        ${user.location ?? "(not set)"}`);
  console.log(`Job Title:       ${user.jobTitle ?? "(not set)"}`);
  console.log(`Timezone:        ${user.timezone}`);
  console.log(`Date Format:     ${user.dateFormat}`);
  console.log(`Appearance:      ${user.appearance}`);
  console.log(`Created:         ${new Date(user.createdAt).toLocaleString()}`);
  console.log(`Updated:         ${new Date(user.updatedAt).toLocaleString()}`);
  if (user.lastLoginAt) {
    console.log(`Last Login:      ${new Date(user.lastLoginAt).toLocaleString()}`);
  }

  if (user.groups.length > 0) {
    console.log("\nGroups:");
    for (const group of user.groups) {
      console.log(`  - ${group.name} (ID: ${group.id})${group.isSystem ? " [System]" : ""}`);
    }
  } else {
    console.log("\nGroups: (none)");
  }
  console.log();
}

export async function lastLoginsCommand(): Promise<void> {
  const users = await userApi.getLastLogins();

  if (users.length === 0) {
    console.log("No login history found");
    return;
  }

  console.log(`\nLast ${users.length} login(s):\n`);
  console.log(
    "ID".padEnd(6) +
    "Name".padEnd(30) +
    "Last Login"
  );
  console.log("-".repeat(70));

  for (const user of users) {
    console.log(
      String(user.id).padEnd(6) +
      user.name.padEnd(30) +
      new Date(user.lastLoginAt).toLocaleString()
    );
  }
  console.log();
}

export async function createUserCommand(
  input: CreateUserInput
): Promise<void> {
  const response = await userApi.createUser(input);

  if (response.responseResult.succeeded) {
    console.log(`\nUser created successfully!`);
    if (response.user) {
      console.log(`ID:    ${response.user.id}`);
      console.log(`Name:  ${response.user.name}`);
      console.log(`Email: ${response.user.email}`);
    }
  } else {
    console.error(`\nFailed to create user: ${response.responseResult.message}`);
    process.exit(1);
  }
}

export async function updateUserCommand(
  input: UpdateUserInput
): Promise<void> {
  const response = await userApi.updateUser(input);

  if (response.responseResult.succeeded) {
    console.log(`\nUser ${input.id} updated successfully!`);
  } else {
    console.error(`\nFailed to update user: ${response.responseResult.message}`);
    process.exit(1);
  }
}

export async function deleteUserCommand(
  id: number,
  replaceId: number
): Promise<void> {
  const response = await userApi.deleteUser(id, replaceId);

  if (response.responseResult.succeeded) {
    console.log(`\nUser ${id} deleted successfully! Content reassigned to user ${replaceId}.`);
  } else {
    console.error(`\nFailed to delete user: ${response.responseResult.message}`);
    process.exit(1);
  }
}

export async function activateUserCommand(
  id: number
): Promise<void> {
  const response = await userApi.activateUser(id);

  if (response.responseResult.succeeded) {
    console.log(`\nUser ${id} activated successfully!`);
  } else {
    console.error(`\nFailed to activate user: ${response.responseResult.message}`);
    process.exit(1);
  }
}

export async function deactivateUserCommand(
  id: number
): Promise<void> {
  const response = await userApi.deactivateUser(id);

  if (response.responseResult.succeeded) {
    console.log(`\nUser ${id} deactivated successfully!`);
  } else {
    console.error(`\nFailed to deactivate user: ${response.responseResult.message}`);
    process.exit(1);
  }
}

export async function verifyUserCommand(
  id: number
): Promise<void> {
  // Get user to check their provider
  const user = await userApi.getUser(id);

  // Only allow manual verification for local authentication users
  if (user.providerKey !== "local") {
    const providerDisplay = user.providerName ?? getProviderName(user.providerKey);
    console.error(`\nUser is already verified by external provider (${providerDisplay}).\nManual verification is not needed.`);
    process.exit(1);
  }

  const response = await userApi.verifyUser(id);

  if (response.responseResult.succeeded) {
    console.log(`\nUser ${id} verified successfully!`);
  } else {
    console.error(`\nFailed to verify user: ${response.responseResult.message}`);
    process.exit(1);
  }
}

export async function enable2FACommand(
  id: number
): Promise<void> {
  // Get user to check their provider
  const user = await userApi.getUser(id);

  // Only allow 2FA management for local authentication users
  if (user.providerKey !== "local") {
    const providerDisplay = user.providerName ?? getProviderName(user.providerKey);
    console.error(`\nCannot manage 2FA for user authenticated via external provider (${providerDisplay}).\n2FA is managed through their authentication provider.`);
    process.exit(1);
  }

  const response = await userApi.enable2FA(id);

  if (response.responseResult.succeeded) {
    console.log(`\n2FA enabled for user ${id}!`);
  } else {
    console.error(`\nFailed to enable 2FA: ${response.responseResult.message}`);
    process.exit(1);
  }
}

export async function disable2FACommand(
  id: number
): Promise<void> {
  // Get user to check their provider
  const user = await userApi.getUser(id);

  // Only allow 2FA management for local authentication users
  if (user.providerKey !== "local") {
    const providerDisplay = user.providerName ?? getProviderName(user.providerKey);
    console.error(`\nCannot manage 2FA for user authenticated via external provider (${providerDisplay}).\n2FA is managed through their authentication provider.`);
    process.exit(1);
  }

  const response = await userApi.disable2FA(id);

  if (response.responseResult.succeeded) {
    console.log(`\n2FA disabled for user ${id}!`);
  } else {
    console.error(`\nFailed to disable 2FA: ${response.responseResult.message}`);
    process.exit(1);
  }
}

export async function resetPasswordCommand(
  id: number
): Promise<void> {
  // Get user to check their provider
  const user = await userApi.getUser(id);

  // Only allow password reset for local authentication users
  if (user.providerKey !== "local") {
    const providerDisplay = user.providerName ?? getProviderName(user.providerKey);
    console.error(`\nCannot reset password for user authenticated via external provider (${providerDisplay}).\nUser must reset password through their authentication provider.`);
    process.exit(1);
  }

  const response = await userApi.resetPassword(id);

  if (response.responseResult.succeeded) {
    console.log(`\nPassword reset email sent to user ${id}!`);
  } else {
    console.error(`\nFailed to reset password: ${response.responseResult.message}`);
    process.exit(1);
  }
}

export async function exportUsersCommand(
  outputPath: string
): Promise<{ success: boolean; userCount: number; message: string }> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    console.log("Fetching user list...");
    const users = await userApi.listUsers({});

    const dir = path.dirname(outputPath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch {
      throw new Error(`Failed to create directory: ${dir}`);
    }

    await fs.writeFile(outputPath, JSON.stringify(users, null, 2), "utf-8");

    const message = `Exported ${users.length} users to ${outputPath}`;
    console.log(`\n${message}`);

    return { success: true, userCount: users.length, message };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`\nFailed to export users: ${errorMsg}`);
    return { success: false, userCount: 0, message: errorMsg };
  }
}

export async function importUsersCommand(
  inputPath: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  try {
    const fs = await import("fs/promises");

    console.log(`Reading users from ${inputPath}...`);
    const fileContent = await fs.readFile(inputPath, "utf-8");
    const parsedData: unknown = JSON.parse(fileContent);

    if (!Array.isArray(parsedData)) {
      throw new Error("JSON file must contain an array of users");
    }

    const users = parsedData as Partial<UserMinimal>[];

    console.log("Fetching existing users...");
    const existingUsers = await userApi.listUsers({});
    const existingUsersMap = new Map(existingUsers.map(u => [u.email, u]));

    console.log(`Importing ${users.length} users...`);

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const userData of users) {
      try {
        // Validate required fields
        if (!userData.email || !userData.name) {
          failedCount++;
          const identifier = userData.email ?? userData.name ?? "unknown";
          const missingFields: string[] = [];
          if (!userData.email) missingFields.push("email");
          if (!userData.name) missingFields.push("name");
          const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
          errors.push(`${identifier}: ${errorMsg}`);
          console.error(`Skipping user ${identifier}: ${errorMsg}`);
          continue;
        }

        const existingUser = existingUsersMap.get(userData.email);

        if (existingUser) {
          // Can only update name via update mutation (email is identifier)
          const updateInput: UpdateUserInput = {
            id: existingUser.id,
            name: userData.name
          };

          const response = await userApi.updateUser(updateInput);
          if (response.responseResult.succeeded) {
            // Handle isActive state change
            if (userData.isActive !== undefined && userData.isActive !== existingUser.isActive) {
              if (userData.isActive) {
                await userApi.activateUser(existingUser.id);
              } else {
                await userApi.deactivateUser(existingUser.id);
              }
            }

            successCount++;
            console.log(`Updated user: ${userData.email}`);
          } else {
            failedCount++;
            errors.push(`${userData.email}: ${response.responseResult.message}`);
            console.error(`Failed to update ${userData.email}: ${response.responseResult.message}`);
          }
        } else {
          const createInput: CreateUserInput = {
            email: userData.email,
            name: userData.name,
            providerKey: userData.providerKey ?? "local",
            groups: [],
            passwordRaw: undefined,
            mustChangePassword: false,
            sendWelcomeEmail: false
          };

          const createResponse = await userApi.createUser(createInput);
          if (createResponse.responseResult.succeeded && createResponse.user) {
            const newUserId = createResponse.user.id;

            // Handle isActive state
            if (userData.isActive !== undefined && !userData.isActive) {
              await userApi.deactivateUser(newUserId);
            }

            successCount++;
            console.log(`Created user: ${userData.email}`);
          } else {
            failedCount++;
            errors.push(`${userData.email}: ${createResponse.responseResult.message}`);
            console.error(`Failed to create ${userData.email}: ${createResponse.responseResult.message}`);
          }
        }
      } catch (err) {
        failedCount++;
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`${userData.email}: ${errorMsg}`);
        console.error(`Error processing ${userData.email}: ${errorMsg}`);
      }
    }

    console.log(`\nImport complete: ${successCount} success, ${failedCount} failed`);
    return { success: successCount, failed: failedCount, errors };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`\nFailed to import users: ${errorMsg}`);
    return { success: 0, failed: 0, errors: [errorMsg] };
  }
}