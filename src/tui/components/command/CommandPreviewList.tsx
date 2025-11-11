import React from "react";
import { Box, Text } from "ink";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { COMMANDS } from "@/tui/commands";
import type { Theme } from "@/tui/theme";

interface CommandPreviewListProps {
  filteredCommands: typeof COMMANDS;
  selectedIndex: number;
  theme: Theme;
}

export function CommandPreviewList({
  filteredCommands,
  selectedIndex,
  theme,
}: CommandPreviewListProps) {
  if (filteredCommands.length === 0) {
    return (
      <Box
        borderStyle="round"
        borderColor={theme.colors.error}
        padding={1}
        marginTop={1}
      >
        <Text color={theme.colors.error}>No matching commands found</Text>
      </Box>
    );
  }

  return (
    <Box
      borderStyle="round"
      borderColor={theme.colors.primary}
      backgroundColor={theme.backgrounds.surface}
      padding={1}
      marginTop={1}
      flexDirection="column"
      flexGrow={1}
    >
      <Box marginBottom={1}>
        <Text color={theme.colors.muted} bold>
          Commands ({filteredCommands.length}):
        </Text>
      </Box>

      <VirtualizedList
        items={filteredCommands}
        selectedIndex={selectedIndex}
        getItemKey={(cmd) => cmd.name}
        itemHeight={1}
        renderItem={(cmd, index, isHighlighted) => {
          const commandDisplay = cmd.args
            ? `${cmd.name} ${cmd.args}`
            : cmd.name;
          const aliasDisplay = cmd.aliases
            ? ` (${cmd.aliases.join(", ")})`
            : "";

          return (
            <Box height={1} flexShrink={0}>
              <Text
                color={
                  isHighlighted ? theme.colors.background : theme.colors.primary
                }
                backgroundColor={
                  isHighlighted ? theme.colors.primary : undefined
                }
                bold={isHighlighted}
                wrap="truncate"
              >
                {isHighlighted ? " ► " : "   "}/{commandDisplay}
                <Text
                  color={
                    isHighlighted ? theme.colors.background : theme.colors.muted
                  }
                >
                  {aliasDisplay}
                </Text>
                <Text
                  color={
                    isHighlighted ? theme.colors.background : theme.colors.muted
                  }
                >
                  {" - " + cmd.description}
                </Text>
              </Text>
            </Box>
          );
        }}
      />

      <Box marginTop={1}>
        <Text color={theme.colors.muted}>
          ↑↓ navigate • Tab complete • Enter select • Esc cancel
        </Text>
      </Box>
    </Box>
  );
}
