import React from "react";
import { Box, Text } from "ink";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { type Page } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface DeletePageSelectorProps {
  pages: Page[];
  selectedIndex: number;
  markedForDeletion: Set<string>;
  inDeleteContent: boolean;
}

export function DeletePageSelector({
  pages,
  selectedIndex,
  markedForDeletion,
  inDeleteContent,
}: DeletePageSelectorProps) {
  const { theme } = useTheme();

  useFooterHelp(COMMON_HELP_PATTERNS.MULTI_SELECT);

  return (
    <Box flexDirection="column" width="60%" flexGrow={1}>
      <Box marginBottom={1} flexShrink={0}>
        <Text color={theme.colors.primary} bold>
          Select pages to delete ({pages.length} total)
        </Text>
      </Box>

      <VirtualizedList
        items={pages}
        selectedIndex={selectedIndex}
        getItemKey={(page) => page.id}
        itemHeight={1}
        renderItem={(page, index, isHighlighted) => {
          const isMarked = markedForDeletion.has(page.id);
          const prefix = isHighlighted && inDeleteContent ? " ► " : "   ";

          // Muted when not in content, normal colors when in content
          const textColor = !inDeleteContent
            ? theme.colors.muted
            : isHighlighted
            ? theme.colors.background
            : isMarked
            ? theme.colors.error
            : page.isPublished
            ? theme.colors.success
            : theme.colors.muted;

          return (
            <Box height={1} flexShrink={0}>
              <Text
                color={textColor}
                backgroundColor={
                  isHighlighted && inDeleteContent ? theme.colors.primary : undefined
                }
                wrap="truncate"
              >
                {isMarked ? "☑ " : "☐ "}
                {prefix}
                {page.path} - {page.title}
              </Text>
            </Box>
          );
        }}
      />
    </Box>
  );
}
