import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";

interface SearchBarProps {
  query: string;
  isActive: boolean;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
}

export function SearchBar({
  query,
  isActive,
  placeholder = "Search...",
  resultCount,
  totalCount,
}: SearchBarProps) {
  const { theme } = useTheme();

  const displayText = query.trim() ? query : placeholder;
  const textColor = query.trim() ? theme.colors.text : theme.colors.muted;
  const borderColor = isActive ? theme.colors.accent : theme.colors.muted;

  return (
    <Box flexDirection="column">
      <Box
        borderStyle="round"
        borderColor={borderColor}
        paddingX={2}
        paddingY={0}
        flexShrink={0}
      >
        <Text color={textColor}>{displayText}</Text>
        {query.trim() && (
          <Text color={theme.colors.muted} dimColor>
            {" "}[clear: Esc]
          </Text>
        )}
      </Box>
      {resultCount !== undefined && totalCount !== undefined && query.trim() && (
        <Box marginLeft={2} marginTop={0}>
          <Text color={theme.colors.info}>
            Showing {resultCount} of {totalCount} results
          </Text>
        </Box>
      )}
    </Box>
  );
}
