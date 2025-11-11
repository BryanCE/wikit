import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { AsyncActionDialog } from "@comps/modals/AsyncActionDialog";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { FileBrowserModal } from "@comps/modals/FileBrowserModal/FileBrowserModal";
import { logger } from "@/utils/logger";
import type { NavigationTree, NavigationConfig } from "@/types";

interface NavImportFormProps {
  instance: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface NavigationExportData {
  config: NavigationConfig;
  tree: NavigationTree[];
  exportedAt: string;
}

type ViewMode = "file_list" | "custom_path" | "preview";
type FocusArea = "fields" | "buttons";
type ActionButton = "preview" | "browse" | "cancel";

export function NavImportForm({
  instance,
  onSuccess,
  onCancel,
}: NavImportFormProps) {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("file_list");
  const [discoveredFiles, setDiscoveredFiles] = useState<string[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [customPath, setCustomPath] = useState("");
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [focusArea, setFocusArea] = useState<FocusArea>("fields");
  const [selectedButton, setSelectedButton] = useState<ActionButton>("preview");
  const [previewData, setPreviewData] = useState<NavigationExportData | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFileBrowser, setShowFileBrowser] = useState(false);

  useEffect(() => {
    void discoverFiles();
  }, []);

  const discoverFiles = async () => {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const files: string[] = [];

      try {
        const currentFiles = await fs.readdir(".");
        for (const file of currentFiles) {
          if (file.endsWith(".json") && file.includes("navigation")) {
            files.push(path.join(".", file));
          }
        }
      } catch {
        // Error reading current directory
      }

      setDiscoveredFiles(files);
      if (files.length === 0) {
        setViewMode("custom_path");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const validateAndPreview = async (filePath: string) => {
    setError(null);
    try {
      const fs = await import("fs/promises");

      try {
        await fs.access(filePath);
      } catch {
        setError(`File not found: ${filePath}`);
        return;
      }

      const fileContent = await fs.readFile(filePath, "utf-8");
      let data: NavigationExportData;
      try {
        data = JSON.parse(fileContent) as NavigationExportData;
      } catch {
        setError("Invalid JSON file");
        return;
      }

      if (!data.config || !data.tree) {
        setError("Invalid navigation export file structure");
        return;
      }

      setPreviewData(data);
      setViewMode("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleBrowse = () => {
    logger.info("Browse button clicked - opening file browser");
    setShowFileBrowser(true);
  };

  const handleFileSelected = (selectedPath: string) => {
    logger.info({ selectedPath }, "File selected from browser");
    setShowFileBrowser(false);
    void validateAndPreview(selectedPath);
  };


  const navigateButtons = (direction: "left" | "right") => {
    if (focusArea !== "buttons") return;

    const buttons: ActionButton[] = ["preview", "browse", "cancel"];
    const currentIndex = buttons.indexOf(selectedButton);

    if (direction === "left") {
      const newIndex = Math.max(0, currentIndex - 1);
      setSelectedButton(buttons[newIndex] as ActionButton);
    } else {
      const newIndex = Math.min(buttons.length - 1, currentIndex + 1);
      setSelectedButton(buttons[newIndex] as ActionButton);
    }
  };

  useEscape("navigation-import", () => {
    if (showFileBrowser) {
      setShowFileBrowser(false);
    } else if (showConfirm) {
      setShowConfirm(false);
    } else if (viewMode === "preview") {
      setViewMode(discoveredFiles.length > 0 ? "file_list" : "custom_path");
      setPreviewData(null);
    } else if (isEditingPath) {
      setIsEditingPath(false);
    } else {
      onCancel();
    }
  });

  useInput((input, key) => {
    if (showConfirm || showFileBrowser) return;

    if (viewMode === "file_list") {
      if (key.upArrow) {
        setSelectedFileIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedFileIndex((prev) => Math.min(discoveredFiles.length - 1, prev + 1));
      } else if (key.return) {
        const selectedFile = discoveredFiles[selectedFileIndex];
        if (selectedFile) {
          void validateAndPreview(selectedFile);
        }
      } else if (input === "b") {
        handleBrowse();
      } else if (input === "c") {
        setViewMode("custom_path");
        setIsEditingPath(false);
      }
    } else if (viewMode === "custom_path") {
      if (isEditingPath) {
        // TextInput handles all input - we just need to handle save
        if (key.return) {
          setIsEditingPath(false);
        }
        // TextInput component handles all other input (typing, backspace, etc)
      } else {
        if (key.upArrow && focusArea === "buttons") {
          setFocusArea("fields");
        } else if (key.downArrow && focusArea === "fields") {
          setFocusArea("buttons");
        } else if (key.leftArrow && focusArea === "buttons") {
          navigateButtons("left");
        } else if (key.rightArrow && focusArea === "buttons") {
          navigateButtons("right");
        } else if (key.return) {
          if (focusArea === "fields") {
            setIsEditingPath(true);
          } else if (focusArea === "buttons") {
            if (selectedButton === "preview") {
              if (customPath.trim()) {
                void validateAndPreview(customPath);
              }
            } else if (selectedButton === "browse") {
              handleBrowse();
            } else if (selectedButton === "cancel") {
              if (discoveredFiles.length > 0) {
                setViewMode("file_list");
              } else {
                onCancel();
              }
            }
          }
        }
      }
    } else if (viewMode === "preview") {
      if (key.return) {
        setShowConfirm(true);
      }
    }
  });

  if (showFileBrowser) {
    return (
      <FileBrowserModal
        title="Select Navigation Export File"
        initialPath="."
        mode="file"
        allowedExtensions={[".json"]}
        onSelect={handleFileSelected}
        onCancel={() => setShowFileBrowser(false)}
      />
    );
  }

  if (showConfirm && previewData) {
    const items = [
      `Mode: ${previewData.config.mode}`,
      `Locales: ${previewData.tree.length}`,
      `Total Items: ${previewData.tree.reduce((sum, t) => sum + t.items.length, 0)}`,
      "",
      "WARNING: This will replace your current navigation!",
    ];

    return (
      <AsyncActionDialog
        title="Confirm Import Navigation"
        message="Import navigation from file?"
        confirmText="Import"
        cancelText="Cancel"
        items={items}
        destructive={true}
        loadingMessage="Importing navigation..."
        successMessage="Navigation imported successfully!"
        onConfirm={async () => {
          if (!previewData) throw new Error("No preview data");

          const filePath = viewMode === "file_list"
            ? discoveredFiles[selectedFileIndex]
            : customPath;

          if (!filePath) throw new Error("No file selected");

          const { importNavigation } = await import("@/commands/navigation");
          await importNavigation(filePath, { instance, mode: true });
        }}
        onSuccess={() => {
          setShowConfirm(false);
          onSuccess();
        }}
        onCancel={() => setShowConfirm(false)}
        onError={(err) => setError(err)}
      />
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Import Navigation
        </Text>
      </Box>

      {viewMode === "file_list" && (
        <>
          <Box marginBottom={1}>
            <Text color={theme.colors.secondary}>
              Discovered Files ({discoveredFiles.length}):
            </Text>
          </Box>

          {discoveredFiles.length === 0 ? (
            <Box marginBottom={1}>
              <Text color={theme.colors.muted}>No navigation files found</Text>
            </Box>
          ) : (
            <Box marginBottom={1} flexDirection="column">
              <VirtualizedList
                items={discoveredFiles}
                selectedIndex={selectedFileIndex}
                getItemKey={(file) => file}
                itemHeight={1}
                renderItem={(file, index, isHighlighted) => (
                  <Box height={1} flexShrink={0}>
                    <Text
                      color={isHighlighted ? theme.colors.accent : theme.colors.text}
                      bold={isHighlighted}
                      wrap="truncate"
                    >
                      {isHighlighted ? " ► " : "   "}{file}
                    </Text>
                  </Box>
                )}
              />
            </Box>
          )}

          <Box marginTop={1}>
            <Text color={theme.colors.muted}>
              ↑↓ navigate • Enter select • b browse • c custom path • Esc cancel
            </Text>
          </Box>
        </>
      )}

      {viewMode === "custom_path" && (
        <>
          <Box marginBottom={1}>
            <Box width={20} flexShrink={0}>
              <Text
                color={focusArea === "fields" ? theme.colors.accent : theme.colors.text}
                bold={focusArea === "fields"}
              >
                {focusArea === "fields" ? "▶ " : "  "}File Path:
              </Text>
            </Box>
            <Box marginLeft={2} flexGrow={1}>
              {isEditingPath ? (
                <TextInput
                  value={customPath}
                  onChange={setCustomPath}
                  placeholder="enter path to navigation export file"
                  focus={true}
                  showCursor={true}
                />
              ) : (
                <Text
                  color={focusArea === "fields" ? theme.colors.accent : theme.colors.text}
                  bold={focusArea === "fields"}
                >
                  {customPath || "(enter path to navigation export file)"}
                </Text>
              )}
            </Box>
          </Box>

          <Box marginTop={2} flexDirection="column">
            <Box marginBottom={1}>
              <Box
                marginRight={2}
                paddingX={2}
                paddingY={0}
                borderStyle="round"
                borderColor={
                  focusArea === "buttons" && selectedButton === "preview"
                    ? theme.colors.success
                    : theme.colors.muted
                }
                backgroundColor={
                  focusArea === "buttons" && selectedButton === "preview"
                    ? theme.colors.success
                    : undefined
                }
              >
                <Text
                  color={
                    focusArea === "buttons" && selectedButton === "preview"
                      ? "black"
                      : theme.colors.success
                  }
                  bold={focusArea === "buttons" && selectedButton === "preview"}
                >
                  Preview
                </Text>
              </Box>

              <Box
                marginRight={2}
                paddingX={2}
                paddingY={0}
                borderStyle="round"
                borderColor={
                  focusArea === "buttons" && selectedButton === "browse"
                    ? theme.colors.primary
                    : theme.colors.muted
                }
                backgroundColor={
                  focusArea === "buttons" && selectedButton === "browse"
                    ? theme.colors.primary
                    : undefined
                }
              >
                <Text
                  color={
                    focusArea === "buttons" && selectedButton === "browse"
                      ? "black"
                      : theme.colors.primary
                  }
                  bold={focusArea === "buttons" && selectedButton === "browse"}
                >
                  Browse
                </Text>
              </Box>

              <Box
                paddingX={2}
                paddingY={0}
                borderStyle="round"
                borderColor={
                  focusArea === "buttons" && selectedButton === "cancel"
                    ? theme.colors.muted
                    : theme.colors.muted
                }
                backgroundColor={
                  focusArea === "buttons" && selectedButton === "cancel"
                    ? theme.colors.muted
                    : undefined
                }
              >
                <Text
                  color={
                    focusArea === "buttons" && selectedButton === "cancel"
                      ? "black"
                      : theme.colors.muted
                  }
                  bold={focusArea === "buttons" && selectedButton === "cancel"}
                >
                  {discoveredFiles.length > 0 ? "Back" : "Cancel"}
                </Text>
              </Box>
            </Box>

            <Text color={theme.colors.muted}>
              {isEditingPath
                ? "Type path • Enter confirm • Esc cancel"
                : focusArea === "fields"
                ? "Enter edit • ↓ to buttons"
                : "←→ navigate buttons • Enter select • ↑ to fields"}
            </Text>
          </Box>
        </>
      )}

      {viewMode === "preview" && previewData && (
        <Box flexDirection="column" marginBottom={1}>
          <Box marginBottom={1}>
            <Text color={theme.colors.accent} bold>Import Preview:</Text>
          </Box>
          <Box marginLeft={2} marginBottom={1}>
            <Text color={theme.colors.muted}>
              Mode: {previewData.config.mode} • Locales: {previewData.tree.length} • Total Items: {previewData.tree.reduce((sum, t) => sum + t.items.length, 0)}
            </Text>
          </Box>
          {previewData.tree.map((tree) => (
            <Box key={tree.locale} marginLeft={4}>
              <Text color={theme.colors.muted}>
                • {tree.locale}: {tree.items.length} items
              </Text>
            </Box>
          ))}
          <Box marginTop={1} marginLeft={2}>
            <Text color={theme.colors.warning}>
              ⚠ This will replace current navigation
            </Text>
          </Box>
          <Box marginLeft={2}>
            <Text color={theme.colors.muted}>
              Exported: {new Date(previewData.exportedAt).toLocaleString()}
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text color={theme.colors.muted}>
              Enter import • Esc back
            </Text>
          </Box>
        </Box>
      )}

      {error && (
        <Box marginBottom={1}>
          <Text color={theme.colors.error}>[ERROR] {error}</Text>
        </Box>
      )}

    </Box>
  );
}
