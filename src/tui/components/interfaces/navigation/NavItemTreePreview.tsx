import React from "react";
import { Box, Text } from "ink";
import type { NavigationItem } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useIcon } from "@/tui/contexts/IconContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";

interface NavItemTreePreviewProps {
  previewTree: NavigationItem[];
  selectedButton: "confirm" | "back";
}

const isDivider = (item: NavigationItem): boolean => {
  return item.kind === "divider";
};

export function NavItemTreePreview({
  previewTree,
  selectedButton,
}: NavItemTreePreviewProps) {
  const { theme } = useTheme();
  const { formatIcon } = useIcon();

  const newItemIndex = previewTree.findIndex((item) =>
    item.id.startsWith("PREVIEW-")
  );

  return (
    <Box flexDirection="column" height="100%">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Preview: Navigation Tree After Adding Item
        </Text>
      </Box>

      <Box flexGrow={1}>
        <VirtualizedList
          items={previewTree}
          selectedIndex={newItemIndex}
          itemHeight={1}
          getItemKey={(item) => item.id}
          renderItem={(item) => {
            const isNewItem = item.id.startsWith("PREVIEW-");
            const isDiv = isDivider(item);

            if (isDiv) {
              return (
                <Box>
                  <Text color={theme.colors.muted}>
                    ─────────────────────────────────
                  </Text>
                </Box>
              );
            }

            const icon = formatIcon(item.icon);
            const label = item.label ?? item.id;
            const target = item.target ? ` → ${item.target}` : "";
            const isHeader = item.kind === "header";

            return (
              <Box
                backgroundColor={isNewItem ? theme.colors.success : undefined}
                paddingX={1}
              >
                <Text
                  color={
                    isNewItem ? theme.colors.background : theme.colors.text
                  }
                  bold={isNewItem || isHeader}
                >
                  {isNewItem ? "➤ " : "  "}
                  {icon}
                  {label}
                  {target}
                  {isNewItem ? " [NEW]" : ""}
                </Text>
              </Box>
            );
          }}
        />
      </Box>

      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Box
            marginRight={2}
            paddingX={2}
            paddingY={0}
            borderStyle="round"
            borderColor={selectedButton === "confirm" ? theme.colors.success : theme.colors.muted}
            backgroundColor={selectedButton === "confirm" ? theme.colors.success : undefined}
          >
            <Text
              color={selectedButton === "confirm" ? theme.colors.background : theme.colors.success}
              bold={selectedButton === "confirm"}
            >
              Looks Good
            </Text>
          </Box>

          <Box
            paddingX={2}
            paddingY={0}
            borderStyle="round"
            borderColor={selectedButton === "back" ? theme.colors.muted : theme.colors.muted}
            backgroundColor={selectedButton === "back" ? theme.colors.muted : undefined}
          >
            <Text
              color={selectedButton === "back" ? theme.colors.background : theme.colors.muted}
              bold={selectedButton === "back"}
            >
              Go Back
            </Text>
          </Box>
        </Box>

        <Text color={theme.colors.muted}>
          ←→ navigate • Enter select • Esc back to editing
        </Text>
      </Box>
    </Box>
  );
}
