import React from "react";
import { Box, Text } from "ink";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { type SyncSummary } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";

interface SyncResultsProps {
  results: SyncSummary;
}

export function SyncResults({ results }: SyncResultsProps) {
  const { theme } = useTheme();

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Sync Results
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text color={theme.colors.secondary}>From: {results.fromInstance}</Text>
        <Text color={theme.colors.secondary}>To: {results.toInstance}</Text>
        <Text color={theme.colors.secondary}>
          Mode: {results.dryRun ? "Dry Run" : "Live Sync"}
        </Text>
      </Box>

      <VirtualizedList
        items={results.results}
        selectedIndex={-1}
        getItemKey={(_, index) => String(index)}
        itemHeight={3}
        renderItem={(result) => {
          const icon = result.success ? "[OK]" : "[FAIL]";
          return (
            <Box height={3} flexShrink={0} flexDirection="column">
              <Text
                color={
                  result.success ? theme.colors.success : theme.colors.error
                }
              >
                {icon} {result.category}: {result.message}
              </Text>
              {result.changes && Object.keys(result.changes).length > 0 && (
                <Box flexDirection="column" marginLeft={2}>
                  {Object.entries(result.changes)
                    .slice(0, 3)
                    .map(
                      ([field, change]: [
                        string,
                        { from: unknown; to: unknown }
                      ]) => (
                        <Text key={field} color={theme.colors.text}>
                          {field}: "{String(change.from)}" to "
                          {String(change.to)}"
                        </Text>
                      )
                    )}
                  {Object.keys(result.changes).length > 3 && (
                    <Text color={theme.colors.muted}>
                      ... and {Object.keys(result.changes).length - 3} more
                      changes
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          );
        }}
      />

      <Box marginTop={1}>
        <Text color={theme.colors.muted}>
          Press 'r' to run another sync, Esc to return
        </Text>
      </Box>
    </Box>
  );
}
