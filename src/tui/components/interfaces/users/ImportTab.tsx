import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import { FileBrowserModal } from "@/tui/components/modals/FileBrowserModal/FileBrowserModal";
import { Button } from "@/tui/components/ui/Button";
import type { UserImportResult } from "@/types";

interface ImportTabProps {
  inContent: boolean;
  focusArea: "fields" | "buttons";
  showFileBrowser: boolean;
  error: string | null;
  importFilePath: string;
  importSelectedButton: "import" | "clear";
  isImporting: boolean;
  importResult: UserImportResult | null;
  setImportFilePath: (value: string) => void;
  setShowFileBrowser: (value: boolean) => void;
}

export function ImportTab({
  inContent,
  focusArea,
  showFileBrowser,
  error,
  importFilePath,
  importSelectedButton,
  isImporting,
  importResult,
  setImportFilePath,
  setShowFileBrowser,
}: ImportTabProps) {
  const { theme } = useTheme();

  const footerHelp = importResult
    ? formatHelpText("Tab/1-5=switch tabs", HELP_TEXT.BACK)
    : inContent
    ? focusArea === "fields"
      ? formatHelpText("Tab/1-5=switch tabs", "Space=browse", "↓=next", HELP_TEXT.BACK)
      : formatHelpText("Tab/1-5=switch tabs", "←→=select button", HELP_TEXT.ENTER_CONFIRM, HELP_TEXT.BACK)
    : formatHelpText("Tab/←→ switch tabs", "1-5 quick jump", "↓ enter form", HELP_TEXT.BACK);

  useFooterHelp(footerHelp);

  const handleFileSelected = (selectedPath: string) => {
    setImportFilePath(selectedPath);
    setShowFileBrowser(false);
  };

  if (showFileBrowser) {
    return (
      <FileBrowserModal
        title="Select Import File (JSON)"
        initialPath="."
        mode="file"
        allowedExtensions={[".json"]}
        onSelect={handleFileSelected}
        onCancel={() => setShowFileBrowser(false)}
      />
    );
  }

  if (importResult) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text color={!inContent ? theme.colors.muted : theme.colors.success} bold={inContent}>
            Import Complete
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={!inContent ? theme.colors.muted : theme.colors.text}>
            Success: {importResult.success} | Failed: {importResult.failed}
          </Text>
        </Box>

        {importResult.errors.length > 0 && (
          <Box flexDirection="column">
            <Box marginBottom={1}>
              <Text color={!inContent ? theme.colors.muted : theme.colors.error}>Errors:</Text>
            </Box>
            {importResult.errors.map((err, index) => (
              <Box key={index}>
                <Text color={theme.colors.muted}>  - {err}</Text>
              </Box>
            ))}
          </Box>
        )}

        {importResult.errors.length === 0 && (
          <Box marginTop={1}>
            <Text color={!inContent ? theme.colors.muted : theme.colors.success}>
              All users imported successfully!
            </Text>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color={!inContent ? theme.colors.muted : theme.colors.accent}>Import Users</Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.muted}>
          Import user data from JSON file
        </Text>
      </Box>

      {error && (
        <Box marginBottom={1}>
          <Text color={!inContent ? theme.colors.muted : theme.colors.error}>[ERROR] {error}</Text>
        </Box>
      )}

      <Box flexDirection="column" marginBottom={1}>
        <Box marginBottom={1}>
          <Text
            color={!inContent ? theme.colors.muted : (focusArea === "fields" ? theme.colors.primary : theme.colors.text)}
            bold={inContent && focusArea === "fields"}
          >
            {inContent && focusArea === "fields" ? " ► " : "   "}
            File: {importFilePath || "(not selected - press Space to browse)"}
          </Text>
        </Box>
      </Box>

      <Box>
        <Box marginRight={2}>
          <Button
            label={isImporting ? "Importing..." : "Import"}
            isSelected={inContent && focusArea === "buttons" && importSelectedButton === "import"}
            variant="success"
            disabled={!inContent}
          />
        </Box>
        <Box>
          <Button
            label="Clear"
            isSelected={inContent && focusArea === "buttons" && importSelectedButton === "clear"}
            variant="danger"
            disabled={!inContent}
          />
        </Box>
      </Box>
    </Box>
  );
}
