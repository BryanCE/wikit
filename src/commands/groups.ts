import * as groupApi from "@/api/groups";

export async function listGroupsCommand(
  options: { filter?: string }
) {
  const groups = await groupApi.listGroups(options.filter);

  if (groups.length === 0) {
    console.log("No groups found");
    return;
  }

  console.log(`\nFound ${groups.length} group(s):\n`);
  console.log(
    "ID".padEnd(6) +
    "Name".padEnd(30) +
    "Users".padEnd(8) +
    "System".padEnd(8) +
    "Created"
  );
  console.log("-".repeat(80));

  for (const group of groups) {
    console.log(
      String(group.id).padEnd(6) +
      group.name.padEnd(30) +
      String(group.userCount ?? 0).padEnd(8) +
      (group.isSystem ? "[X]" : "[ ]").padEnd(8) +
      new Date(group.createdAt).toLocaleDateString()
    );
  }
  console.log();
}

export async function showGroupCommand(
  id: number
) {
  const group = await groupApi.getGroup(id);

  console.log("\nGroup Details:\n");
  console.log(`ID:              ${group.id}`);
  console.log(`Name:            ${group.name}`);
  console.log(`System Group:    ${group.isSystem ? "Yes" : "No"}`);
  console.log(`Redirect Login:  ${group.redirectOnLogin ?? "(not set)"}`);
  console.log(`Created:         ${new Date(group.createdAt).toLocaleString()}`);
  console.log(`Updated:         ${new Date(group.updatedAt).toLocaleString()}`);

  if (group.permissions.length > 0) {
    console.log("\nPermissions:");
    for (const permission of group.permissions) {
      console.log(`  - ${permission}`);
    }
  } else {
    console.log("\nPermissions: (none)");
  }

  if (group.pageRules && group.pageRules.length > 0) {
    console.log("\nPage Rules:");
    for (const rule of group.pageRules) {
      console.log(
        `  - ${rule.deny ? "DENY" : "ALLOW"} ${rule.match} "${rule.path}" [${rule.locales.join(", ")}] roles: ${rule.roles.join(", ")}`
      );
    }
  } else {
    console.log("\nPage Rules: (none)");
  }

  if (group.users && group.users.length > 0) {
    console.log("\nMembers:");
    for (const user of group.users) {
      console.log(`  - ${user.name} (${user.email}) [ID: ${user.id}]`);
    }
  } else {
    console.log("\nMembers: (none)");
  }
  console.log();
}

export async function createGroupCommand(
  name: string
) {
  const response = await groupApi.createGroup(name);

  if (response.responseResult.succeeded) {
    console.log(`\nGroup created successfully!`);
    if (response.group) {
      console.log(`ID:   ${response.group.id}`);
      console.log(`Name: ${response.group.name}`);
    }
  } else {
    console.error(
      `\nFailed to create group: ${response.responseResult.message}`
    );
    process.exit(1);
  }
}

export async function deleteGroupCommand(
  id: number
) {
  const response = await groupApi.deleteGroup(id);

  if (response.succeeded) {
    console.log(`\nGroup ${id} deleted successfully!`);
  } else {
    console.error(`\nFailed to delete group: ${response.message}`);
    process.exit(1);
  }
}

export async function assignUserCommand(
  groupId: number,
  userId: number
) {
  const response = await groupApi.assignUser(
    groupId,
    userId
  );

  if (response.succeeded) {
    console.log(`\nUser ${userId} assigned to group ${groupId} successfully!`);
  } else {
    console.error(`\nFailed to assign user: ${response.message}`);
    process.exit(1);
  }
}

export async function unassignUserCommand(
  groupId: number,
  userId: number
) {
  const response = await groupApi.unassignUser(
    groupId,
    userId
  );

  if (response.succeeded) {
    console.log(
      `\nUser ${userId} removed from group ${groupId} successfully!`
    );
  } else {
    console.error(`\nFailed to remove user: ${response.message}`);
    process.exit(1);
  }
}
