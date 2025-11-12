import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { FileBrowserModal } from "@comps/modals/FileBrowserModal/FileBrowserModal";
import { ComparisonResultsView } from "./ComparisonResultsView";
import { Button } from "@comps/ui/Button";
import type { ExportDiffResult, Page } from "@/types";

interface CompareTabProps {
  inContent: boolean;
  // Form state
  oldPagesPath: string;
  newPagesPath: string;
  oldNavPath: string;
  newNavPath: string;
  currentField: number;
  focusArea: "fields" | "buttons";
  selectedButton: "compare" | "cancel";
  showFileBrowser: boolean;
  browserField: 0 | 1 | 2 | 3;
  isComparing: boolean;
  error: string | null;
  // Results state
  comparisonResult: ExportDiffResult | null;
  resultsSelectedIndex: number;
  selectedPage: Page | undefined;
  // Setters
  setOldPagesPath: (value: string) => void;
  setNewPagesPath: (value: string) => void;
  setOldNavPath: (value: string) => void;
  setNewNavPath: (value: string) => void;
  setBrowserField: (value: 0 | 1 | 2 | 3) => void;
  setShowFileBrowser: (value: boolean) => void;
  setSelectedPage: (value: Page | undefined) => void;
  // Callbacks
  onPageSelect?: (page: Page) => void;
}

export function CompareTab({
  inContent,
  oldPagesPath,
  newPagesPath,
  oldNavPath,
  newNavPath,
  currentField,
  focusArea,
  selectedButton,
  showFileBrowser,
  browserField,
  isComparing,
  error,
  comparisonResult,
  resultsSelectedIndex,
  setOldPagesPath,
  setNewPagesPath,
  setOldNavPath,
  setNewNavPath,
  setShowFileBrowser,
  setSelectedPage,
}: CompareTabProps) {
  const { theme } = useTheme();

  const handleFileSelected = (selectedPath: string) => {
    switch (browserField) {
      case 0:
        setOldPagesPath(selectedPath);
        break;
      case 1:
        setNewPagesPath(selectedPath);
        break;
      case 2:
        setOldNavPath(selectedPath);
        break;
      case 3:
        setNewNavPath(selectedPath);
        break;
    }
    setShowFileBrowser(false);
  };

  if (showFileBrowser) {
    const titles = [
      "Select Old Pages Export",
      "Select New Pages Export",
      "Select Old Navigation Export",
      "Select New Navigation Export",
    ];

    return (
      <FileBrowserModal
        title={titles[browserField] ?? "Select File"}
        initialPath="."
        mode="file"
        allowedExtensions={[".json"]}
        onSelect={handleFileSelected}
        onCancel={() => setShowFileBrowser(false)}
      />
    );
  }

  if (comparisonResult) {
    return (
      <ComparisonResultsView
        result={comparisonResult}
        inContent={inContent}
        selectedIndex={resultsSelectedIndex}
        onSelectedPageChange={setSelectedPage}
      />
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.accent}>
          Compare Two Wiki.js Export Snapshots
        </Text>
      </Box>

      {error && (
        <Box marginBottom={1}>
          <Text color={theme.colors.error}>[ERROR] {error}</Text>
        </Box>
      )}

      {/* Fields */}
      <Box flexDirection="column" marginBottom={1}>
        <Box marginBottom={1}>
          <Text
            color={
              !inContent
                ? theme.colors.muted
                : focusArea === "fields" && currentField === 0
                ? theme.colors.primary
                : theme.colors.text
            }
            bold={inContent && focusArea === "fields" && currentField === 0}
          >
            {inContent && focusArea === "fields" && currentField === 0
              ? " ► "
              : "   "}
            Old Pages Export: {oldPagesPath || "(not selected)"}
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text
            color={
              !inContent
                ? theme.colors.muted
                : focusArea === "fields" && currentField === 1
                ? theme.colors.primary
                : theme.colors.text
            }
            bold={inContent && focusArea === "fields" && currentField === 1}
          >
            {inContent && focusArea === "fields" && currentField === 1
              ? " ► "
              : "   "}
            New Pages Export: {newPagesPath || "(not selected)"}
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text
            color={
              !inContent
                ? theme.colors.muted
                : focusArea === "fields" && currentField === 2
                ? theme.colors.primary
                : theme.colors.text
            }
            bold={inContent && focusArea === "fields" && currentField === 2}
          >
            {inContent && focusArea === "fields" && currentField === 2
              ? " ► "
              : "   "}
            Old Navigation Export: {oldNavPath || "(not selected)"}
          </Text>
        </Box>

        <Box>
          <Text
            color={
              !inContent
                ? theme.colors.muted
                : focusArea === "fields" && currentField === 3
                ? theme.colors.primary
                : theme.colors.text
            }
            bold={inContent && focusArea === "fields" && currentField === 3}
          >
            {inContent && focusArea === "fields" && currentField === 3
              ? " ► "
              : "   "}
            New Navigation Export: {newNavPath || "(not selected)"}
          </Text>
        </Box>
      </Box>

      {/* Buttons */}
      <Box>
        <Box marginRight={2}>
          <Button
            label={isComparing ? "Comparing..." : "Compare"}
            isSelected={
              inContent &&
              focusArea === "buttons" &&
              selectedButton === "compare"
            }
            variant="success"
            disabled={!inContent}
          />
        </Box>
        <Box>
          <Button
            label="Clear"
            isSelected={
              inContent &&
              focusArea === "buttons" &&
              selectedButton === "cancel"
            }
            variant="danger"
            disabled={!inContent}
          />
        </Box>
      </Box>
    </Box>
  );
}
