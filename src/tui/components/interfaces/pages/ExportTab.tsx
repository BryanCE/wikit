import React from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { FileBrowserModal } from "@comps/modals/FileBrowserModal/FileBrowserModal";
import type { Page } from "@/types";

type FocusArea = "fields" | "buttons";
type ActionButton = "export" | "browse" | "cancel";

const FORM_FIELDS = [
  { key: "directory", label: "Directory", type: "text" },
  { key: "filename", label: "Filename", type: "text" },
  { key: "includeContent", label: "Include Content", type: "boolean" },
] as const;

interface ExportTabProps {
  instance: string;
  directory: string;
  filename: string;
  includeContent: boolean;
  currentField: number;
  isEditing: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  focusArea: FocusArea;
  selectedButton: ActionButton;
  error: string | null;
  pages: Page[];
  showFileBrowser: boolean;
  inExportContent: boolean;
  onDirectorySelected: (path: string) => void;
  onCloseFileBrowser: () => void;
}

export function ExportTab({
  directory,
  filename,
  includeContent,
  currentField,
  isEditing,
  inputValue,
  onInputChange,
  focusArea,
  selectedButton,
  error,
  pages,
  showFileBrowser,
  inExportContent,
  onDirectorySelected,
  onCloseFileBrowser,
}: ExportTabProps) {
  const { theme } = useTheme();

  const fullPath = `${directory}/${filename}`;
  const publishedCount = pages.filter((p) => p.isPublished).length;
  const unpublishedCount = pages.length - publishedCount;

  if (showFileBrowser) {
    return (
      <FileBrowserModal
        title="Select Export Directory"
        initialPath={directory}
        mode="directory"
        onSelect={onDirectorySelected}
        onCancel={onCloseFileBrowser}
      />
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Export Pages
        </Text>
      </Box>

      {FORM_FIELDS.map((field, index) => {
        const isFocused = index === currentField && focusArea === "fields" && inExportContent;
        const isEditingThis = isEditing && index === currentField;
        const displayValue = field.key === "directory" ? directory : field.key === "filename" ? filename : "";

        return (
          <Box key={field.key} marginBottom={1}>
            <Box width={20} flexShrink={0}>
              <Text
                color={
                  !inExportContent
                    ? theme.colors.muted
                    : isFocused
                    ? theme.colors.accent
                    : theme.colors.text
                }
                bold={isFocused}
              >
                {isFocused ? "▶ " : "  "}
                {field.label}:
              </Text>
            </Box>
            <Box marginLeft={2} flexGrow={1}>
              {field.type === "boolean" ? (
                <Text
                  color={isFocused ? theme.colors.accent : theme.colors.text}
                  bold={isFocused}
                >
                  {includeContent ? "[✓] Yes" : "[ ] No"}
                </Text>
              ) : isEditingThis ? (
                <TextInput
                  value={inputValue}
                  onChange={onInputChange}
                  placeholder={field.label}
                  focus={true}
                  showCursor={true}
                />
              ) : (
                <Text
                  color={isFocused ? theme.colors.accent : theme.colors.text}
                  bold={isFocused}
                >
                  {displayValue}
                </Text>
              )}
            </Box>
          </Box>
        );
      })}

      <Box marginBottom={1}>
        <Box width={20} flexShrink={0}>
          <Text color={theme.colors.muted}>Full Path:</Text>
        </Box>
        <Box marginLeft={2} flexGrow={1}>
          <Text color={theme.colors.muted}>{fullPath}</Text>
        </Box>
      </Box>

      {pages.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Box marginBottom={1}>
            <Text color={inExportContent ? theme.colors.accent : theme.colors.muted} bold={inExportContent}>Preview:</Text>
          </Box>
          <Box marginLeft={2} marginBottom={1}>
            <Text color={theme.colors.muted}>
              Total: {pages.length} pages • Published: {publishedCount} • Unpublished: {unpublishedCount}
            </Text>
          </Box>
        </Box>
      )}

      {error && (
        <Box marginBottom={1}>
          <Text color={theme.colors.error}>[ERROR] {error}</Text>
        </Box>
      )}

      <Box marginTop={2} flexDirection="column">
        <Box marginBottom={1}>
          <Box
            marginRight={2}
            paddingX={2}
            paddingY={0}
            borderStyle="round"
            borderColor={
              focusArea === "buttons" && selectedButton === "export" && inExportContent
                ? theme.colors.success
                : theme.colors.muted
            }
            backgroundColor={
              focusArea === "buttons" && selectedButton === "export" && inExportContent
                ? theme.colors.success
                : undefined
            }
          >
            <Text
              color={
                !inExportContent
                  ? theme.colors.muted
                  : focusArea === "buttons" && selectedButton === "export"
                  ? "black"
                  : theme.colors.success
              }
              bold={focusArea === "buttons" && selectedButton === "export" && inExportContent}
            >
              Export
            </Text>
          </Box>

          <Box
            marginRight={2}
            paddingX={2}
            paddingY={0}
            borderStyle="round"
            borderColor={
              focusArea === "buttons" && selectedButton === "browse" && inExportContent
                ? theme.colors.primary
                : theme.colors.muted
            }
            backgroundColor={
              focusArea === "buttons" && selectedButton === "browse" && inExportContent
                ? theme.colors.primary
                : undefined
            }
          >
            <Text
              color={
                !inExportContent
                  ? theme.colors.muted
                  : focusArea === "buttons" && selectedButton === "browse"
                  ? "black"
                  : theme.colors.primary
              }
              bold={focusArea === "buttons" && selectedButton === "browse" && inExportContent}
            >
              Browse
            </Text>
          </Box>

          <Box
            paddingX={2}
            paddingY={0}
            borderStyle="round"
            borderColor={theme.colors.muted}
            backgroundColor={
              focusArea === "buttons" && selectedButton === "cancel" && inExportContent
                ? theme.colors.muted
                : undefined
            }
          >
            <Text
              color={
                focusArea === "buttons" && selectedButton === "cancel" && inExportContent
                  ? "black"
                  : theme.colors.muted
              }
              bold={focusArea === "buttons" && selectedButton === "cancel" && inExportContent}
            >
              Cancel
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
