import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";

interface SyncOption {
  key: string;
  label: string;
  desc: string;
}

interface SyncOptionsProps {
  fromInstance: string;
  toInstance: string;
  selectedOption: number;
  isDryRun: boolean;
  isLoading: boolean;
  options: SyncOption[];
  instanceLabels: Record<string, string>;
}

export function SyncOptions({
  fromInstance,
  toInstance,
  selectedOption,
  isDryRun,
  isLoading,
  options,
  instanceLabels,
}: SyncOptionsProps) {
  const { theme } = useTheme();

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          🔄 Sync Configurations
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.secondary}>
          Syncing {instanceLabels[fromInstance]} → {instanceLabels[toInstance]}
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {options.map((option, index) => (
          <Box key={option.key} marginBottom={1}>
            <Text
              color={
                selectedOption === index
                  ? theme.colors.highlight
                  : theme.colors.text
              }
            >
              {selectedOption === index ? "▶ " : "  "}
              {option.label}
            </Text>
            <Box marginLeft={2}>
              <Text color={theme.colors.muted}>- {option.desc}</Text>
            </Box>
          </Box>
        ))}
      </Box>

      <Box marginBottom={1}>
        <Text color={isDryRun ? theme.colors.warning : theme.colors.error}>
          Mode:{" "}
          {isDryRun
            ? "🔍 Dry Run (preview only)"
            : "⚡ Live Sync (will make changes)"}
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text color={theme.colors.muted}>
          {isLoading
            ? "⏳ Syncing..."
            : `↑↓=navigate • Enter=select • Esc=return`}
        </Text>
      </Box>
    </Box>
  );
}
