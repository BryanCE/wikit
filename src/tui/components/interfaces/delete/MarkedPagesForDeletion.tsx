import React from "react";
import { Box, Text } from "ink";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { type Page } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";

interface MarkedPagesForDeletionProps {
  markedPages: Page[];
  markedForDeletionSize: number;
}

export function MarkedPagesForDeletion({
  markedPages,
  markedForDeletionSize,
}: MarkedPagesForDeletionProps) {
  const { theme } = useTheme();

  return (
    <Box flexDirection="column" width="40%" paddingLeft={2} flexGrow={1}>
      <Box marginBottom={1} flexShrink={0}>
        <Text color={theme.colors.error} bold>
          Marked for deletion ({markedForDeletionSize})
        </Text>
      </Box>

      {markedPages.length === 0 ? (
        <Box flexShrink={0}>
          <Text color={theme.colors.muted}>No pages marked for deletion</Text>
        </Box>
      ) : (
        <VirtualizedList
          items={markedPages}
          selectedIndex={-1}
          getItemKey={(page) => page.id}
          itemHeight={1}
          renderItem={(page, index) => (
            <Box height={1} flexShrink={0}>
              <Text color={theme.colors.error} wrap="truncate">
                {index + 1}. {page.path}
              </Text>
            </Box>
          )}
        />
      )}
    </Box>
  );
}
