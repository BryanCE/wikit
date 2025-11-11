import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { OrphanedUser } from "@/utils/userAnalyzer";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface OrphanedUsersViewProps {
  users: OrphanedUser[];
  selectedIndex: number;
}

export function OrphanedUsersView({
  users,
  selectedIndex,
}: OrphanedUsersViewProps) {
  const { theme } = useTheme();

  useFooterHelp(COMMON_HELP_PATTERNS.VIEW_ONLY);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.warning} bold>
          Orphaned Users (not assigned to any group)
        </Text>
      </Box>

      {users.length === 0 ? (
        <Text color={theme.colors.success}>
          No orphaned users found. All users are assigned to at least one group.
        </Text>
      ) : (
        <>
          <Box marginBottom={1}>
            <Text color={theme.colors.muted}>
              Found {users.length} user{users.length === 1 ? "" : "s"} without
              group assignments
            </Text>
          </Box>

          <VirtualizedList
            items={users}
            selectedIndex={selectedIndex}
            getItemKey={(user) => String(user.id)}
            itemHeight={1}
            renderItem={(user, index, isHighlighted) => (
              <Box height={1} flexShrink={0}>
                <Text
                  color={
                    isHighlighted
                      ? theme.colors.accent
                      : user.isActive
                      ? theme.colors.text
                      : theme.colors.muted
                  }
                  bold={isHighlighted}
                  wrap="truncate"
                >
                  {isHighlighted ? " ► " : "   "}
                  {user.id.toString().padEnd(5)} {user.name.padEnd(30)}
                  {user.email.padEnd(35)} Status:{" "}
                  {user.isActive ? "[ACTIVE]" : "[INACTIVE]"} Created:{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </Box>
            )}
          />
        </>
      )}
    </Box>
  );
}
