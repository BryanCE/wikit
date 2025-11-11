import React from "react";
import { Box, Text } from "ink";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { type NavigationItem } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";

interface MarkedNavItemsProps {
  markedItems: NavigationItem[];
  markedForDeletionSize: number;
}

export function MarkedNavItems({
  markedItems,
  markedForDeletionSize,
}: MarkedNavItemsProps) {
  const { theme } = useTheme();

  return (
    <Box flexDirection="column" width="40%" paddingLeft={2} flexGrow={1}>
      <Box marginBottom={1} flexShrink={0}>
        <Text color={theme.colors.error} bold>
          Marked for deletion ({markedForDeletionSize})
        </Text>
      </Box>

      {markedItems.length === 0 ? (
        <Box flexShrink={0}>
          <Text color={theme.colors.muted}>No items marked for deletion</Text>
        </Box>
      ) : (
        <VirtualizedList
          items={markedItems}
          selectedIndex={-1}
          getItemKey={(item) => item.id}
          itemHeight={1}
          renderItem={(item, index) => (
            <Box height={1} flexShrink={0}>
              <Text color={theme.colors.error} wrap="truncate">
                {index + 1}. {item.label ?? item.id}
              </Text>
            </Box>
          )}
        />
      )}
    </Box>
  );
}
