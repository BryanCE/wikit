import React, { useEffect } from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { Button } from "@comps/ui/Button";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { OrphanAnalysisResult, Page } from "@/types";

interface OrphanedTabProps {
  inContent: boolean;
  // Form state
  focusArea: "button" | "results";
  isFetching: boolean;
  error: string | null;
  // Results state
  orphanResult: OrphanAnalysisResult | null;
  resultsSelectedIndex: number;
  selectedPage: Page | undefined;
  // Setters
  setSelectedPage: (value: Page | undefined) => void;
  // Callbacks
  onPageSelect?: (page: Page) => void;
}

export function OrphanedTab({
  inContent,
  focusArea,
  isFetching,
  error,
  orphanResult,
  resultsSelectedIndex,
  setSelectedPage,
}: OrphanedTabProps) {
  const { theme } = useTheme();

  // Update selected page when results index changes
  useEffect(() => {
    if (orphanResult && orphanResult.orphanedPages[resultsSelectedIndex]) {
      setSelectedPage(orphanResult.orphanedPages[resultsSelectedIndex].page);
    }
  }, [resultsSelectedIndex, orphanResult, setSelectedPage]);

  // Show results if we have them
  if (orphanResult) {
    const items = orphanResult.orphanedPages.map((orphan) => ({
      ...orphan,
      isSelectable: true,
    }));

    return (
      <Box flexDirection="column" flexGrow={1}>
        <Box marginBottom={1} paddingX={1}>
          <Text color={!inContent ? theme.colors.muted : theme.colors.success} bold={inContent}>
            Orphaned Pages: {orphanResult.orphanedPages.length} / {orphanResult.totalPages} total pages
          </Text>
        </Box>

        {orphanResult.orphanedPages.length === 0 ? (
          <Box paddingX={1}>
            <Text color={theme.colors.success}>No orphaned pages found! All pages have incoming links.</Text>
          </Box>
        ) : (
          <Box flexGrow={1} flexDirection="column">
            <VirtualizedList
              items={items}
              selectedIndex={resultsSelectedIndex}
              getItemKey={(item, index) => `orphan-${item.page.id}-${index}`}
              itemHeight={1}
              renderItem={(orphan, index, isHighlighted) => {
                const prefix = isHighlighted && inContent ? " ► " : "   ";
                const statusIcon = orphan.reason === "published_no_links" ? "!" : "i";

                const textColor = !inContent
                  ? theme.colors.muted
                  : isHighlighted
                  ? theme.colors.background
                  : orphan.reason === "published_no_links"
                  ? theme.colors.primary
                  : theme.colors.accent;

                const text = `${prefix}[${statusIcon}] ${orphan.page.path} - ${orphan.page.title} (${orphan.outgoingLinkCount} outgoing)`;

                return (
                  <Box height={1} flexShrink={0}>
                    <Text
                      color={textColor}
                      backgroundColor={isHighlighted && inContent ? theme.colors.primary : undefined}
                      bold={isHighlighted && inContent}
                    >
                      {text}
                    </Text>
                  </Box>
                );
              }}
            />
          </Box>
        )}
      </Box>
    );
  }

  // Show form
  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.accent}>Find Orphaned Pages</Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.muted}>
          Fetches all pages and their links to find pages with NO incoming links from anywhere on the site.
        </Text>
      </Box>

      {error && (
        <Box marginBottom={1}>
          <Text color={theme.colors.danger}>[ERROR] {error}</Text>
        </Box>
      )}

      {/* Button */}
      <Box>
        <Button
          label={isFetching ? "Fetching..." : "Fetch & Analyze"}
          isSelected={inContent && focusArea === "button"}
          variant="success"
          disabled={!inContent || isFetching}
        />
      </Box>
    </Box>
  );
}
