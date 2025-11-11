import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface MenuItem {
  id: string;
  label: string;
  color: string;
}

interface GroupsMainMenuProps {
  onAction: (action: string) => void;
}

export function GroupsMainMenu({ onAction }: GroupsMainMenuProps) {
  const { theme } = useTheme();

  const menuItems: MenuItem[] = [
    { id: "create", label: "Create New Group", color: theme.colors.success },
    { id: "orphaned", label: "Find Orphaned Users", color: theme.colors.warning },
    { id: "refresh", label: "Refresh Groups List", color: theme.colors.primary },
    { id: "cancel", label: "Cancel", color: theme.colors.muted },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);

  useFooterHelp(COMMON_HELP_PATTERNS.MENU);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(menuItems.length - 1, prev + 1));
    } else if (key.return) {
      const selectedItem = menuItems[selectedIndex];
      if (selectedItem) {
        onAction(selectedItem.id);
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Groups Menu
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {menuItems.map((item, index) => {
          const isSelected = index === selectedIndex;

          return (
            <Box key={item.id}>
              <Text
                color={isSelected ? theme.colors.accent : item.color}
                bold={isSelected}
              >
                {isSelected ? " ► " : "   "}
                {item.label}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
