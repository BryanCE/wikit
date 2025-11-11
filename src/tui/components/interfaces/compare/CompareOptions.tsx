import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useTerminalDimensions } from "@/tui/hooks/useTerminalDimensions";

interface CompareOption {
  key: string;
  label: string;
  desc: string;
}

interface CompareOptionsProps {
  selectedOption: number;
  isLoading: boolean;
  options: CompareOption[];
}

export function CompareOptions({
  selectedOption,
  isLoading,
  options,
}: CompareOptionsProps) {
  const { theme } = useTheme();
  const { width } = useTerminalDimensions();

  return (
    <Box flexDirection="column">
      {options.map((option, index) => (
        <Box key={option.key} flexDirection="row" marginBottom={1}>
          <Box width={Math.floor(width * 0.4)}>
            <Text
              color={
                selectedOption === index
                  ? theme.colors.highlight
                  : theme.colors.text
              }
              wrap="truncate"
            >
              {selectedOption === index ? "▶ " : "  "}
              {option.label}
            </Text>
          </Box>
          <Box width={Math.floor(width * 0.5)}>
            <Text color={theme.colors.muted} wrap="truncate">
              - {option.desc}
            </Text>
          </Box>
        </Box>
      ))}

      <Box marginTop={1}>
        <Text color={theme.colors.muted}>
          {isLoading
            ? "Comparing..."
            : "↑↓ Select • Enter to compare • Esc to return"}
        </Text>
      </Box>
    </Box>
  );
}
