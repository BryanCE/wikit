import { graphql } from "@/api";
import { logger } from "@/utils/logger";
import type { Group, GroupMinimal, PageRule } from "@/types";

export async function listGroups(
  instance: string,
  filter?: string
): Promise<GroupMinimal[]> {
  logger.info({ instance, filter }, "listGroups called");

  const query = `
    query($filter: String) {
      groups {
        list(filter: $filter) {
          id
          name
          isSystem
          userCount
          createdAt
          updatedAt
        }
      }
    }
  `;

  try {
    logger.info({ instance, filter }, "Calling GraphQL for groups.list");
    const result = await graphql<{ groups: { list: GroupMinimal[] } }>(
      query,
      { filter },
      instance
    );
    logger.info({ instance, groupCount: result.groups.list.length }, "listGroups succeeded");
    return result.groups.list;
  } catch (error) {
    logger.error({ err: error, instance, filter }, "listGroups failed");
    throw error;
  }
}

export async function getGroup(id: number, instance?: string): Promise<Group> {
  const query = `
    query($id: Int!) {
      groups {
        single(id: $id) {
          id
          name
          isSystem
          redirectOnLogin
          permissions
          pageRules {
            id
            deny
            match
            roles
            path
            locales
          }
          users {
            id
            name
            email
          }
          createdAt
          updatedAt
        }
      }
    }
  `;

  const result = await graphql<{ groups: { single: Group } }>(
    query,
    { id },
    instance
  );

  return result.groups.single;
}

export async function createGroup(name: string, instance?: string) {
  const mutation = `
    mutation($name: String!) {
      groups {
        create(name: $name) {
          responseResult {
            succeeded
            errorCode
            message
          }
          group {
            id
            name
          }
        }
      }
    }
  `;

  const result = await graphql<{
    groups: {
      create: {
        responseResult: {
          succeeded: boolean;
          errorCode: number;
          message?: string;
        };
        group?: { id: number; name: string };
      };
    };
  }>(mutation, { name }, instance);

  return result.groups.create;
}

export async function updateGroup(
  id: number,
  data: {
    name: string;
    redirectOnLogin: string;
    permissions: string[];
    pageRules: PageRule[];
  },
  instance?: string
) {
  const mutation = `
    mutation($id: Int!, $name: String!, $redirectOnLogin: String!, $permissions: [String]!, $pageRules: [PageRuleInput]!) {
      groups {
        update(
          id: $id
          name: $name
          redirectOnLogin: $redirectOnLogin
          permissions: $permissions
          pageRules: $pageRules
        ) {
          responseResult {
            succeeded
            errorCode
            message
          }
        }
      }
    }
  `;

  const result = await graphql<{
    groups: {
      update: {
        responseResult: {
          succeeded: boolean;
          errorCode: number;
          message?: string;
        };
      };
    };
  }>(mutation, { id, ...data }, instance);

  return result.groups.update.responseResult;
}

export async function deleteGroup(id: number, instance?: string) {
  const mutation = `
    mutation($id: Int!) {
      groups {
        delete(id: $id) {
          responseResult {
            succeeded
            errorCode
            message
          }
        }
      }
    }
  `;

  const result = await graphql<{
    groups: {
      delete: {
        responseResult: {
          succeeded: boolean;
          errorCode: number;
          message?: string;
        };
      };
    };
  }>(mutation, { id }, instance);

  return result.groups.delete.responseResult;
}

export async function assignUser(
  groupId: number,
  userId: number,
  instance?: string
) {
  const mutation = `
    mutation($groupId: Int!, $userId: Int!) {
      groups {
        assignUser(groupId: $groupId, userId: $userId) {
          responseResult {
            succeeded
            errorCode
            message
          }
        }
      }
    }
  `;

  const result = await graphql<{
    groups: {
      assignUser: {
        responseResult: {
          succeeded: boolean;
          errorCode: number;
          message?: string;
        };
      };
    };
  }>(mutation, { groupId, userId }, instance);

  return result.groups.assignUser.responseResult;
}

export async function unassignUser(
  groupId: number,
  userId: number,
  instance?: string
) {
  const mutation = `
    mutation($groupId: Int!, $userId: Int!) {
      groups {
        unassignUser(groupId: $groupId, userId: $userId) {
          responseResult {
            succeeded
            errorCode
            message
          }
        }
      }
    }
  `;

  const result = await graphql<{
    groups: {
      unassignUser: {
        responseResult: {
          succeeded: boolean;
          errorCode: number;
          message?: string;
        };
      };
    };
  }>(mutation, { groupId, userId }, instance);

  return result.groups.unassignUser.responseResult;
}

/**
 * Get all groups with their full user lists
 * Used to determine which users are orphaned (not in any group)
 *
 * Note: groups.list returns GroupMinimal which doesn't have users field,
 * so we fetch the minimal list first, then fetch full details for each group
 */
export async function getAllGroupsWithUsers(
  instance: string
): Promise<Group[]> {
  // First get the list of all groups (returns GroupMinimal)
  const groupsList = await listGroups(instance);

  // Then fetch full details for each group (includes users)
  const fullGroups = await Promise.all(
    groupsList.map((group) => getGroup(group.id, instance))
  );

  return fullGroups;
}
