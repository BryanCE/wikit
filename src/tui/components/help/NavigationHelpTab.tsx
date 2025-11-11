import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { KeyboardShortcut } from "./types";

interface NavigationHelpTabProps {
  shortcuts: KeyboardShortcut[];
  selectedIndex: number;
  inContent: boolean;
}

interface FlatItem {
  type: "category" | "shortcut";
  category?: string;
  shortcut?: KeyboardShortcut;
}

export function NavigationHelpTab({
  shortcuts,
  selectedIndex,
  inContent,
}: NavigationHelpTabProps) {
  const { theme } = useTheme();

  // Flatten shortcuts with category headers
  const flatItems: FlatItem[] = [];
  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  categories.forEach((category) => {
    flatItems.push({ type: "category", category });
    shortcuts
      .filter((s) => s.category === category)
      .forEach((shortcut) => {
        flatItems.push({ type: "shortcut", shortcut });
      });
  });

  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      borderStyle="single"
      borderColor={inContent ? theme.colors.secondary : theme.colors.muted}
      padding={1}
    >
      <Box paddingBottom={1}>
        <Text
          color={inContent ? theme.colors.secondary : theme.colors.muted}
          bold
        >
          Keyboard Shortcuts & Navigation
        </Text>
      </Box>

      <VirtualizedList
        items={flatItems}
        selectedIndex={selectedIndex}
        itemHeight={1}
        renderItem={(item, index, isHighlighted) => {
          if (item.type === "category") {
            return (
              <Text
                color={inContent ? theme.colors.warning : theme.colors.muted}
                bold
              >
                {item.category}
              </Text>
            );
          }

          const prefix = isHighlighted && inContent ? " ► " : "   ";
          const textColor = !inContent
            ? theme.colors.muted
            : isHighlighted
            ? theme.colors.background
            : theme.colors.text;

          return (
            <Text
              color={textColor}
              bold={isHighlighted && inContent}
              backgroundColor={
                isHighlighted && inContent ? theme.colors.primary : undefined
              }
            >
              {prefix}
              {item.shortcut!.key.padEnd(15)} {item.shortcut!.description}
            </Text>
          );
        }}
        getItemKey={(item, index) =>
          item.type === "category"
            ? `category-${item.category}`
            : `shortcut-${item.shortcut!.category}-${item.shortcut!.key}-${index}`
        }
      />
    </Box>
  );
}
