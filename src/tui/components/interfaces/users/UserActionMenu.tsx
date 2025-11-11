import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";
import type { UserMinimal } from "@/types";
import { getProviderName } from "@/utils/users";

interface ActionItem {
  id: string;
  label: string;
  color: string;
  requiresActive?: boolean;
  disabled?: boolean;
}

const actions: ActionItem[] = [
  { id: "view", label: "View Details", color: "blue" },
  { id: "edit", label: "Edit User", color: "cyan" },
  {
    id: "activate",
    label: "Activate User",
    color: "green",
    requiresActive: false,
  },
  {
    id: "deactivate",
    label: "Deactivate User",
    color: "yellow",
    requiresActive: true,
  },
  { id: "verify", label: "Verify User", color: "green" },
  { id: "enable2fa", label: "Enable 2FA", color: "magenta" },
  { id: "disable2fa", label: "Disable 2FA", color: "magenta" },
  { id: "resetPassword", label: "Reset Password", color: "yellow" },
  { id: "delete", label: "Delete User", color: "red" },
];

interface UserActionMenuProps {
  user: UserMinimal;
  onAction: (action: string, user: UserMinimal) => void;
}

export function UserActionMenu({ user, onAction }: UserActionMenuProps) {
  const { theme } = useTheme();

  useFooterHelp(COMMON_HELP_PATTERNS.MENU);

  const availableActions = actions
    .map((action) => {
      // Update label for password reset when user has external auth
      if (action.id === "resetPassword" && user.providerKey !== "local") {
        const providerDisplay = getProviderName(user.providerKey);
        return {
          ...action,
          label: `Password managed by ${providerDisplay}`,
          disabled: true,
        };
      }

      // Update label for 2FA options when user has external auth
      if ((action.id === "enable2fa" || action.id === "disable2fa") && user.providerKey !== "local") {
        const providerDisplay = getProviderName(user.providerKey);
        return {
          ...action,
          label: `2FA managed by ${providerDisplay}`,
          disabled: true,
        };
      }

      // Update label for verify when user has external auth
      if (action.id === "verify" && user.providerKey !== "local") {
        const providerDisplay = getProviderName(user.providerKey);
        return {
          ...action,
          label: `User verified by ${providerDisplay}`,
          disabled: true,
        };
      }

      return action;
    })
    .filter((action) => {
      if (action.requiresActive === undefined) return true;
      if (action.requiresActive && !user.isActive) return false;
      if (!action.requiresActive && user.isActive && action.id === "activate")
        return false;
      return true;
    });

  // Find first non-disabled action for initial selection
  const initialIndex = availableActions.findIndex((a) => !a.disabled);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  useInput((input, key) => {
    if (key.upArrow) {
      let newIndex = selectedIndex - 1;
      while (newIndex >= 0 && availableActions[newIndex]?.disabled) {
        newIndex--;
      }
      if (newIndex >= 0) {
        setSelectedIndex(newIndex);
      }
    } else if (key.downArrow) {
      let newIndex = selectedIndex + 1;
      while (
        newIndex < availableActions.length &&
        availableActions[newIndex]?.disabled
      ) {
        newIndex++;
      }
      if (newIndex < availableActions.length) {
        setSelectedIndex(newIndex);
      }
    } else if (key.return) {
      const selectedAction = availableActions[selectedIndex];
      if (selectedAction && !selectedAction.disabled) {
        onAction(selectedAction.id, user);
      }
    }
  });

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Actions for: {user.name}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.muted}>
          Email: {user.email} | ID: {user.id}
        </Text>
      </Box>

      <VirtualizedList
        items={availableActions}
        selectedIndex={selectedIndex}
        getItemKey={(action) => action.id}
        itemHeight={1}
        renderItem={(action, index, isHighlighted) => {
          const isDisabled = action.disabled ?? false;

          return (
            <Box height={1} flexShrink={0}>
              <Text
                color={
                  isDisabled
                    ? theme.colors.muted
                    : isHighlighted
                      ? theme.colors.accent
                      : action.color
                }
                bold={isHighlighted && !isDisabled}
                dimColor={isDisabled}
                wrap="truncate"
              >
                {isHighlighted && !isDisabled ? "▶ " : "  "}
                {action.label}
              </Text>
            </Box>
          );
        }}
      />
    </Box>
  );
}
