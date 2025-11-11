import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";

export function NoInstanceMessage() {
  const { theme } = useTheme();

  return (
    <Box flexDirection="column">
      <Text color={theme.colors.error}>
        No instance configured. Please run '/config' to set up an instance.
      </Text>
    </Box>
  );
}
