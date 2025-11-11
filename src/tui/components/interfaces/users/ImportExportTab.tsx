import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import { FileBrowserModal } from "@/tui/components/modals/FileBrowserModal/FileBrowserModal";
import { Button } from "@/tui/components/ui/Button";
import type { UserImportResult } from "@/types";

interface ImportExportTabProps {
  // Mode
  mode: "import" | "export";
  inContent: boolean;

  // Shared
  instance: string;
  focusArea: "fields" | "buttons";
  showFileBrowser: boolean;
  error: string | null;

  // Import
  importFilePath: string;
  importSelectedButton: "import" | "clear";
  isImporting: boolean;
  importResult: UserImportResult | null;

  // Export
  exportDirectory: string;
  exportFilename: string;
  exportCurrentField: number;
  exportIsEditing: boolean;
  exportInputValue: string;
  exportSelectedButton: "export" | "browse" | "cancel";
  isExporting: boolean;
  profileCount: number;

  // Handlers
  setImportFilePath: (value: string) => void;
  setShowFileBrowser: (value: boolean) => void;
  onExportDirectorySelected: (path: string) => void;
}

export function ImportExportTab({
  mode,
  inContent,
  instance: _instance,
  focusArea,
  showFileBrowser,
  error,
  importFilePath,
  importSelectedButton,
  isImporting,
  importResult,
  exportDirectory,
  exportFilename,
  exportCurrentField,
  exportIsEditing,
  exportInputValue,
  exportSelectedButton,
  isExporting,
  profileCount,
  setImportFilePath,
  setShowFileBrowser,
  onExportDirectorySelected,
}: ImportExportTabProps) {
  const { theme } = useTheme();

  // Set footer help text based on current state
  let footerHelp: string;

  if (mode === "import") {
    if (importResult) {
      footerHelp = formatHelpText("Tab/1-4=switch tabs", HELP_TEXT.BACK);
    } else if (inContent) {
      if (focusArea === "fields") {
        footerHelp = formatHelpText("Tab/1-4=switch tabs", "Space=browse", "↓=next", HELP_TEXT.BACK);
      } else {
        footerHelp = formatHelpText("Tab/1-4=switch tabs", "←→=select button", HELP_TEXT.ENTER_CONFIRM, HELP_TEXT.BACK);
      }
    } else {
      footerHelp = formatHelpText("Tab/←→ switch tabs", "1-4 quick jump", "↓ enter form", HELP_TEXT.BACK);
    }
  } else {
    // Export mode
    if (inContent) {
      if (exportIsEditing) {
        footerHelp = "Type to edit • Enter confirm • Esc cancel";
      } else if (focusArea === "fields") {
        footerHelp = "↑↓ navigate • Enter edit • ↓ to buttons";
      } else {
        footerHelp = "←→ navigate buttons • Enter select • ↑ to fields";
      }
    } else {
      footerHelp = formatHelpText("Tab/←→ switch tabs", "1-4 quick jump", "↓ enter form", HELP_TEXT.BACK);
    }
  }

  useFooterHelp(footerHelp);

  const handleFileSelected = (selectedPath: string) => {
    if (mode === "import") {
      setImportFilePath(selectedPath);
      setShowFileBrowser(false);
    } else {
      onExportDirectorySelected(selectedPath);
    }
  };

  if (showFileBrowser) {
    if (mode === "import") {
      return (
        <FileBrowserModal
          title="Select Import File (CSV or JSON)"
          initialPath="."
          mode="file"
          allowedExtensions={[".csv", ".json"]}
          onSelect={handleFileSelected}
          onCancel={() => setShowFileBrowser(false)}
        />
      );
    } else {
      return (
        <FileBrowserModal
          title="Select Export Directory"
          initialPath={exportDirectory}
          mode="directory"
          onSelect={handleFileSelected}
          onCancel={() => setShowFileBrowser(false)}
        />
      );
    }
  }

  if (mode === "import") {
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
                All profiles imported successfully!
              </Text>
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text color={!inContent ? theme.colors.muted : theme.colors.accent}>Import User Profiles</Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.muted}>
            Import profile data (portfolio, team, birthday, hire_date, role, bio) from CSV or JSON file
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

  // Export mode
  const fullPath = `${exportDirectory}/${exportFilename}`;
  const FORM_FIELDS = [
    { key: "directory", label: "Directory" },
    { key: "filename", label: "Filename" },
  ] as const;

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color={!inContent ? theme.colors.muted : theme.colors.primary} bold={inContent}>
          Export User Profiles
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.muted}>
          Export all user profiles to JSON file
        </Text>
      </Box>

      {FORM_FIELDS.map((field, index) => (
        <Box key={field.key} marginBottom={1}>
          <Box width={20} flexShrink={0}>
            <Text
              color={
                !inContent
                  ? theme.colors.muted
                  : index === exportCurrentField && focusArea === "fields"
                  ? theme.colors.accent
                  : theme.colors.text
              }
              bold={index === exportCurrentField && focusArea === "fields" && inContent}
            >
              {index === exportCurrentField && focusArea === "fields" && inContent ? "▶ " : "  "}
              {field.label}:
            </Text>
          </Box>
          <Box marginLeft={2} flexGrow={1}>
            <Text
              color={
                !inContent
                  ? theme.colors.muted
                  : exportIsEditing && index === exportCurrentField
                  ? theme.colors.success
                  : index === exportCurrentField && focusArea === "fields"
                  ? theme.colors.accent
                  : theme.colors.text
              }
              bold={index === exportCurrentField && focusArea === "fields" && inContent}
            >
              {exportIsEditing && index === exportCurrentField
                ? `${exportInputValue}|`
                : field.key === "directory"
                ? exportDirectory
                : exportFilename}
            </Text>
          </Box>
        </Box>
      ))}

      <Box marginBottom={1}>
        <Box width={20} flexShrink={0}>
          <Text color={theme.colors.muted}>Full Path:</Text>
        </Box>
        <Box marginLeft={2} flexGrow={1}>
          <Text color={theme.colors.muted}>{fullPath}</Text>
        </Box>
      </Box>

      {profileCount > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Box marginBottom={1}>
            <Text color={inContent ? theme.colors.accent : theme.colors.muted} bold={inContent}>Preview:</Text>
          </Box>
          <Box marginLeft={2} marginBottom={1}>
            <Text color={theme.colors.muted}>
              Total: {profileCount} profiles
            </Text>
          </Box>
        </Box>
      )}

      {error && (
        <Box marginBottom={1}>
          <Text color={theme.colors.error}>[ERROR] {error}</Text>
        </Box>
      )}

      {isExporting && (
        <Box marginBottom={1}>
          <Text color={theme.colors.warning}>Exporting profiles...</Text>
        </Box>
      )}

      <Box marginTop={2}>
        <Box marginRight={2}>
          <Button
            label="Export"
            isSelected={inContent && focusArea === "buttons" && exportSelectedButton === "export"}
            variant="success"
            disabled={!inContent}
          />
        </Box>
        <Box marginRight={2}>
          <Button
            label="Browse"
            isSelected={inContent && focusArea === "buttons" && exportSelectedButton === "browse"}
            variant="primary"
            disabled={!inContent}
          />
        </Box>
        <Box>
          <Button
            label="Cancel"
            isSelected={inContent && focusArea === "buttons" && exportSelectedButton === "cancel"}
            variant="danger"
            disabled={!inContent}
          />
        </Box>
      </Box>
    </Box>
  );
}
