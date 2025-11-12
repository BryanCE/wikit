import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import Table from "@comps/ui/Table.js";
import type { CompareResults, InstanceDiffResult } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { useTerminalDimensions } from "@/tui/hooks/useTerminalDimensions";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface CompareResultsProps {
  results: CompareResults;
  showDetails: boolean;
}

export function CompareResultsDisplay({
  results,
  showDetails,
}: CompareResultsProps) {
  const { theme } = useTheme();
  const { height } = useTerminalDimensions();
  const [scrollPosition, setScrollPosition] = useState(0);

  useFooterHelp(COMMON_HELP_PATTERNS.LIST);

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "null";
    const maxLength = showDetails ? 100 : 30;

    if (typeof value === "string") {
      if (value.length > maxLength) {
        return value.slice(0, maxLength) + "...";
      }
      // For multiline strings, show only first line in brief mode
      if (!showDetails && value.includes("\n")) {
        return (value.split("\n")[0] ?? "").slice(0, 30) + "...";
      }
      return value;
    }
    if (typeof value === "object") {
      const json = JSON.stringify(value, null, showDetails ? 2 : 0);
      const objMaxLength = showDetails ? 200 : 30;
      if (json.length > objMaxLength) {
        return json.slice(0, objMaxLength) + "...";
      }
      return json;
    }
    const str = JSON.stringify(value);
    if (str.length > maxLength) {
      return str.slice(0, maxLength) + "...";
    }
    return str;
  };

  // Transform results into table format for ink-table
  const getTableData = () => {
    const tableData: Array<{
      field: string;
      [key: string]: string;
    }> = [];

    const resultEntries = Object.entries(results).filter(
      ([key]) => !["instance1Name", "instance2Name"].includes(key)
    );

    const instance1Key = results.instance1Name ?? "Instance 1";
    const instance2Key = results.instance2Name ?? "Instance 2";

    for (const [key, result] of resultEntries as [string, InstanceDiffResult][]) {
      if (!result) continue;

      const category = result.category ?? key;

      if (result.differences && result.differences.length > 0) {
        for (const diff of result.differences) {
          tableData.push({
            field: `${category}: ${diff.field}`,
            [instance1Key]: formatValue(diff.instance1Value),
            [instance2Key]: formatValue(diff.instance2Value),
            isDifferent: diff.isDifferent ? "true" : "false",
          });
        }
      }
    }

    return tableData;
  };

  const tableData = getTableData();

  // Calculate if we need scrolling based on content height
  const viewportHeight = Math.max(3, height - 15); // Standard viewport calculation
  const needsScrolling = tableData.length > viewportHeight;

  useInput((input, key) => {
    if (!needsScrolling) return;

    const maxScroll = Math.max(0, tableData.length - viewportHeight);

    if (key.upArrow) {
      setScrollPosition((prev) => Math.max(0, prev - 1));
      return;
    }
    if (key.downArrow) {
      setScrollPosition((prev) => Math.min(maxScroll, prev + 1));
      return;
    }
    if (key.pageUp) {
      setScrollPosition((prev) => Math.max(0, prev - 10));
      return;
    }
    if (key.pageDown) {
      setScrollPosition((prev) => Math.min(maxScroll, prev + 10));
      return;
    }
  });

  if (needsScrolling) {
    // Generate sticky header and scrollable data separately
    const instance1Name = results.instance1Name ?? "Instance 1";
    const instance2Name = results.instance2Name ?? "Instance 2";
    const maxFieldWidth = Math.max(
      ...tableData.map((row) => row.field.length),
      "Field".length
    );
    const maxInstance1Width = Math.max(
      ...tableData.map((row) => (row[instance1Name] ?? "").length),
      instance1Name.length
    );
    const maxInstance2Width = Math.max(
      ...tableData.map((row) => (row[instance2Name] ?? "").length),
      instance2Name.length
    );

    const headerLine = `${"Field".padEnd(
      maxFieldWidth
    )} | ${instance1Name.padEnd(maxInstance1Width)} | ${instance2Name.padEnd(
      maxInstance2Width
    )}`;
    const separatorLine = "-".repeat(headerLine.length);

    // Generate only the data rows for scrolling
    const dataLines: string[] = [];
    for (const row of tableData) {
      const field = row.field.padEnd(maxFieldWidth);
      const instance1Value = (row[instance1Name] ?? "").padEnd(
        maxInstance1Width
      );
      const instance2Value = (row[instance2Name] ?? "").padEnd(
        maxInstance2Width
      );

      dataLines.push(`${field} | ${instance1Value} | ${instance2Value}`);
    }

    return (
      <Box flexDirection="column">
        {/* Sticky Header */}
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.colors.muted}
          paddingX={1}
          backgroundColor={theme.backgrounds.surface}
        >
          <Text bold color={theme.colors.primary}>
            {headerLine}
          </Text>
          <Text color={theme.colors.muted}>{separatorLine}</Text>
        </Box>

        {/* Scrollable Data with colored rows */}
        <Box
          borderStyle="single"
          borderColor={theme.colors.muted}
          flexDirection="column"
          height={viewportHeight - 5}
          overflow="hidden"
        >
          {tableData
            .slice(scrollPosition, scrollPosition + (viewportHeight - 5))
            .map((row, index) => {
              const isDifferent = row.isDifferent === "true";

              const field = row.field.padEnd(maxFieldWidth);
              const instance1Value = (row[instance1Name] ?? "").padEnd(
                maxInstance1Width
              );
              const instance2Value = (row[instance2Name] ?? "").padEnd(
                maxInstance2Width
              );
              const rowText = `${field} | ${instance1Value} | ${instance2Value}`;

              return (
                <Box key={scrollPosition + index} height={1} paddingX={1}>
                  <Text
                    color={isDifferent ? "#CB3A2A" : "#14710A"}
                    wrap="truncate"
                  >
                    {rowText}
                  </Text>
                </Box>
              );
            })}
        </Box>

      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Professional Table using custom Table component */}
      {tableData.length > 0 ? (
        <Table
          data={tableData}
          columns={[
            "field",
            results.instance1Name ?? "Instance 1",
            results.instance2Name ?? "Instance 2",
          ]}
          padding={2}
          header={({ children }) => (
            <Text bold color={theme.colors.primary}>
              {children}
            </Text>
          )}
          cell={({ children, row }) => {
            const isDifferent = row.isDifferent === "true";

            const color = isDifferent ? "#CB3A2A" : "#14710A";

            return <Text color={color}>{children}</Text>;
          }}
          skeleton={({ children }) => (
            <Text color={theme.colors.muted}>{children}</Text>
          )}
        />
      ) : (
        <Text color={theme.colors.muted}>No data to compare</Text>
      )}

    </Box>
  );
}
