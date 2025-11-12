import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { FileBrowserModal } from "@comps/modals/FileBrowserModal/FileBrowserModal";
import { AnalysisResultsView } from "./AnalysisResultsView";
import { Button } from "@comps/ui/Button";
import type { AnalysisResult, Page } from "@/types";

interface AnalyzeTabProps {
  inContent: boolean;
  // Form state
  pagesExportPath: string;
  navExportPath: string;
  currentField: number;
  focusArea: "fields" | "buttons";
  selectedButton: "analyze" | "cancel";
  showFileBrowser: boolean;
  browserField: 0 | 1;
  isAnalyzing: boolean;
  error: string | null;
  // Results state
  analysisResult: AnalysisResult | null;
  resultsSelectedIndex: number;
  selectedPage: Page | undefined;
  // Setters
  setPagesExportPath: (value: string) => void;
  setNavExportPath: (value: string) => void;
  setBrowserField: (value: 0 | 1) => void;
  setShowFileBrowser: (value: boolean) => void;
  setSelectedPage: (value: Page | undefined) => void;
  // Callbacks
  onPageSelect?: (page: Page) => void;
}

export function AnalyzeTab({
  inContent,
  pagesExportPath,
  navExportPath,
  currentField,
  focusArea,
  selectedButton,
  showFileBrowser,
  browserField,
  isAnalyzing,
  error,
  analysisResult,
  resultsSelectedIndex,
  setPagesExportPath,
  setNavExportPath,
  setShowFileBrowser,
  setSelectedPage,
}: AnalyzeTabProps) {
  const { theme } = useTheme();

  const handleFileSelected = (selectedPath: string) => {
    if (browserField === 0) {
      setPagesExportPath(selectedPath);
    } else {
      setNavExportPath(selectedPath);
    }
    setShowFileBrowser(false);
  };

  if (showFileBrowser) {
    return (
      <FileBrowserModal
        title={
          browserField === 0
            ? "Select Pages Export"
            : "Select Navigation Export"
        }
        initialPath="."
        mode="file"
        allowedExtensions={[".json"]}
        onSelect={handleFileSelected}
        onCancel={() => setShowFileBrowser(false)}
      />
    );
  }

  if (analysisResult) {
    return (
      <AnalysisResultsView
        result={analysisResult}
        inContent={inContent}
        selectedIndex={resultsSelectedIndex}
        onSelectedPageChange={setSelectedPage}
      />
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.accent}>Analyze Wiki.js Export Files</Text>
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
            Pages Export: {pagesExportPath || "(not selected)"}
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
            Navigation Export: {navExportPath || "(not selected)"}
          </Text>
        </Box>
      </Box>

      {/* Buttons */}
      <Box>
        <Box marginRight={2}>
          <Button
            label={isAnalyzing ? "Analyzing..." : "Analyze"}
            isSelected={
              inContent &&
              focusArea === "buttons" &&
              selectedButton === "analyze"
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
