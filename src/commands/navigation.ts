import {
  getNavigationTree,
  getNavigationConfig,
  updateNavigationTree,
  updateNavigationMode,
} from "@/api/navigation";
import type { NavigationItem, NavigationConfig, NavigationTree } from "@/types";
import { logger } from "@/utils/logger";

interface NavigationExportData {
  config: NavigationConfig;
  tree: NavigationTree[];
  exportedAt: string;
}

export async function listNavigation() {
  console.log("🔍 Fetching navigation tree...");

  try {
    const [tree, config] = await Promise.all([
      getNavigationTree(),
      getNavigationConfig(),
    ]);

    console.log(`📋 Navigation Mode: ${config.mode}`);
    console.log();

    if (!tree.length) {
      console.log("⚠️ No navigation items found");
      return;
    }

    tree.forEach((localeTree) => {
      console.log(`🌍 Locale: ${localeTree.locale}`);
      if (localeTree.items.length === 0) {
        console.log("  (no items)");
      } else {
        printNavigationItems(localeTree.items, "  ");
      }
      console.log();
    });
  } catch (error) {
    console.error(
      "❌ Failed to fetch navigation:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

function printNavigationItems(items: NavigationItem[], indent: string) {
  items.forEach((item) => {
    const icon = item.icon ? `${item.icon} ` : "";
    const label = item.label ?? item.id;
    const target = item.target ? ` → ${item.target}` : "";
    const visibility =
      item.visibilityMode && item.visibilityMode !== "all"
        ? ` [${item.visibilityMode}]`
        : "";

    console.log(`${indent}${icon}${label}${target}${visibility}`);

    if (item.children?.length) {
      printNavigationItems(item.children, indent + "  ");
    }
  });
}

export async function setNavigationMode(
  mode: NavigationConfig["mode"]
) {
  console.log(`🔧 Setting navigation mode to: ${mode}`);

  try {
    const result = await updateNavigationMode(mode);

    if (result.succeeded) {
      console.log("✅ Navigation mode updated successfully");
    } else {
      console.error(
        `❌ Failed to update navigation mode: ${
          result.message ?? `Error code: ${result.errorCode}`
        }`
      );
    }
  } catch (error) {
    console.error(
      "❌ Failed to update navigation mode:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function addNavigationItem(
  itemData: {
    kind?: "link" | "header" | "divider";
    label?: string;
    target?: string;
    targetType?: string;
    icon?: string;
    locale?: string;
    insertAfterId?: string;
  }
) {
  logger.info({ itemData }, "Adding navigation item");

  try {
    const tree = await getNavigationTree();
    const locale = itemData.locale ?? "en";

    let localeTree = tree.find((t) => t.locale === locale);
    if (!localeTree) {
      localeTree = { locale, items: [] };
      tree.push(localeTree);
    }

    const kind = itemData.kind ?? "link";

    const newItem: NavigationItem = {
      id: `item-${Date.now()}`,
      kind,
      label: kind === "divider" ? undefined : itemData.label,
      target: kind === "link" ? itemData.target : undefined,
      targetType: kind === "link" ? itemData.targetType ?? "page" : undefined,
      icon: kind !== "divider" ? itemData.icon : undefined,
      visibilityMode: "all",
    };

    if (itemData.insertAfterId) {
      // Find the item to insert after
      const insertAfterIndex = localeTree.items.findIndex(
        (item) => item.id === itemData.insertAfterId
      );
      if (insertAfterIndex !== -1) {
        // Insert after the found item
        localeTree.items.splice(insertAfterIndex + 1, 0, newItem);
      } else {
        const error = `Item with ID '${itemData.insertAfterId}' not found`;
        logger.error({ insertAfterId: itemData.insertAfterId }, error);
        throw new Error(error);
      }
    } else {
      // No insertAfterId specified, add to beginning
      localeTree.items.unshift(newItem);
    }

    logger.info({ tree, locale }, "Updating navigation tree");
    const result = await updateNavigationTree(tree);

    if (result.succeeded) {
      logger.info({ result }, "Navigation item added successfully");
      console.log("✅ Navigation item added successfully");
    } else {
      const error = result.message ?? `Error code: ${result.errorCode}`;
      logger.error({ result }, `Failed to add navigation item: ${error}`);
      throw new Error(`Failed to add navigation item: ${error}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      { error, itemData },
      `Failed to add navigation item: ${errorMessage}`
    );
    throw error;
  }
}

export async function removeNavigationItem(
  itemId: string,
  options: { locale?: string } = {}
) {
  console.log(`🗑️ Removing navigation item: ${itemId}`);

  try {
    const tree = await getNavigationTree();
    const locale = options.locale ?? "en";

    const localeTree = tree.find((t) => t.locale === locale);
    if (!localeTree) {
      console.error(`❌ No navigation found for locale: ${locale}`);
      return;
    }

    const removed = removeNavigationItemRecursive(localeTree.items, itemId);

    if (!removed) {
      console.error(`❌ Navigation item with ID '${itemId}' not found`);
      return;
    }

    const result = await updateNavigationTree(tree);

    if (result.succeeded) {
      console.log("✅ Navigation item removed successfully");
    } else {
      console.error(
        `❌ Failed to remove navigation item: ${
          result.message ?? `Error code: ${result.errorCode}`
        }`
      );
    }
  } catch (error) {
    console.error(
      "❌ Failed to remove navigation item:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function exportNavigation(
  filePath: string
) {
  console.log(`📄 Exporting navigation to: ${filePath}`);

  try {
    const [tree, config] = await Promise.all([
      getNavigationTree(),
      getNavigationConfig(),
    ]);

    const exportData = {
      config,
      tree,
      exportedAt: new Date().toISOString(),
    };

    await import("fs/promises").then((fs) =>
      fs.writeFile(filePath, JSON.stringify(exportData, null, 2))
    );

    console.log("✅ Navigation exported successfully");
  } catch (error) {
    console.error(
      "❌ Failed to export navigation:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function importNavigation(
  filePath: string,
  options: { mode?: boolean } = {}
) {
  console.log(`📄 Importing navigation from: ${filePath}`);

  try {
    const fs = await import("fs/promises");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const importData = JSON.parse(fileContent) as NavigationExportData;

    if (options.mode && importData.config) {
      const modeResult = await updateNavigationMode(
        importData.config.mode
      );
      if (!modeResult.succeeded) {
        console.error(
          `❌ Failed to update navigation mode: ${modeResult.message}`
        );
        return;
      }
    }

    if (importData.tree) {
      const treeResult = await updateNavigationTree(
        importData.tree
      );
      if (!treeResult.succeeded) {
        console.error(
          `❌ Failed to update navigation tree: ${treeResult.message}`
        );
        return;
      }
    }

    console.log("✅ Navigation imported successfully");
  } catch (error) {
    console.error(
      "❌ Failed to import navigation:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

function removeNavigationItemRecursive(
  items: NavigationItem[],
  id: string
): boolean {
  for (const item of items) {
    if (item.id === id) {
      const index = items.indexOf(item);
      items.splice(index, 1);
      return true;
    }
    if (item.children) {
      const removed = removeNavigationItemRecursive(item.children, id);
      if (removed) return true;
    }
  }
  return false;
}

function findNavigationItemRecursive(
  items: NavigationItem[],
  id: string
): NavigationItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findNavigationItemRecursive(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

export async function moveNavigationItem(
  itemId: string,
  options: { locale?: string; insertAfterId?: string } = {}
) {
  logger.info({ itemId, options }, "Moving navigation item");

  try {
    const tree = await getNavigationTree();
    const locale = options.locale ?? "en";

    const localeTree = tree.find((t) => t.locale === locale);
    if (!localeTree) {
      const error = `No navigation found for locale: ${locale}`;
      logger.error({ locale }, error);
      throw new Error(error);
    }

    // Find the item to move
    const itemToMove = findNavigationItemRecursive(localeTree.items, itemId);
    if (!itemToMove) {
      const error = `Navigation item with ID '${itemId}' not found`;
      logger.error({ itemId }, error);
      throw new Error(error);
    }

    // Remove item from current position
    const removed = removeNavigationItemRecursive(localeTree.items, itemId);
    if (!removed) {
      const error = `Failed to remove item from current position`;
      logger.error({ itemId }, error);
      throw new Error(error);
    }

    // Insert at new position
    if (options.insertAfterId) {
      const insertAfterIndex = localeTree.items.findIndex(
        (item) => item.id === options.insertAfterId
      );
      if (insertAfterIndex !== -1) {
        localeTree.items.splice(insertAfterIndex + 1, 0, itemToMove);
      } else {
        const error = `Item with ID '${options.insertAfterId}' not found`;
        logger.error({ insertAfterId: options.insertAfterId }, error);
        throw new Error(error);
      }
    } else {
      // No insertAfterId specified, move to beginning
      localeTree.items.unshift(itemToMove);
    }

    logger.info({ tree, locale }, "Updating navigation tree after move");
    const result = await updateNavigationTree(tree);

    if (result.succeeded) {
      logger.info({ result }, "Navigation item moved successfully");
      console.log("✅ Navigation item moved successfully");
    } else {
      const error = result.message ?? `Error code: ${result.errorCode}`;
      logger.error({ result }, `Failed to move navigation item: ${error}`);
      throw new Error(`Failed to move navigation item: ${error}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      { error, itemId },
      `Failed to move navigation item: ${errorMessage}`
    );
    throw error;
  }
}

export async function moveNavigationItems(
  itemIds: string[],
  options: { locale?: string; insertAfterId?: string } = {}
) {
  logger.info({ itemIds, options }, "Moving multiple navigation items");

  if (itemIds.length === 0) {
    throw new Error("No items specified to move");
  }

  // For single item, use the existing function
  if (itemIds.length === 1) {
    return moveNavigationItem(itemIds[0]!, options);
  }

  try {
    const tree = await getNavigationTree();
    const locale = options.locale ?? "en";

    const localeTree = tree.find((t) => t.locale === locale);
    if (!localeTree) {
      const error = `No navigation found for locale: ${locale}`;
      logger.error({ locale }, error);
      throw new Error(error);
    }

    // Find all items to move (maintain original order)
    const itemsToMove: NavigationItem[] = [];
    for (const itemId of itemIds) {
      const item = findNavigationItemRecursive(localeTree.items, itemId);
      if (!item) {
        const error = `Navigation item with ID '${itemId}' not found`;
        logger.error({ itemId }, error);
        throw new Error(error);
      }
      itemsToMove.push(item);
    }

    // Remove all items from current positions
    for (const itemId of itemIds) {
      const removed = removeNavigationItemRecursive(localeTree.items, itemId);
      if (!removed) {
        const error = `Failed to remove item from current position: ${itemId}`;
        logger.error({ itemId }, error);
        throw new Error(error);
      }
    }

    // Insert all items as a group at new position
    if (options.insertAfterId) {
      const insertAfterIndex = localeTree.items.findIndex(
        (item) => item.id === options.insertAfterId
      );
      if (insertAfterIndex !== -1) {
        // Insert all items after the reference item, maintaining their order
        itemsToMove.reverse(); // Reverse to maintain correct order after splice
        itemsToMove.forEach((item) => {
          localeTree.items.splice(insertAfterIndex + 1, 0, item);
        });
      } else {
        const error = `Item with ID '${options.insertAfterId}' not found`;
        logger.error({ insertAfterId: options.insertAfterId }, error);
        throw new Error(error);
      }
    } else {
      // No insertAfterId specified, move to beginning (maintain order)
      itemsToMove.reverse(); // Reverse to maintain correct order
      itemsToMove.forEach((item) => {
        localeTree.items.unshift(item);
      });
    }

    logger.info(
      { tree, locale, itemCount: itemIds.length },
      "Updating navigation tree after moving multiple items"
    );
    const result = await updateNavigationTree(tree);

    if (result.succeeded) {
      logger.info(
        { result, itemCount: itemIds.length },
        "Navigation items moved successfully"
      );
      console.log(`✅ ${itemIds.length} navigation items moved successfully`);
    } else {
      const error = result.message ?? `Error code: ${result.errorCode}`;
      logger.error({ result }, `Failed to move navigation items: ${error}`);
      throw new Error(`Failed to move navigation items: ${error}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      { error, itemIds, itemCount: itemIds.length },
      `Failed to move navigation items: ${errorMessage}`
    );
    throw error;
  }
}
