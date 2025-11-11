import React from "react";
import { Box, Text } from "ink";
import type { Theme } from "@/tui/theme";
import type { FocusMode } from "@/types";

interface QuickAction {
  id: string;
  label: string;
  color: string;
}

interface QuickActionsProps {
  focusMode: FocusMode;
  selectedIndex: number;
  quickActions: QuickAction[];
  theme: Theme;
}

export function QuickActions({
  focusMode,
  selectedIndex,
  quickActions,
  theme,
}: QuickActionsProps) {
  return (
    <Box flexDirection="column" width="30%" paddingLeft={2}>
      <Box>
        <Text
          color={
            focusMode === "menu" ? theme.colors.secondary : theme.colors.muted
          }
        >
          Quick Actions:
        </Text>
      </Box>

      {focusMode === "menu" ? (
        // Expanded menu
        <Box flexDirection="column">
          {quickActions.map((item, index) => {
            const isSelected = index === selectedIndex;

            return (
              <Box key={item.id}>
                <Text
                  color={isSelected ? theme.colors.background : item.color}
                  backgroundColor={
                    isSelected ? theme.colors.primary : undefined
                  }
                  bold={isSelected}
                >
                  {isSelected ? " ► " : "   "}
                  {item.label}
                </Text>
              </Box>
            );
          })}
        </Box>
      ) : (
        // Compact menu - show most important ones including exit
        <Box flexDirection="column">
          <Text color={theme.colors.muted}>...</Text>
        </Box>
      )}
    </Box>
  );
}
