import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import type { GroupMinimal } from "@/types";

interface ActionItem {
  id: string;
  label: string;
  color: string;
  disabled?: boolean;
}

interface GroupActionMenuProps {
  group: GroupMinimal;
  onAction: (action: string, group: GroupMinimal) => void;
}

export function GroupActionMenu({ group, onAction }: GroupActionMenuProps) {
  const { theme } = useTheme();

  const actions: ActionItem[] = [
    { id: "view", label: "View Details", color: theme.colors.primary },
    { id: "members", label: "Manage Members", color: theme.colors.success },
    {
      id: "delete",
      label: "Delete Group",
      color: theme.colors.error,
      disabled: group.isSystem,
    },
  ];

  const availableActions = actions.filter((action) => !action.disabled);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(availableActions.length - 1, prev + 1));
    } else if (key.return) {
      const selectedAction = availableActions[selectedIndex];
      if (selectedAction) {
        onAction(selectedAction.id, group);
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Actions for: {group.name}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.muted}>
          ID: {group.id} | Users: {group.userCount ?? 0}
          {group.isSystem && " | SYSTEM GROUP"}
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {availableActions.map((action, index) => {
          const isSelected = index === selectedIndex;

          return (
            <Box key={action.id}>
              <Text
                color={isSelected ? theme.colors.accent : action.color}
                bold={isSelected}
              >
                {isSelected ? "▶ " : "  "}
                {action.label}
              </Text>
            </Box>
          );
        })}
      </Box>

      {group.isSystem && (
        <Box marginBottom={1}>
          <Text color={theme.colors.warning}>
            System groups cannot be deleted
          </Text>
        </Box>
      )}

      <Box>
        <Text color={theme.colors.muted}>
          ↑↓=navigate • Enter=select • Esc=cancel
        </Text>
      </Box>
    </Box>
  );
}
