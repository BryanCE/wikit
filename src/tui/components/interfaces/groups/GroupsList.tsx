import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { GroupMinimal } from "@/types";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";

interface GroupsListProps {
  groups: GroupMinimal[];
  selectedIndex: number;
}

export function GroupsList({
  groups,
  selectedIndex,
}: GroupsListProps) {
  const { theme } = useTheme();

  useFooterHelp(
    formatHelpText(
      HELP_TEXT.NAVIGATE,
      HELP_TEXT.ENTER_SELECT,
      "m=menu",
      HELP_TEXT.BACK
    )
  );

  return (
    <Box flexDirection="column" flexGrow={1}>
      {groups.length === 0 ? (
        <Text color={theme.colors.muted}>No groups found</Text>
      ) : (
        <>
          <VirtualizedList
            items={groups}
            selectedIndex={selectedIndex}
            getItemKey={(group) => String(group.id)}
            itemHeight={1}
            renderItem={(group, index, isHighlighted) => (
              <Box height={1} flexShrink={0}>
                <Text
                  color={isHighlighted ? theme.colors.accent : theme.colors.text}
                  bold={isHighlighted}
                  wrap="truncate"
                >
                  {isHighlighted ? " ► " : "   "}
                  {group.id.toString().padEnd(5)} {group.name.padEnd(30)}
                  Users: {String(group.userCount ?? 0).padEnd(5)}
                  System: {group.isSystem ? "[X]" : "[ ]"}
                  Created: {new Date(group.createdAt).toLocaleDateString()}
                </Text>
              </Box>
            )}
          />
        </>
      )}
    </Box>
  );
}
