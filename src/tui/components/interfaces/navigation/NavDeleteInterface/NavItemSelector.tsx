import React from "react";
import { Box, Text } from "ink";
import type { NavigationItem } from "@/types";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useIcon } from "@/tui/contexts/IconContext";

interface FlatNavigationItem extends NavigationItem {
  depth: number;
  isExpanded?: boolean;
}

interface NavItemSelectorProps {
  flatItems: FlatNavigationItem[];
  selectedIndex: number;
  markedForDeletion: Set<string>;
  inSelectMode: boolean;
}

export function NavItemSelector({
  flatItems,
  selectedIndex,
  markedForDeletion,
  inSelectMode,
}: NavItemSelectorProps) {
  const { theme } = useTheme();
  const { formatIcon } = useIcon();

  return (
    <Box flexDirection="column" width="60%" flexGrow={1}>
      <Box marginBottom={1} flexShrink={0}>
        <Text color={theme.colors.primary} bold>
          Select items to delete ({flatItems.length} total)
        </Text>
      </Box>
        <VirtualizedList
          items={flatItems}
          selectedIndex={inSelectMode ? selectedIndex : -1}
          getItemKey={(item, index) => `${item.id}-${index}`}
          itemHeight={1}
          renderItem={(item, index, isHighlighted) => {
            const indent = "  ".repeat(item.depth);
            const isMarked = markedForDeletion.has(item.id);

            if (item.kind === "divider") {
              return (
                <Box
                  backgroundColor={isHighlighted && inSelectMode ? theme.colors.primary : undefined}
                  height={1}
                  flexShrink={0}
                >
                  <Text
                    color={
                      isMarked
                        ? theme.colors.error
                        : isHighlighted && inSelectMode
                        ? theme.colors.background
                        : theme.colors.muted
                    }
                    dimColor={!inSelectMode}
                    wrap="truncate"
                  >
                    {isMarked ? "[X] " : "[ ] "}
                    {indent}─────────────────────────────────
                  </Text>
                </Box>
              );
            }

            const expandIcon =
              item.children && item.children.length > 0
                ? item.isExpanded
                  ? "▼ "
                  : "▶ "
                : "  ";

            const icon = formatIcon(item.icon);
            const label = item.label ?? item.id;
            const target = item.target ? ` → ${item.target}` : "";
            const visibility =
              item.visibilityMode && item.visibilityMode !== "all"
                ? ` [${item.visibilityMode}]`
                : "";
            const isHeader = item.kind === "header";

            const backgroundColor = isHighlighted && inSelectMode ? theme.colors.primary : undefined;
            const textColor = isMarked
              ? theme.colors.error
              : isHighlighted && inSelectMode
              ? theme.colors.background
              : theme.colors.text;

            return (
              <Box backgroundColor={backgroundColor} height={1} flexShrink={0}>
                <Text color={textColor} bold={isHeader || isMarked} dimColor={!inSelectMode} wrap="truncate">
                  {isMarked ? "[X] " : "[ ] "}
                  {indent}
                  {expandIcon}
                  {icon}
                  {label}
                  {target}
                  {visibility}
                </Text>
              </Box>
            );
          }}
        />
    </Box>
  );
}
