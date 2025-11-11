import React from "react";
import { Box, Text } from "ink";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { type Page } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { instanceLabels } from "@/config";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface PageSelectorProps {
  pages: Page[];
  selectedIndex: number;
  markedForCopy: Set<string>;
  targetInstance: string;
}

export function PageSelector({
  pages,
  selectedIndex,
  markedForCopy,
  targetInstance,
}: PageSelectorProps) {
  const { theme } = useTheme();

  useFooterHelp(COMMON_HELP_PATTERNS.MULTI_SELECT);

  return (
    <Box flexDirection="column" width="60%" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Select pages to copy to {instanceLabels[targetInstance]} (
          {pages.length} total)
        </Text>
      </Box>

      <VirtualizedList
        items={pages}
        selectedIndex={selectedIndex}
        getItemKey={(page) => page.id}
        itemHeight={1}
        renderItem={(page, index, isHighlighted) => {
          const isMarked = markedForCopy.has(page.id);

          return (
            <Box height={1} flexShrink={0}>
              <Text
                color={
                  isHighlighted
                    ? "black"
                    : isMarked
                    ? theme.colors.primary
                    : page.isPublished
                    ? theme.colors.success
                    : theme.colors.muted
                }
                backgroundColor={isHighlighted ? "blue" : undefined}
                wrap="truncate"
              >
                {isMarked ? "☑ " : "☐ "}
                {isHighlighted ? " ► " : "   "}
                {page.path} - {page.title}
              </Text>
            </Box>
          );
        }}
      />

      {markedForCopy.size > 0 && (
        <Box marginTop={1}>
          <Text color={theme.colors.primary}>
            {markedForCopy.size} page{markedForCopy.size === 1 ? "" : "s"} marked for copy
          </Text>
        </Box>
      )}
    </Box>
  );
}
