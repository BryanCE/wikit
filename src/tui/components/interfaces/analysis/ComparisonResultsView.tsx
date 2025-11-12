import React, { useEffect, useMemo } from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { ExportDiffResult, Page } from "@/types";

interface ComparisonResultsViewProps {
  result: ExportDiffResult;
  inContent: boolean;
  selectedIndex: number;
  onSelectedPageChange?: (page: Page | undefined) => void;
}

interface DisplayItem {
  type: "header" | "summary" | "change" | "spacer";
  changeType?: "added" | "removed" | "modified";
  text: string;
  color?: string;
  page?: Page;
}

export function ComparisonResultsView({
  result,
  inContent,
  selectedIndex,
  onSelectedPageChange,
}: ComparisonResultsViewProps) {
  const { theme } = useTheme();

  // Set footer help text - always show when results are displayed
  useFooterHelp("Tab/1-2=switch tabs • ↑↓=navigate • Enter=view page • Esc=back");
  useFooterStatus(`Compared: ${new Date(result.comparedAt).toLocaleString()}`);

  const items = useMemo(() => {
    const itemsArray: DisplayItem[] = [];

  // Summary Section
  itemsArray.push({
    type: "header",
    text: "=== COMPARISON SUMMARY ===",
    color: theme.colors.primary,
  });

  itemsArray.push({
    type: "summary",
    text: `Total Changes: ${result.summary.totalChanges}`,
    color: theme.colors.accent,
  });

  itemsArray.push({
    type: "summary",
    text: `  Page Changes: ${result.summary.pageChanges}`,
    color: theme.colors.text,
  });

  itemsArray.push({
    type: "summary",
    text: `  Navigation Changes: ${result.summary.navChanges}`,
    color: theme.colors.text,
  });

  // Pages Added Section
  if (result.pagesAdded.length > 0) {
    itemsArray.push({ type: "spacer", text: "" });
    itemsArray.push({
      type: "header",
      text: `=== PAGES ADDED (${result.pagesAdded.length}) ===`,
      color: theme.colors.primary,
    });

    for (const page of result.pagesAdded) {
      itemsArray.push({
        type: "change",
        changeType: "added",
        text: `  + ${page.path} - ${page.title}`,
        color: theme.colors.success,
        page,
      });
    }
  }

  // Pages Removed Section
  if (result.pagesRemoved.length > 0) {
    itemsArray.push({ type: "spacer", text: "" });
    itemsArray.push({
      type: "header",
      text: `=== PAGES REMOVED (${result.pagesRemoved.length}) ===`,
      color: theme.colors.primary,
    });

    for (const page of result.pagesRemoved) {
      itemsArray.push({
        type: "change",
        changeType: "removed",
        text: `  - ${page.path} - ${page.title}`,
        color: theme.colors.error,
        page,
      });
    }
  }

  // Pages Modified Section
  if (result.pagesModified.length > 0) {
    itemsArray.push({ type: "spacer", text: "" });
    itemsArray.push({
      type: "header",
      text: `=== PAGES MODIFIED (${result.pagesModified.length}) ===`,
      color: theme.colors.primary,
    });

    for (const mod of result.pagesModified) {
      itemsArray.push({
        type: "change",
        changeType: "modified",
        text: `  ~ ${mod.after.path} (${mod.changes.join(", ")})`,
        color: theme.colors.warning,
        page: mod.after,
      });

      for (const change of mod.changes) {
        if (change === "title") {
          itemsArray.push({
            type: "change",
            text: `      Title: "${mod.before.title}" -> "${mod.after.title}"`,
            color: theme.colors.muted,
          });
        } else if (change === "path") {
          itemsArray.push({
            type: "change",
            text: `      Path: "${mod.before.path}" -> "${mod.after.path}"`,
            color: theme.colors.muted,
          });
        } else if (change === "isPublished") {
          itemsArray.push({
            type: "change",
            text: `      Published: ${mod.before.isPublished} -> ${mod.after.isPublished}`,
            color: theme.colors.muted,
          });
        }
      }
    }
  }

  // Nav Items Added Section
  if (result.navItemsAdded.length > 0) {
    itemsArray.push({ type: "spacer", text: "" });
    itemsArray.push({
      type: "header",
      text: `=== NAVIGATION ITEMS ADDED (${result.navItemsAdded.length}) ===`,
      color: theme.colors.primary,
    });

    for (const nav of result.navItemsAdded) {
      itemsArray.push({
        type: "change",
        changeType: "added",
        text: `  + [${nav.kind}] ${nav.label ?? "(no label)"} ${nav.target ? `-> ${nav.target}` : ""}`,
        color: theme.colors.success,
      });
    }
  }

  // Nav Items Removed Section
  if (result.navItemsRemoved.length > 0) {
    itemsArray.push({ type: "spacer", text: "" });
    itemsArray.push({
      type: "header",
      text: `=== NAVIGATION ITEMS REMOVED (${result.navItemsRemoved.length}) ===`,
      color: theme.colors.primary,
    });

    for (const nav of result.navItemsRemoved) {
      itemsArray.push({
        type: "change",
        changeType: "removed",
        text: `  - [${nav.kind}] ${nav.label ?? "(no label)"} ${nav.target ? `-> ${nav.target}` : ""}`,
        color: theme.colors.error,
      });
    }
  }

  // Nav Items Modified Section
  if (result.navItemsModified.length > 0) {
    itemsArray.push({ type: "spacer", text: "" });
    itemsArray.push({
      type: "header",
      text: `=== NAVIGATION ITEMS MODIFIED (${result.navItemsModified.length}) ===`,
      color: theme.colors.primary,
    });

    for (const mod of result.navItemsModified) {
      itemsArray.push({
        type: "change",
        changeType: "modified",
        text: `  ~ [${mod.after.kind}] ${mod.after.label ?? "(no label)"} (${mod.changes.join(", ")})`,
        color: theme.colors.warning,
      });
    }
  }

  if (result.summary.totalChanges === 0) {
    itemsArray.push({ type: "spacer", text: "" });
    itemsArray.push({
      type: "summary",
      text: "No changes detected between exports.",
      color: theme.colors.success,
    });
  }

    return itemsArray;
  }, [result, theme]);

  // Notify parent of selected page whenever selection changes
  useEffect(() => {
    if (onSelectedPageChange) {
      onSelectedPageChange(items[selectedIndex]?.page);
    }
  }, [selectedIndex, items, onSelectedPageChange]);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1} paddingX={1}>
        <Text color={!inContent ? theme.colors.muted : theme.colors.success} bold={inContent}>
          Comparison Results
        </Text>
      </Box>

      <Box flexGrow={1} flexDirection="column">
        <VirtualizedList
          items={items}
          selectedIndex={selectedIndex}
          getItemKey={(item, index) => `${item.type}-${index}`}
          itemHeight={1}
          renderItem={(item, index, isHighlighted) => {
            const prefix = inContent && isHighlighted && item.type === "change" ? " ► " : "";
            const fullText = prefix + item.text;
            const shouldTruncate = fullText.length > 100;

            return (
              <Box height={1} flexShrink={0}>
                <Text
                  color={!inContent ? theme.colors.muted : (item.color ?? theme.colors.text)}
                  bold={inContent && (item.type === "header" || isHighlighted)}
                  wrap={shouldTruncate ? "truncate" : undefined}
                >
                  {fullText}
                </Text>
              </Box>
            );
          }}
        />
      </Box>
    </Box>
  );
}
