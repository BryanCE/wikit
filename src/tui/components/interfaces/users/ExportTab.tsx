import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { FileBrowserModal } from "@/tui/components/modals/FileBrowserModal/FileBrowserModal";
import { Button } from "@/tui/components/ui/Button";

interface ExportTabProps {
  inContent: boolean;
  focusArea: "fields" | "buttons";
  showFileBrowser: boolean;
  error: string | null;
  exportDirectory: string;
  exportFilename: string;
  exportCurrentField: number;
  exportIsEditing: boolean;
  exportInputValue: string;
  exportSelectedButton: "export" | "browse" | "cancel";
  isExporting: boolean;
  userCount: number;
  setShowFileBrowser: (value: boolean) => void;
  onExportDirectorySelected: (path: string) => void;
}

export function ExportTab({
  inContent,
  focusArea,
  showFileBrowser,
  error,
  exportDirectory,
  exportFilename,
  exportCurrentField,
  exportIsEditing,
  exportInputValue,
  exportSelectedButton,
  isExporting,
  userCount,
  setShowFileBrowser,
  onExportDirectorySelected,
}: ExportTabProps) {
  const { theme } = useTheme();

  const footerHelp = inContent
    ? exportIsEditing
      ? "Type to edit • Enter confirm • Esc cancel"
      : focusArea === "fields"
      ? "↑↓ navigate • Enter edit • ↓ to buttons"
      : "←→ navigate buttons • Enter select • ↑ to fields"
    : "Tab/←→ switch tabs • 1-5 quick jump • ↓ enter form • Esc back";

  useFooterHelp(footerHelp);

  const handleFileSelected = (selectedPath: string) => {
    onExportDirectorySelected(selectedPath);
  };

  if (showFileBrowser) {
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

  const fullPath = `${exportDirectory}/${exportFilename}`;
  const FORM_FIELDS = [
    { key: "directory", label: "Directory" },
    { key: "filename", label: "Filename" },
  ] as const;

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color={!inContent ? theme.colors.muted : theme.colors.primary} bold={inContent}>
          Export Users
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.muted}>
          Export all users to JSON file
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

      {userCount > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Box marginBottom={1}>
            <Text color={inContent ? theme.colors.accent : theme.colors.muted} bold={inContent}>Preview:</Text>
          </Box>
          <Box marginLeft={2} marginBottom={1}>
            <Text color={theme.colors.muted}>
              Total: {userCount} users
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
          <Text color={theme.colors.warning}>Exporting users...</Text>
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
