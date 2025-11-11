import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { FileBrowserModal } from "@comps/modals/FileBrowserModal/FileBrowserModal";
import { ComparisonResultsView } from "./ComparisonResultsView";
import { Button } from "@comps/ui/Button";
import type { ExportDiffResult, Page } from "@/types";

interface CompareNavTabProps {
  inContent: boolean;
  instance?: string;
  // Form state
  oldNavPath: string;
  newNavPath: string;
  currentField: number;
  focusArea: "fields" | "buttons";
  selectedButton: "compare" | "cancel";
  showFileBrowser: boolean;
  browserField: 0 | 1;
  isComparing: boolean;
  error: string | null;
  // Results state
  comparisonResult: ExportDiffResult | null;
  resultsSelectedIndex: number;
  selectedPage: Page | undefined;
  // Setters
  setOldNavPath: (value: string) => void;
  setNewNavPath: (value: string) => void;
  setBrowserField: (value: 0 | 1) => void;
  setShowFileBrowser: (value: boolean) => void;
  setSelectedPage: (value: Page | undefined) => void;
  // Callbacks
  onPageSelect?: (page: Page) => void;
}

export function CompareNavTab({
  inContent,
  instance,
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
  setOldNavPath,
  setNewNavPath,
  setShowFileBrowser,
  setSelectedPage,
}: CompareNavTabProps) {
  const { theme } = useTheme();

  const handleFileSelected = (selectedPath: string) => {
    if (browserField === 0) {
      setOldNavPath(selectedPath);
    } else {
      setNewNavPath(selectedPath);
    }
    setShowFileBrowser(false);
  };

  if (showFileBrowser) {
    const titles = [
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
        instance={instance}
        onSelectedPageChange={setSelectedPage}
      />
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.accent}>
          Compare Two Navigation Export Snapshots
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
            Old Navigation Export: {oldNavPath || "(not selected)"}
          </Text>
        </Box>

        <Box>
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
