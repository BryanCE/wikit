import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { OrphanedUser } from "@/utils/userAnalyzer";

interface OrphanedUsersTabProps {
  users: OrphanedUser[];
  selectedIndex: number;
  loading: boolean;
  inOrphanedContent: boolean;
}

export function OrphanedUsersTab({
  users,
  selectedIndex,
  loading,
  inOrphanedContent,
}: OrphanedUsersTabProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <Box>
        <Text color={theme.colors.warning}>Finding orphaned users...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text
          color={!inOrphanedContent ? theme.colors.muted : theme.colors.warning}
          bold={inOrphanedContent}
        >
          Orphaned Users (not assigned to any group)
        </Text>
      </Box>

      {users.length === 0 ? (
        <Text color={!inOrphanedContent ? theme.colors.muted : theme.colors.success}>
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
            renderItem={(user, index, isHighlighted) => {
              const prefix = isHighlighted && inOrphanedContent ? " ► " : "   ";

              // Muted when not in content, normal colors when in content
              const textColor = !inOrphanedContent
                ? theme.colors.muted
                : isHighlighted
                ? theme.colors.background
                : user.isActive
                ? theme.colors.text
                : theme.colors.muted;

              return (
                <Box height={1} flexShrink={0}>
                  <Text
                    color={textColor}
                    backgroundColor={
                      isHighlighted && inOrphanedContent ? theme.colors.primary : undefined
                    }
                    bold={isHighlighted && inOrphanedContent}
                    wrap="truncate"
                  >
                    {prefix}
                    {user.id.toString().padEnd(5)} {user.name.padEnd(30)}
                    {user.email.padEnd(35)} Status:{" "}
                    {user.isActive ? "[ACTIVE]" : "[INACTIVE]"} Created:{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </Box>
              );
            }}
          />
        </>
      )}
    </Box>
  );
}
