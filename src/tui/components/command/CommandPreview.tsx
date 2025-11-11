import React from "react";
import { Box, Text } from "ink";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { COMMANDS } from "@/tui/commands";
import { getCommandPart } from "@/utils/commandParser";

interface CommandPreviewProps {
  input: string;
  selectedIndex: number;
  visible: boolean;
}

export function CommandPreview({
  input,
  selectedIndex,
  visible,
}: CommandPreviewProps) {
  const { theme } = useTheme();

  if (!visible) {
    return null;
  }

  // Extract command part from input (after /)
  const commandInput = getCommandPart(input);

  // Filter commands based on input
  const filteredCommands = COMMANDS.filter((cmd) => {
    if (!commandInput) return true; // Show all if no input after /

    // Match command name or aliases
    const matches =
      cmd.name.toLowerCase().startsWith(commandInput) ||
      cmd.aliases?.some((alias) =>
        alias.toLowerCase().startsWith(commandInput)
      );

    return matches;
  });

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
          ↑↓ navigate • Enter select • Esc cancel
        </Text>
      </Box>
    </Box>
  );
}

export { COMMANDS };
