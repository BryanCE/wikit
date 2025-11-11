import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";

interface MenuItem {
  id: string;
  label: string;
  color: string;
}

interface UsersMenuProps {
  menuItems: MenuItem[];
  selectedIndex: number;
}

export function UsersMenu({ menuItems, selectedIndex }: UsersMenuProps) {
  const { theme } = useTheme();

  useFooterHelp(formatHelpText(HELP_TEXT.NAVIGATE, HELP_TEXT.ENTER_SELECT, "Esc=back to list"));

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          User Management Menu
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
                {isSelected ? "▶ " : "  "}
                {item.label}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}