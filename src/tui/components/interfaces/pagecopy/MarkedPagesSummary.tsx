import React from "react";
import { Box, Text } from "ink";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { type Page } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { instanceLabels } from "@/config";

interface MarkedPagesSummaryProps {
  markedPages: Page[];
  markedForCopySize: number;
  targetInstance: string;
}

export function MarkedPagesSummary({
  markedPages,
  markedForCopySize,
  targetInstance,
}: MarkedPagesSummaryProps) {
  const { theme } = useTheme();

  return (
    <Box flexDirection="column" width="40%" paddingLeft={2} flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Marked for copy ({markedForCopySize})
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text color={theme.colors.muted}>
          Target: {instanceLabels[targetInstance] ?? targetInstance}
        </Text>
      </Box>

      {markedPages.length === 0 ? (
        <Text color={theme.colors.muted}>No pages marked for copying</Text>
      ) : (
        <>
          <VirtualizedList
            items={markedPages}
            selectedIndex={-1}
            getItemKey={(page) => page.id}
            itemHeight={1}
            renderItem={(page, index) => (
              <Box height={1} flexShrink={0}>
                <Text color={theme.colors.primary} wrap="truncate">
                  {index + 1}. {page.path}
                </Text>
              </Box>
            )}
          />
        </>
      )}
    </Box>
  );
}
