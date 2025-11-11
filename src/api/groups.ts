import { graphql } from "@/api";
import { logger } from "@/utils/logger";
import type { Group, GroupMinimal, PageRule } from "@/types";

export async function listGroups(
  filter?: string
): Promise<GroupMinimal[]> {
  logger.info({ filter }, "listGroups called");

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
    logger.info({ filter }, "Calling GraphQL for groups.list");
    const result = await graphql<{ groups: { list: GroupMinimal[] } }>(
      query,
      { filter }
    );
    logger.info({ groupCount: result.groups.list.length }, "listGroups succeeded");
    return result.groups.list;
  } catch (error) {
    logger.error({ err: error, filter }, "listGroups failed");
    throw error;
  }
}

export async function getGroup(id: number): Promise<Group> {
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
    { id }
  );

  return result.groups.single;
}

export async function createGroup(name: string) {
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
  }>(mutation, { name });

  return result.groups.create;
}

export async function updateGroup(
  id: number,
  data: {
    name: string;
    redirectOnLogin: string;
    permissions: string[];
    pageRules: PageRule[];
  }
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
  }>(mutation, { id, ...data });

  return result.groups.update.responseResult;
}

export async function deleteGroup(id: number) {
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
  }>(mutation, { id });

  return result.groups.delete.responseResult;
}

export async function assignUser(
  groupId: number,
  userId: number
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
  }>(mutation, { groupId, userId });

  return result.groups.assignUser.responseResult;
}

export async function unassignUser(
  groupId: number,
  userId: number
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
  }>(mutation, { groupId, userId });

  return result.groups.unassignUser.responseResult;
}

/**
 * Get all groups with their full user lists
 * Used to determine which users are orphaned (not in any group)
 *
 * Note: groups.list returns GroupMinimal which doesn't have users field,
 * so we fetch the minimal list first, then fetch full details for each group
 */
export async function getAllGroupsWithUsers(): Promise<Group[]> {
  // First get the list of all groups (returns GroupMinimal)
  const groupsList = await listGroups();

  // Then fetch full details for each group (includes users)
  const fullGroups = await Promise.all(
    groupsList.map((group) => getGroup(group.id))
  );

  return fullGroups;
}
