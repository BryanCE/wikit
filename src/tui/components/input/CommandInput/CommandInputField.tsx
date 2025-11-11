import React from "react";
import { Box, Text } from "ink";
import type { Theme } from "@/tui/theme";
import type { FocusMode } from "@/types";

interface CommandInputFieldProps {
  input: string;
  focusMode: FocusMode;
  theme: Theme;
}

export function CommandInputField({
  input,
  focusMode,
  theme,
}: CommandInputFieldProps) {
  return (
    <Box flexDirection="column" width="70%">
      {/* Command Input */}
      <Box
        borderStyle={focusMode === "input" ? "round" : "single"}
        borderColor={
          focusMode === "input" ? theme.colors.primary : theme.colors.muted
        }
        backgroundColor={theme.backgrounds.surface}
        padding={1}
      >
        <Text color={theme.colors.success} bold>
          &gt;{" "}
        </Text>
        <Text>{input}</Text>
        <Text
          color={
            focusMode === "input" ? theme.colors.primary : theme.colors.muted
          }
        >
          █
        </Text>
      </Box>
    </Box>
  );
}
