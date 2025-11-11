import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { GroupMinimal } from "@/types";

interface AllGroupsTabProps {
  groups: GroupMinimal[];
  selectedIndex: number;
  loading: boolean;
  inGroupsContent: boolean;
}

export function AllGroupsTab({
  groups,
  selectedIndex,
  loading,
  inGroupsContent,
}: AllGroupsTabProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <Box>
        <Text color={theme.colors.warning}>Loading groups...</Text>
      </Box>
    );
  }

  if (groups.length === 0) {
    return (
      <Box>
        <Text color={theme.colors.muted}>No groups found</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <VirtualizedList
        items={groups}
        selectedIndex={selectedIndex}
        getItemKey={(group) => String(group.id)}
        itemHeight={1}
        renderItem={(group, index, isHighlighted) => {
          const prefix = isHighlighted && inGroupsContent ? " ► " : "   ";

          // Muted when not in content, normal colors when in content
          const textColor = !inGroupsContent
            ? theme.colors.muted
            : isHighlighted
            ? theme.colors.background
            : theme.colors.text;

          return (
            <Box height={1} flexShrink={0}>
              <Text
                color={textColor}
                backgroundColor={
                  isHighlighted && inGroupsContent ? theme.colors.primary : undefined
                }
                bold={isHighlighted && inGroupsContent}
                wrap="truncate"
              >
                {prefix}
                {group.id.toString().padEnd(5)} {group.name.padEnd(30)}
                Users: {String(group.userCount ?? 0).padEnd(5)}
                System: {group.isSystem ? "[X]" : "[ ]"}
                Created: {new Date(group.createdAt).toLocaleDateString()}
              </Text>
            </Box>
          );
        }}
      />
    </Box>
  );
}
