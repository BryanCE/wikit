import React, { useState, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import type { NavigationItem, NavigationTree } from "@/types";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { type Theme } from "@/tui/theme";
import { useIcon } from "@/tui/contexts/IconContext";

interface NavTreeDisplayProps {
  tree?: NavigationTree;
  theme: Theme;
  instance?: string;
  onItemSelect: (itemId: string) => void;
}

interface FlatNavigationItem extends NavigationItem {
  depth: number;
  isExpanded?: boolean;
}

export function NavTreeDisplay({
  tree,
  theme,
  instance: _instance,
  onItemSelect,
}: NavTreeDisplayProps) {
  const { formatIcon } = useIcon();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

  const flatItems = useMemo(() => {
    return tree?.items ? flattenItems(tree.items) : [];
  }, [tree?.items, expandedItems]);

  // Keyboard handling for navigation
  useInput((input, key) => {
    if (!flatItems.length) return;

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (key.rightArrow) {
      const currentItem = flatItems[selectedIndex];
      if (currentItem && currentItem.children && currentItem.children.length > 0) {
        setExpandedItems((prev) => new Set([...prev, currentItem.id]));
      }
    } else if (key.leftArrow) {
      const currentItem = flatItems[selectedIndex];
      if (currentItem && expandedItems.has(currentItem.id)) {
        setExpandedItems((prev) => {
          const next = new Set(prev);
          next.delete(currentItem.id);
          return next;
        });
      }
    } else if (key.return) {
      const currentItem = flatItems[selectedIndex];
      onItemSelect(currentItem?.id ?? "");
    }
  });

  const renderNavigationItem = (item: FlatNavigationItem, index: number, isHighlighted: boolean) => {
    const indent = "  ".repeat(item.depth);

    if (item.kind === "divider") {
      return (
        <Box backgroundColor={isHighlighted ? theme.colors.primary : undefined} height={1} flexShrink={0}>
          <Text
            color={isHighlighted ? theme.colors.background : theme.colors.muted}
            wrap="truncate"
          >
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

    const backgroundColor = isHighlighted ? theme.colors.primary : undefined;
    const textColor = isHighlighted ? theme.colors.background : theme.colors.text;

    return (
      <Box backgroundColor={backgroundColor} height={1} flexShrink={0}>
        <Text
          color={textColor}
          bold={isHeader}
          wrap="truncate"
        >
          {indent}
          {expandIcon}
          {icon}
          {label}
          {target}
          {visibility}
        </Text>
      </Box>
    );
  };

  if (!tree) {
    return (
      <Box justifyContent="center" paddingY={2}>
        <Text color={theme.colors.muted}>No navigation tree for this locale</Text>
      </Box>
    );
  }

  if (!tree.items.length) {
    return (
      <Box justifyContent="center" paddingY={2}>
        <Text color={theme.colors.muted}>No navigation items found</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.accent} bold>
          Navigation Tree ({tree.locale})
        </Text>
      </Box>

      <Box flexDirection="column" flexGrow={1}>
        <VirtualizedList
          items={flatItems}
          selectedIndex={selectedIndex}
          getItemKey={(item, index) => `${item.id}-${index}`}
          itemHeight={1}
          renderItem={renderNavigationItem}
        />
      </Box>
    </Box>
  );
}
