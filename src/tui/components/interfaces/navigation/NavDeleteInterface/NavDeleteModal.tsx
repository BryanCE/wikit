import { useState, useMemo } from "react";
import { Box } from "ink";
import { AsyncActionDialog } from "@comps/modals/AsyncActionDialog";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { InstanceContext } from "@/contexts/InstanceContext";
import type { NavigationTree, NavigationItem } from "@/types";
import { removeNavigationItem } from "@/commands/navigation";
import { logger } from "@/utils/logger";
import { NavItemSelector } from "./NavItemSelector";
import { MarkedNavItems } from "./MarkedNavItems";
import { useNavDeleteKeyboard } from "./hooks/useNavDeleteKeyboard";

interface NavDeleteModalProps {
  tree: NavigationTree;
  onClose: () => void;
  onSuccess: () => void;
  onStatusChange: (message: string) => void;
}

interface FlatNavigationItem extends NavigationItem {
  depth: number;
  isExpanded?: boolean;
}

export function NavDeleteModal({
  tree,
  onClose,
  onSuccess,
  onStatusChange,
}: NavDeleteModalProps) {
  const instance = InstanceContext.getInstance();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [markedForDeletion, setMarkedForDeletion] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [inSelectMode, setInSelectMode] = useState(false);

  // Flatten navigation tree items (memoized to prevent flashing on navigation)
  const flatItems = useMemo(() => {
    const flattenItems = (
      items: NavigationItem[],
      depth = 0
    ): FlatNavigationItem[] => {
      const result: FlatNavigationItem[] = [];

      for (const item of items) {
        result.push({ ...item, depth, isExpanded: expandedItems.has(item.id) });

        if (
          item.children &&
          item.children.length > 0 &&
          expandedItems.has(item.id)
        ) {
          result.push(...flattenItems(item.children, depth + 1));
        }
      }

      return result;
    };

    return tree?.items ? flattenItems(tree.items) : [];
  }, [tree?.items, expandedItems]);

  const markedItems = useMemo(
    () => flatItems.filter((item) => markedForDeletion.has(item.id)),
    [flatItems, markedForDeletion]
  );

  // Setup escape handling
  useEscape("nav-delete-modal", () => {
    if (showDeleteConfirm) {
      setShowDeleteConfirm(false);
    } else {
      onClose();
    }
  });

  // Use keyboard hook
  useNavDeleteKeyboard({
    selectedIndex,
    setSelectedIndex,
    markedForDeletion,
    setMarkedForDeletion,
    expandedItems,
    setExpandedItems,
    flatItems,
    markedItems,
    showDeleteConfirm,
    inSelectMode,
    setInSelectMode,
    onProceedToConfirm: () => {
      if (markedItems.length > 0) {
        setShowDeleteConfirm(true);
      }
    },
  });

  // Dynamic footer help text
  const footerHelpText = useMemo(() => {
    if (inSelectMode) {
      return "↑↓ navigate • →← expand/collapse • Space mark • c clear • Enter delete • Esc back";
    }
    return "↓ enter select mode • Esc close";
  }, [inSelectMode]);

  useFooterHelp(footerHelpText);
  useHeaderData({ title: "Delete Navigation Items", metadata: `(${tree.locale})` });

  if (showDeleteConfirm) {
    return (
      <AsyncActionDialog
        title="CONFIRM DELETION"
        message={`Delete ${markedItems.length} navigation item(s)?`}
        confirmText="Yes, delete them"
        cancelText="No, cancel"
        items={markedItems.slice(0, 5).map((item) => item.label ?? item.id)}
        destructive={true}
        loadingMessage="Deleting navigation items..."
        successMessage="Navigation items deleted successfully!"
        onConfirm={async () => {
          let successCount = 0;
          let errorCount = 0;

          for (const item of markedItems) {
            try {
              await removeNavigationItem(item.id, { locale: tree.locale });
              successCount++;
            } catch (error) {
              errorCount++;
              logger.error(
                { error, itemId: item.id, label: item.label, locale: tree.locale, instance },
                "Failed to delete navigation item"
              );
            }
          }

          logger.info({ successCount, errorCount, total: markedItems.length }, "Bulk delete completed");

          // Store status message for later
          onStatusChange(
            `Deleted ${successCount} item(s)${errorCount > 0 ? `, ${errorCount} failed` : ""}`
          );

          // If all failed, throw error to trigger error state
          if (successCount === 0 && errorCount > 0) {
            throw new Error(`Failed to delete all ${errorCount} item(s)`);
          }
        }}
        onSuccess={async () => {
          setShowDeleteConfirm(false);
          setMarkedForDeletion(new Set());
          onSuccess();
          onClose();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    );
  }

  return (
    <Box flexDirection="row" flexGrow={1}>
      <NavItemSelector
        flatItems={flatItems}
        selectedIndex={selectedIndex}
        markedForDeletion={markedForDeletion}
        inSelectMode={inSelectMode}
      />

      <MarkedNavItems
        markedItems={markedItems}
        markedForDeletionSize={markedForDeletion.size}
      />
    </Box>
  );
}
