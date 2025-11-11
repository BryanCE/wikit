import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { SearchBar } from "@comps/ui/SearchBar";
import type { Page } from "@/types";

interface AllPagesTabProps {
  pages: Page[];
  selectedIndex: number;
  loading: boolean;
  error: string | null;
  inPagesContent: boolean;
  searchQuery?: string;
  isSearchActive?: boolean;
  totalCount?: number;
}

export function AllPagesTab({
  pages,
  selectedIndex,
  loading,
  error,
  inPagesContent,
  searchQuery = "",
  isSearchActive = false,
  totalCount,
}: AllPagesTabProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <Box>
        <Text color={theme.colors.warning}>Loading pages...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color={theme.colors.error}>Error: {error}</Text>
      </Box>
    );
  }

  const hasSearch = searchQuery.trim().length > 0;
  const resultCount = hasSearch ? pages.length : undefined;
  const total = totalCount ?? pages.length;

  if (pages.length === 0 && hasSearch) {
    return (
      <Box flexDirection="column" flexGrow={1}>
        <SearchBar
          query={searchQuery}
          isActive={isSearchActive}
          placeholder="Press 's' to search pages (title, path...)"
          resultCount={resultCount}
          totalCount={total}
        />
        <Box padding={1}>
          <Text color={theme.colors.warning}>No pages match your search</Text>
        </Box>
      </Box>
    );
  }

  if (pages.length === 0) {
    return (
      <Box>
        <Text color={theme.colors.muted}>No pages found</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <SearchBar
        query={searchQuery}
        isActive={isSearchActive}
        placeholder="Press 's' to search pages (title, path...)"
        resultCount={resultCount}
        totalCount={hasSearch ? total : undefined}
      />
      <VirtualizedList
        items={pages}
        selectedIndex={selectedIndex}
        getItemKey={(page) => page.id}
        itemHeight={1}
        renderItem={(page, index, isHighlighted) => {
          const prefix = isHighlighted && inPagesContent ? " ► " : "   ";

          // Muted when not in content, normal colors when in content
          const textColor = !inPagesContent
            ? theme.colors.muted
            : isHighlighted
            ? theme.colors.background
            : page.isPublished
            ? theme.colors.success
            : theme.colors.muted;

          return (
            <Box height={1} flexShrink={0}>
              <Text
                color={textColor}
                backgroundColor={
                  isHighlighted && inPagesContent ? theme.colors.primary : undefined
                }
                wrap="truncate"
              >
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
