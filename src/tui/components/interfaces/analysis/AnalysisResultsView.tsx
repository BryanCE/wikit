import React, { useEffect, useMemo } from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { AnalysisResult, Page } from "@/types";

interface AnalysisResultsViewProps {
  result: AnalysisResult;
  inContent: boolean;
  selectedIndex: number;
  instance?: string;
  onSelectedPageChange?: (page: Page | undefined) => void;
}

interface DisplayItem {
  type: "header" | "summary" | "issue" | "spacer";
  category?: string;
  text: string;
  color?: string;
  page?: Page; // Associated page for items that have one
}

export function AnalysisResultsView({
  result,
  inContent,
  selectedIndex,
  onSelectedPageChange,
}: AnalysisResultsViewProps) {
  const { theme } = useTheme();

  // Set footer help text - always show when results are displayed
  useFooterHelp(
    "Tab/1-2=switch tabs • ↑↓=navigate • Enter=view page • Esc=back"
  );
  useFooterStatus(`Analyzed: ${new Date(result.analyzedAt).toLocaleString()}`);

  const items = useMemo(() => {
    const itemsArray: DisplayItem[] = [];

    // Health Score Section
    itemsArray.push({
      type: "header",
      text: "=== HEALTH SCORE ===",
      color: theme.colors.primary,
    });

    const scoreColor =
      result.healthScore.percentage >= 80
        ? theme.colors.success
        : result.healthScore.percentage >= 50
        ? theme.colors.warning
        : theme.colors.error;

    itemsArray.push({
      type: "summary",
      text: `Score: ${result.healthScore.score}/${
        result.healthScore.maxScore
      } (${result.healthScore.percentage.toFixed(2)}%)`,
      color: scoreColor,
    });

    for (const issue of result.healthScore.issues) {
      const severityColor =
        issue.severity === "critical"
          ? theme.colors.error
          : issue.severity === "warning"
          ? theme.colors.warning
          : theme.colors.accent;

      itemsArray.push({
        type: "issue",
        text: `  [${issue.severity.toUpperCase()}] ${issue.category}: ${
          issue.count
        } (${issue.points} points)`,
        color: severityColor,
      });
    }

    // Navigation Coverage Section
    itemsArray.push({ type: "spacer", text: "" });
    itemsArray.push({
      type: "header",
      text: "=== NAVIGATION COVERAGE ===",
      color: theme.colors.primary,
    });

    itemsArray.push({
      type: "summary",
      text: `Total Pages: ${result.navigationCoverage.totalPages}`,
      color: theme.colors.text,
    });

    itemsArray.push({
      type: "summary",
      text: `Pages in Navigation: ${result.navigationCoverage.pagesInNavigation}`,
      color: theme.colors.success,
    });

    itemsArray.push({
      type: "summary",
      text: `Pages NOT in Navigation: ${result.navigationCoverage.pagesNotInNavigation}`,
      color:
        result.navigationCoverage.pagesNotInNavigation > 0
          ? theme.colors.warning
          : theme.colors.success,
    });

    itemsArray.push({
      type: "summary",
      text: `Coverage: ${result.navigationCoverage.coveragePercentage.toFixed(
        2
      )}%`,
      color: theme.colors.accent,
    });

    // Unlisted Pages Section (pages not in navigation)
    if (result.unlistedPages.length > 0) {
      itemsArray.push({ type: "spacer", text: "" });
      itemsArray.push({
        type: "header",
        text: `=== UNLISTED PAGES (${result.unlistedPages.length}) ===`,
        color: theme.colors.primary,
      });

      for (const unlisted of result.unlistedPages) {
        itemsArray.push({
          type: "issue",
          category: unlisted.reason,
          text: `  ${unlisted.page.path} - ${unlisted.page.title}`,
          color: theme.colors.warning,
          page: unlisted.page,
        });
      }
    }

    // Broken Nav Links Section
    if (result.brokenNavLinks.length > 0) {
      itemsArray.push({ type: "spacer", text: "" });
      itemsArray.push({
        type: "header",
        text: `=== BROKEN NAVIGATION LINKS (${result.brokenNavLinks.length}) ===`,
        color: theme.colors.primary,
      });

      for (const broken of result.brokenNavLinks) {
        itemsArray.push({
          type: "issue",
          category: broken.reason,
          text: `  [${broken.reason}] ${
            broken.navItem.label ?? "(no label)"
          } -> ${broken.target}`,
          color: theme.colors.error,
        });
      }
    }

    // Title Inconsistencies Section
    if (result.titleInconsistencies.length > 0) {
      itemsArray.push({ type: "spacer", text: "" });
      itemsArray.push({
        type: "header",
        text: `=== TITLE INCONSISTENCIES (${result.titleInconsistencies.length}) ===`,
        color: theme.colors.primary,
      });

      for (const inconsistency of result.titleInconsistencies) {
        itemsArray.push({
          type: "issue",
          text: `  ${inconsistency.page.path}: "${inconsistency.pageTitle}" vs "${inconsistency.navLabel}"`,
          color: theme.colors.accent,
          page: inconsistency.page,
        });
      }
    }

    // Duplicate Paths Section
    if (result.duplicatePaths.length > 0) {
      itemsArray.push({ type: "spacer", text: "" });
      itemsArray.push({
        type: "header",
        text: `=== DUPLICATE PATHS (${result.duplicatePaths.length}) ===`,
        color: theme.colors.primary,
      });

      for (const duplicate of result.duplicatePaths) {
        itemsArray.push({
          type: "issue",
          text: `  Duplicate: ${duplicate.paths.join(", ")}`,
          color: theme.colors.error,
        });
      }
    }

    // Visibility Analysis Section
    itemsArray.push({ type: "spacer", text: "" });
    itemsArray.push({
      type: "header",
      text: "=== VISIBILITY ANALYSIS ===",
      color: theme.colors.primary,
    });

    itemsArray.push({
      type: "summary",
      text: `Public Pages: ${result.visibilityAnalysis.publicPages}`,
      color: theme.colors.text,
    });

    itemsArray.push({
      type: "summary",
      text: `Restricted Pages: ${result.visibilityAnalysis.restrictedPages}`,
      color: theme.colors.text,
    });

    const groups = Object.keys(result.visibilityAnalysis.pagesByGroup);
    if (groups.length > 0) {
      for (const groupKey of groups) {
        const pages = result.visibilityAnalysis.pagesByGroup[groupKey];
        if (pages && pages.length > 0) {
          itemsArray.push({
            type: "summary",
            text: `  ${groupKey}: ${pages.length} page(s)`,
            color: theme.colors.accent,
          });
          // Show each page in the group
          for (const page of pages) {
            itemsArray.push({
              type: "issue",
              text: `    • ${page.path}`,
              color: theme.colors.muted,
              page,
            });
          }
        }
      }
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
        <Text
          color={!inContent ? theme.colors.muted : theme.colors.success}
          bold={inContent}
        >
          Analysis Results
        </Text>
      </Box>

      <Box flexGrow={1} flexDirection="column">
        <VirtualizedList
          items={items}
          selectedIndex={selectedIndex}
          getItemKey={(item, index) => `${item.type}-${index}`}
          itemHeight={1}
          renderItem={(item, index, isHighlighted) => {
            const prefix =
              inContent && isHighlighted && item.type === "issue" ? " ► " : "";
            const fullText = prefix + item.text;
            const shouldTruncate = fullText.length > 100;

            return (
              <Box height={1} flexShrink={0}>
                <Text
                  color={
                    !inContent
                      ? theme.colors.muted
                      : item.color ?? theme.colors.text
                  }
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
