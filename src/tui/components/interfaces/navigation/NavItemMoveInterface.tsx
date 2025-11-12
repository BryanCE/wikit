import React, { useState, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import type { NavigationTree, NavigationItem } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useIcon } from "@/tui/contexts/IconContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { AsyncActionDialog } from "@comps/modals/AsyncActionDialog";
import { VirtualizedList } from "@comps/ui/VirtualizedList";

interface NavItemMoveInterfaceProps {
  locale: string;
  existingTree?: NavigationTree;
  onSubmit: () => void;
  onCancel: () => void;
}

type MovePhase = "select" | "placement" | "confirm";

type PreviewItem = { item: NavigationItem | null; isMoving: boolean };

export function NavItemMoveInterface({
  locale,
  existingTree,
  onSubmit,
  onCancel,
}: NavItemMoveInterfaceProps) {
  const { theme } = useTheme();
  const { formatIcon } = useIcon();
  const [phase, setPhase] = useState<MovePhase>("select");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [markedItemIds, setMarkedItemIds] = useState<Set<string>>(new Set());
  const [placementIndex, setPlacementIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const availableItems = existingTree?.items ?? [];

  // Phase help text
  const helpText = useMemo(() => {
    if (phase === "select") {
      if (markedItemIds.size > 0) {
        return "↑↓ navigate • Space mark • Enter move • Esc cancel";
      }
      return "↑↓ navigate • Space mark • Esc cancel";
    } else if (phase === "placement") {
      return "↑↓ position • Enter confirm • Esc back";
    }
    return "Enter confirm • Esc cancel";
  }, [phase, markedItemIds.size]);

  // Status message - only show when items are actually selected
  const statusMessage = useMemo(() => {
    if (phase === "select" && markedItemIds.size > 0) {
      return `${markedItemIds.size} item${markedItemIds.size === 1 ? "" : "s"} marked`;
    }
    return ""; // Empty means don't override parent
  }, [phase, markedItemIds.size]);

  useFooterHelp(helpText);
  useFooterStatus(statusMessage);

  // Dynamic header title based on phase
  const headerTitle = useMemo(() => {
    if (phase === "select") {
      return "Move Navigation Items - Select Items";
    } else if (phase === "placement") {
      return "Move Navigation Items - Choose Destination";
    }
    return "Move Navigation Items";
  }, [phase]);

  useHeaderData({ title: headerTitle, metadata: `(${locale})` });

  // Build preview items for placement phase
  const previewItems: PreviewItem[] = useMemo(() => {
    if (phase !== "placement") return [];

    const items: PreviewItem[] = [];
    const itemsWithoutMoving = availableItems.filter(
      (item) => !markedItemIds.has(item.id)
    );
    // Get moving items in their original order
    const movingItems = availableItems.filter((item) =>
      markedItemIds.has(item.id)
    );

    for (let i = 0; i <= itemsWithoutMoving.length; i++) {
      if (i === placementIndex) {
        // Insert all moving items as a group
        movingItems.forEach((item) => {
          items.push({ item, isMoving: true });
        });
      }
      if (i < itemsWithoutMoving.length) {
        items.push({ item: itemsWithoutMoving[i]!, isMoving: false });
      }
    }

    return items;
  }, [phase, availableItems, markedItemIds, placementIndex]);

  useEscape("nav-move", () => {
    if (phase === "select") {
      onCancel();
    } else if (phase === "placement") {
      setPhase("select");
      setPlacementIndex(0);
    } else if (phase === "confirm") {
      setPhase("placement");
    }
  });

  useInput((input, key) => {
    if (phase === "confirm") return;

    if (phase === "select") {
      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => Math.min(availableItems.length - 1, prev + 1));
      } else if (input === " ") {
        const selectedItem = availableItems[selectedIndex];
        if (selectedItem) {
          setMarkedItemIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(selectedItem.id)) {
              newSet.delete(selectedItem.id);
            } else {
              newSet.add(selectedItem.id);
            }
            return newSet;
          });
        }
      } else if (key.return) {
        if (markedItemIds.size > 0) {
          setPhase("placement");
          // Set initial placement index to the first marked item's position
          const firstMarkedIndex = availableItems.findIndex((item) =>
            markedItemIds.has(item.id)
          );
          setPlacementIndex(firstMarkedIndex >= 0 ? firstMarkedIndex : 0);
        }
      }
    } else if (phase === "placement") {
      const itemsWithoutMoving = availableItems.filter(
        (item) => !markedItemIds.has(item.id)
      );
      if (key.upArrow) {
        setPlacementIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setPlacementIndex((prev) => Math.min(itemsWithoutMoving.length, prev + 1));
      } else if (key.return) {
        setPhase("confirm");
      }
    }
  });


  const getItemDisplayLabel = (item: NavigationItem): string => {
    if (item.kind === "divider") return "─────────────────────";
    const icon = formatIcon(item.icon);
    const kindBadge = item.kind === "header" ? " [H]" : "";
    return `${icon}${item.label ?? item.id}${kindBadge}`;
  };

  if (phase === "confirm") {
    const movingItems = availableItems.filter((item) =>
      markedItemIds.has(item.id)
    );
    const itemsWithoutMoving = availableItems.filter(
      (item) => !markedItemIds.has(item.id)
    );
    const itemBefore = itemsWithoutMoving[placementIndex - 1];

    const confirmItems = [
      `Items: ${movingItems.length}`,
      movingItems.map((item) => `  • ${item.label ?? item.id}`),
      placementIndex === 0
        ? "New Position: Beginning of list"
        : `After: ${getItemDisplayLabel(itemBefore!)}`,
    ].flat();

    const itemWord = markedItemIds.size === 1 ? "item" : "items";

    return (
      <AsyncActionDialog
        title="Confirm Move Navigation Items"
        message={`Move ${markedItemIds.size} ${itemWord} to new position?`}
        confirmText="Move"
        cancelText="Cancel"
        items={confirmItems}
        destructive={false}
        loadingMessage="Moving navigation items..."
        successMessage="Navigation items moved successfully!"
        onConfirm={async () => {
          if (markedItemIds.size === 0) throw new Error("No items selected");

          const itemsWithoutMoving = availableItems.filter(
            (item) => !markedItemIds.has(item.id)
          );

          let insertAfterId: string | undefined;
          if (placementIndex === 0) {
            insertAfterId = undefined;
          } else {
            const itemBefore = itemsWithoutMoving[placementIndex - 1];
            insertAfterId = itemBefore?.id;
          }

          const { moveNavigationItems } = await import("@/commands/navigation");
          await moveNavigationItems(Array.from(markedItemIds), {
            locale,
            insertAfterId,
          });
        }}
        onSuccess={() => {
          setPhase("select");
          onSubmit();
        }}
        onCancel={() => setPhase("placement")}
        onError={(err) => {
          setError(err);
          setPhase("select");
        }}
      />
    );
  }

  if (phase === "placement") {
    return (
      <Box flexDirection="column" height="100%">
        <Box flexGrow={1}>
          <VirtualizedList
            items={previewItems}
            selectedIndex={placementIndex}
            itemHeight={1}
            getItemKey={(previewItem, index) =>
              previewItem.isMoving
                ? `moving-${previewItem.item?.id ?? index}`
                : previewItem.item?.id ?? `item-${index}`
            }
            renderItem={(previewItem, index, isHighlighted) => {
              const { item, isMoving } = previewItem;

              if (item && item.kind === "divider") {
                return (
                  <Box
                    backgroundColor={
                      isMoving
                        ? theme.colors.warning
                        : isHighlighted
                        ? theme.colors.primary
                        : undefined
                    }
                    paddingX={1}
                  >
                    <Text
                      color={
                        isMoving || isHighlighted
                          ? theme.colors.background
                          : theme.colors.muted
                      }
                    >
                      ─────────────────────────────────
                    </Text>
                  </Box>
                );
              }

              const label = isMoving
                ? item?.label ?? "(moving item)"
                : item?.label ?? item?.id ?? "";
              const icon = formatIcon(item?.icon);
              const kindBadge = item?.kind === "header" ? " [HEADER]" : "";

              return (
                <Box
                  backgroundColor={
                    isMoving
                      ? theme.colors.warning
                      : isHighlighted
                      ? theme.colors.primary
                      : undefined
                  }
                  paddingX={1}
                >
                  <Text
                    color={
                      isMoving || isHighlighted
                        ? theme.colors.background
                        : theme.colors.text
                    }
                    bold={isMoving || item?.kind === "header"}
                  >
                    {isMoving ? "➤ " : "  "}
                    {icon}
                    {label}
                    {kindBadge}
                    {isMoving && markedItemIds.size > 1 ? " [MOVING GROUP]" : ""}
                    {isMoving && markedItemIds.size === 1 ? " [MOVING]" : ""}
                  </Text>
                </Box>
              );
            }}
          />
        </Box>

        <Box marginTop={1}>
          <Text color={theme.colors.muted}>
            ↑↓ move • Enter confirm • Esc cancel
          </Text>
        </Box>
      </Box>
    );
  }

  // Phase: select
  return (
    <Box flexDirection="column" height="100%">
      <Box flexGrow={1}>
        <VirtualizedList
          items={availableItems}
          selectedIndex={selectedIndex}
          itemHeight={1}
          getItemKey={(item) => item.id}
          renderItem={(item, index, isHighlighted) => {
            const isMarked = markedItemIds.has(item.id);

            if (item.kind === "divider") {
              return (
                <Box
                  backgroundColor={isHighlighted ? theme.colors.primary : undefined}
                  paddingX={1}
                >
                  <Text
                    color={
                      isHighlighted ? theme.colors.background : theme.colors.muted
                    }
                  >
                    {isMarked ? "☑ " : "☐ "}
                    ─────────────────────────────────
                  </Text>
                </Box>
              );
            }

            const icon = formatIcon(item.icon);
            const label = item.label ?? item.id;
            const kindBadge = item.kind === "header" ? " [HEADER]" : "";

            return (
              <Box
                backgroundColor={isHighlighted ? theme.colors.primary : undefined}
                paddingX={1}
              >
                <Text
                  color={
                    isHighlighted
                      ? theme.colors.background
                      : isMarked
                      ? theme.colors.warning
                      : theme.colors.text
                  }
                  bold={isHighlighted || item.kind === "header"}
                >
                  {isMarked ? "☑ " : "☐ "}
                  {isHighlighted ? " ► " : "   "}
                  {icon}
                  {label}
                  {kindBadge}
                </Text>
              </Box>
            );
          }}
        />
      </Box>

      {error && (
        <Box marginTop={1}>
          <Text color={theme.colors.error}>[ERROR] {error}</Text>
        </Box>
      )}
    </Box>
  );
}
