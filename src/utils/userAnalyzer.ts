import type { Group } from "@/types";

export interface OrphanedUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Finds users that are not assigned to any group
 * Requires full group data with user lists
 */
export function findOrphanedUsers(
  allUsers: { id: number; name: string; email: string; isActive: boolean; isSystem: boolean; createdAt: string }[],
  groupsWithUsers: Group[]
): OrphanedUser[] {
  // Build a set of user IDs that are in at least one group
  const usersInGroups = new Set<number>();

  for (const group of groupsWithUsers) {
    if (group.users) {
      for (const user of group.users) {
        usersInGroups.add(user.id);
      }
    }
  }

  // Find users not in any group
  const orphanedUsers: OrphanedUser[] = [];

  for (const user of allUsers) {
    // Skip system users
    if (user.isSystem) {
      continue;
    }

    // If user is not in any group, they are orphaned
    if (!usersInGroups.has(user.id)) {
      orphanedUsers.push({
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    }
  }

  return orphanedUsers;
}

/**
 * Counts total users without group assignments
 */
export function countOrphanedUsers(users: OrphanedUser[]): number {
  return users.length;
}

/**
 * Filters orphaned users by active status
 */
export function filterOrphanedUsersByStatus(
  users: OrphanedUser[],
  isActive: boolean
): OrphanedUser[] {
  return users.filter((user) => user.isActive === isActive);
}
