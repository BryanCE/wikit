import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { getPages } from "@/commands/listPages";
import { type Page } from "@/types";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";

interface PageBrowserProps {
  instance?: string;
  onPageSelect?: (page: Page) => void;
  searchQuery?: string;
  refreshTrigger?: number; // Used to trigger refresh from parent
  disabled?: boolean; // Disable input when other menus are open
  onEscape?: () => void; // Callback when escape is pressed
}

export function PageBrowser({
  instance,
  onPageSelect,
  searchQuery,
  refreshTrigger,
  disabled,
  onEscape,
}: PageBrowserProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  // Filter pages based on search query
  const filteredPages = searchQuery
    ? pages.filter(
        (page) =>
          page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pages;

  // Set header
  useHeaderData({
    title: "Browse Pages",
    metadata: loading
      ? "Loading..."
      : `${filteredPages.length} pages${
          searchQuery ? ` (filtered from ${pages.length})` : ""
        }`,
  });

  // Set footer help
  useFooterHelp("↑↓=navigate • Enter=view details • Esc=back");

  // Register escape handler
  useEscape("PageBrowser", () => {
    if (onEscape) {
      onEscape();
    }
  });

  useEffect(() => {
    void loadPages();
  }, [instance, refreshTrigger]);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);

      const pages = await getPages("", {
        instance,
        recursive: true,
        limit: 500,
      });

      setPages(pages);
      setSelectedIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useInput((input, key) => {
    if ((disabled ?? false) || loading || filteredPages.length === 0) return;

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(filteredPages.length - 1, prev + 1));
    } else if (key.return) {
      if (onPageSelect && filteredPages[selectedIndex]) {
        onPageSelect(filteredPages[selectedIndex]);
      }
    }
  });

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

  if (filteredPages.length === 0) {
    return (
      <Box>
        <Text color={theme.colors.muted}>
          {searchQuery ? `No pages match "${searchQuery}"` : "No pages found"}
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <VirtualizedList
        items={filteredPages}
        selectedIndex={selectedIndex}
        getItemKey={(page) => page.id}
        itemHeight={1}
        renderItem={(page, index, isHighlighted) => {
          const prefix = isHighlighted ? " ► " : "   ";

          return (
            <Box height={1} flexShrink={0}>
              <Text
                color={
                  isHighlighted
                    ? theme.colors.background
                    : page.isPublished
                    ? theme.colors.success
                    : theme.colors.muted
                }
                backgroundColor={
                  isHighlighted ? theme.colors.primary : undefined
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
