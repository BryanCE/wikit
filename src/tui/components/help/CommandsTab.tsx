import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { CommandInfo } from "./types";

interface CommandsTabProps {
  commands: CommandInfo[];
  selectedIndex: number;
  inContent: boolean;
}

export function CommandsTab({
  commands,
  selectedIndex,
  inContent,
}: CommandsTabProps) {
  const { theme } = useTheme();
  const selectedCommand = commands[selectedIndex];

  return (
    <Box flexDirection="row" gap={2} flexGrow={1}>
      {/* Left panel: Command list */}
      <Box
        flexDirection="column"
        width="30%"
        borderStyle="single"
        borderColor={inContent ? theme.colors.primary : theme.colors.muted}
        padding={1}
      >
        <Box paddingBottom={1}>
          <Text
            color={inContent ? theme.colors.warning : theme.colors.muted}
            bold
          >
            Commands
          </Text>
        </Box>
        <VirtualizedList
          items={commands}
          selectedIndex={selectedIndex}
          itemHeight={1}
          renderItem={(cmd, index, isHighlighted) => {
            const prefix =
              isHighlighted && inContent ? " ► " : "   ";
            const textColor = !inContent
              ? theme.colors.muted
              : isHighlighted
              ? theme.colors.background
              : theme.colors.text;

            return (
              <Text
                color={textColor}
                bold={isHighlighted && inContent}
                backgroundColor={
                  isHighlighted && inContent
                    ? theme.colors.primary
                    : undefined
                }
              >
                {prefix}
                {cmd.command}
              </Text>
            );
          }}
          getItemKey={(cmd) => cmd.command}
        />
      </Box>

      {/* Right panel: Command details */}
      <Box
        flexDirection="column"
        width="70%"
        borderStyle="single"
        borderColor={inContent ? theme.colors.success : theme.colors.muted}
        padding={1}
      >
        {selectedCommand && (
          <Box flexDirection="column">
            <Box paddingBottom={1}>
              <Text
                color={inContent ? theme.colors.success : theme.colors.muted}
                bold
              >
                {selectedCommand.command}
              </Text>
            </Box>

            <Box paddingBottom={1}>
              <Text
                color={inContent ? theme.colors.accent : theme.colors.muted}
                bold
              >
                Category:{" "}
              </Text>
              <Text color={inContent ? theme.colors.text : theme.colors.muted}>
                {selectedCommand.category}
              </Text>
            </Box>

            <Box flexDirection="column">
              <Text
                color={inContent ? theme.colors.secondary : theme.colors.muted}
                bold
              >
                Description:
              </Text>
              <Box paddingLeft={2}>
                <Text
                  color={inContent ? theme.colors.text : theme.colors.muted}
                >
                  {selectedCommand.details}
                </Text>
              </Box>
            </Box>

            {selectedCommand.examples && selectedCommand.examples.length > 0 && (
              <Box flexDirection="column" marginTop={1}>
                <Text
                  color={inContent ? theme.colors.warning : theme.colors.muted}
                  bold
                >
                  Examples:
                </Text>
                {selectedCommand.examples.map((example, i) => (
                  <Box key={i} paddingLeft={2}>
                    <Text
                      color={inContent ? theme.colors.accent : theme.colors.muted}
                    >
                      {example}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
