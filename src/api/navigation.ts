import { graphql } from "@/api";
import type { NavigationTree, NavigationConfig, NavigationItem } from "@/types";

export async function getNavigationTree(instance?: string): Promise<NavigationTree[]> {
  const query = `query {
    navigation {
      tree {
        locale
        items {
          id
          kind
          label
          icon
          targetType
          target
          visibilityMode
          visibilityGroups
        }
      }
    }
  }`;

  const result = await graphql<{ navigation: { tree: NavigationTree[] } }>(
    query,
    undefined,
    instance
  );
  return result.navigation.tree;
}

export async function getNavigationConfig(instance?: string): Promise<NavigationConfig> {
  const query = `query {
    navigation {
      config {
        mode
      }
    }
  }`;

  const result = await graphql<{ navigation: { config: NavigationConfig } }>(
    query,
    undefined,
    instance
  );
  return result.navigation.config;
}

export async function updateNavigationTree(
  tree: NavigationTree[],
  instance?: string
) {
  // Remove UI-only fields that aren't accepted by the GraphQL schema
  const sanitizeItem = (item: NavigationItem): Omit<NavigationItem, 'expanded'> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { expanded, ...rest } = item;
    if (rest.children) {
      rest.children = rest.children.map(sanitizeItem);
    }
    return rest;
  };

  const sanitizedTree = tree.map(localeTree => ({
    ...localeTree,
    items: localeTree.items.map(sanitizeItem)
  }));

  const mutation = `mutation ($tree: [NavigationTreeInput]!) {
    navigation {
      updateTree(tree: $tree) {
        responseResult {
          succeeded
          errorCode
          message
        }
      }
    }
  }`;

  const result = await graphql<{
    navigation: {
      updateTree: {
        responseResult: {
          succeeded: boolean;
          errorCode: number;
          message?: string;
        };
      };
    };
  }>(mutation, { tree: sanitizedTree }, instance);

  return result.navigation.updateTree.responseResult;
}

export async function updateNavigationMode(
  mode: NavigationConfig["mode"],
  instance?: string
) {
  const mutation = `mutation ($mode: NavigationMode!) {
    navigation {
      updateConfig(mode: $mode) {
        responseResult {
          succeeded
          errorCode
          message
        }
      }
    }
  }`;

  const result = await graphql<{
    navigation: {
      updateConfig: {
        responseResult: {
          succeeded: boolean;
          errorCode: number;
          message?: string;
        };
      };
    };
  }>(mutation, { mode }, instance);

  return result.navigation.updateConfig.responseResult;
}