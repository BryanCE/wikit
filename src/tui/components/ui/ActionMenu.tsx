import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useTerminalDimensions } from "@/tui/hooks/useTerminalDimensions";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface Page {
  id: string;
  path: string;
  title: string;
  locale: string;
  isPublished: boolean;
}

interface ActionMenuProps {
  page: Page;
  onAction: (action: string, page: Page) => void;
  onClose: () => void;
}

interface ActionItem {
  id: string;
  label: string;
  colorKey: "primary" | "secondary" | "error" | "muted";
}

export function ActionMenu({ page, onAction, onClose }: ActionMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { theme } = useTheme();
  const { width, height } = useTerminalDimensions();

  const actions: ActionItem[] = [
    { id: "view", label: "View Details", colorKey: "primary" },
    { id: "copy", label: "Copy Path", colorKey: "secondary" },
    { id: "delete", label: "Delete Page", colorKey: "error" },
    { id: "close", label: "Close Menu", colorKey: "muted" },
  ];

  const menuWidth = Math.floor(width / 2);
  const menuHeight = Math.floor(height / 2);

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(actions.length - 1, prev + 1));
    } else if (key.return) {
      const selectedAction = actions[selectedIndex];
      if (selectedAction) {
        if (selectedAction.id === "close") {
          onClose();
        } else {
          onAction(selectedAction.id, page);
        }
      }
    }
  });

  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      justifyContent="center"
      alignItems="center"
    >
      <Box
        width={menuWidth}
        height={menuHeight}
        padding={1}
        borderStyle="round"
        borderColor={theme.colors.warning}
        backgroundColor={theme.backgrounds.surface}
        justifyContent="center"
        alignItems="center"
      >
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.colors.warning} bold>
              Actions for: {page.title}
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text color={theme.colors.muted}>Path: {page.path}</Text>
          </Box>

          <Box flexDirection="column" marginBottom={1}>
            {actions.map((action, index) => {
              const isSelected = index === selectedIndex;

              return (
                <Box key={action.id}>
                  <Text
                    color={
                      isSelected
                        ? theme.colors.background
                        : theme.colors[action.colorKey]
                    }
                    backgroundColor={
                      isSelected ? theme.colors.primary : undefined
                    }
                    bold={isSelected}
                  >
                    {isSelected ? " ► " : "   "}
                    {action.label}
                  </Text>
                </Box>
              );
            })}
          </Box>

          <Box>
            <Text color={theme.colors.muted}>
              {COMMON_HELP_PATTERNS.ACTION_MENU}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
