import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { UserMinimal } from "@/types";

interface MembersTabProps {
  members: UserMinimal[];
  selectedIndex: number;
  markedForRemoval: Set<number>;
  inMembersContent: boolean;
}

export function MembersTab({
  members,
  selectedIndex,
  markedForRemoval,
  inMembersContent,
}: MembersTabProps) {
  const { theme } = useTheme();

  return (
    <Box flexDirection="column" paddingX={1} flexGrow={1}>
      <Box
        flexGrow={1}
        borderStyle="round"
        borderColor={inMembersContent ? theme.colors.error : theme.colors.muted}
        paddingX={1}
      >
        {members.length === 0 ? (
          <Box paddingY={1}>
            <Text color={theme.colors.muted}>No members in this group</Text>
          </Box>
        ) : (
          <VirtualizedList
            items={members}
            selectedIndex={inMembersContent ? selectedIndex : -1}
            getItemKey={(user) => String(user.id)}
            itemHeight={1}
            renderItem={(user, index, isHighlighted) => {
              const isMarked = markedForRemoval.has(user.id);

              const backgroundColor = isHighlighted && inMembersContent ? theme.colors.error : undefined;
              const textColor = isMarked
                ? theme.colors.error
                : isHighlighted && inMembersContent
                ? theme.colors.background
                : theme.colors.text;

              return (
                <Box backgroundColor={backgroundColor} height={1} flexShrink={0}>
                  <Text
                    color={textColor}
                    bold={isMarked || (isHighlighted && inMembersContent)}
                    dimColor={!inMembersContent}
                    wrap="truncate"
                  >
                    {isMarked ? "[X] " : "[ ] "}
                    {user.name} ({user.email})
                  </Text>
                </Box>
              );
            }}
          />
        )}
      </Box>

      {markedForRemoval.size > 0 && (
        <Box
          marginTop={1}
          borderStyle="single"
          borderColor={theme.colors.error}
          paddingX={1}
          flexShrink={0}
        >
          <Text color={theme.colors.error} bold>
            {markedForRemoval.size} member(s) marked for removal • Press Enter to confirm
          </Text>
        </Box>
      )}
    </Box>
  );
}
