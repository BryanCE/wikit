import React from "react";
import { Box, Text } from "ink";
import { type Page } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { SearchBar } from "@comps/ui/SearchBar";
import { DeletePageSelector } from "../delete/DeletePageSelector";
import { MarkedPagesForDeletion } from "../delete/MarkedPagesForDeletion";

interface DeleteTabProps {
  pages: Page[];
  selectedIndex: number;
  markedForDeletion: Set<string>;
  loading: boolean;
  error: string | null;
  inDeleteContent: boolean;
  searchQuery?: string;
  isSearchActive?: boolean;
  totalCount?: number;
}

export function DeleteTab({
  pages,
  selectedIndex,
  markedForDeletion,
  loading,
  error,
  inDeleteContent,
  searchQuery = "",
  isSearchActive = false,
  totalCount,
}: DeleteTabProps) {
  const { theme } = useTheme();
  const hasSearch = searchQuery.trim().length > 0;
  const resultCount = hasSearch ? pages.length : undefined;
  const total = totalCount ?? pages.length;

  if (loading) {
    return (
      <Box padding={1}>
        <Text color={theme.colors.warning}>Loading pages...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding={1}>
        <Text color={theme.colors.error}>Error: {error}</Text>
      </Box>
    );
  }

  const markedPages = pages.filter((p) => markedForDeletion.has(p.id));

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

  return (
    <Box flexDirection="column" flexGrow={1}>
      <SearchBar
        query={searchQuery}
        isActive={isSearchActive}
        placeholder="Press 's' to search pages (title, path...)"
        resultCount={resultCount}
        totalCount={hasSearch ? total : undefined}
      />
      <Box flexDirection="row" flexGrow={1}>
        <DeletePageSelector
          pages={pages}
          selectedIndex={selectedIndex}
          markedForDeletion={markedForDeletion}
          inDeleteContent={inDeleteContent}
        />

        <MarkedPagesForDeletion
          markedPages={markedPages}
          markedForDeletionSize={markedForDeletion.size}
        />
      </Box>
    </Box>
  );
}
