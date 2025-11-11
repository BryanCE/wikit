import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { UserMinimal } from "@/types";

interface AddUsersTabProps {
  nonMembers: UserMinimal[];
  selectedIndex: number;
  inAddContent: boolean;
  isLoading: boolean;
}

export function AddUsersTab({
  nonMembers,
  selectedIndex,
  inAddContent,
  isLoading,
}: AddUsersTabProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <Box flexDirection="column" paddingX={1} flexGrow={1}>
        <Box paddingY={1}>
          <Text color={theme.colors.warning}>Loading users...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1} flexGrow={1}>
      <Box
        flexGrow={1}
        borderStyle="round"
        borderColor={inAddContent ? theme.colors.success : theme.colors.muted}
        paddingX={1}
      >
        {nonMembers.length === 0 ? (
          <Box paddingY={1}>
            <Text color={theme.colors.muted}>
              All users are already members of this group
            </Text>
          </Box>
        ) : (
          <VirtualizedList
            items={nonMembers}
            selectedIndex={inAddContent ? selectedIndex : -1}
            getItemKey={(user) => String(user.id)}
            itemHeight={1}
            renderItem={(user, index, isHighlighted) => {
              const backgroundColor = isHighlighted && inAddContent ? theme.colors.success : undefined;
              const textColor = isHighlighted && inAddContent
                ? theme.colors.background
                : theme.colors.text;

              return (
                <Box backgroundColor={backgroundColor} height={1} flexShrink={0}>
                  <Text
                    color={textColor}
                    bold={isHighlighted && inAddContent}
                    dimColor={!inAddContent}
                    wrap="truncate"
                  >
                    {isHighlighted && inAddContent ? "▶ " : "  "}
                    {user.name} ({user.email})
                  </Text>
                </Box>
              );
            }}
          />
        )}
      </Box>

      {nonMembers.length > 0 && (
        <Box
          marginTop={1}
          borderStyle="single"
          borderColor={theme.colors.success}
          paddingX={1}
          flexShrink={0}
        >
          <Text color={theme.colors.success}>
            {nonMembers.length} user(s) available • Press Enter to add selected
          </Text>
        </Box>
      )}
    </Box>
  );
}
