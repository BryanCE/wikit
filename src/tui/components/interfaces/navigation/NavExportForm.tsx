import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { getNavigationTree, getNavigationConfig } from "@/api/navigation";
import { logger } from "@/utils/logger";
import { FileBrowserModal } from "@comps/modals/FileBrowserModal/FileBrowserModal";
import type { NavigationTree, NavigationConfig } from "@/types";

interface NavExportFormProps {
  instance: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type FocusArea = "fields" | "buttons";
type ActionButton = "export" | "browse" | "cancel";

const FORM_FIELDS = [
  { key: "directory", label: "Directory" },
  { key: "filename", label: "Filename" },
] as const;

export function NavExportForm({
  instance,
  onSuccess,
  onCancel,
}: NavExportFormProps) {
  const { theme } = useTheme();
  const [directory, setDirectory] = useState(".");
  const [filename, setFilename] = useState("");
  const [currentField, setCurrentField] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [focusArea, setFocusArea] = useState<FocusArea>("fields");
  const [selectedButton, setSelectedButton] = useState<ActionButton>("export");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navigationTree, setNavigationTree] = useState<NavigationTree[]>([]);
  const [navigationConfig, setNavigationConfig] = useState<NavigationConfig | null>(null);
  const [showFileBrowser, setShowFileBrowser] = useState(false);

  useEffect(() => {
    const date = new Date().toISOString().split("T")[0];
    setFilename(`navigation-export-${date}.json`);
    void loadNavigation();
  }, [instance]);

  const loadNavigation = async () => {
    try {
      const [tree, config] = await Promise.all([
        getNavigationTree(instance),
        getNavigationConfig(instance),
      ]);
      setNavigationTree(tree);
      setNavigationConfig(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const fs = await import("fs/promises");
      const path = await import("path");

      const fullPath = path.join(directory, filename);
      const dir = path.dirname(fullPath);

      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        logger.error({ dir, error }, "Failed to create directory");
        throw error;
      }

      const { exportNavigation } = await import("@/commands/navigation");
      await exportNavigation(fullPath, { instance });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsExporting(false);
    }
  };

  const handleBrowse = () => {
    logger.info({ directory }, "Browse button clicked - opening file browser");
    setShowFileBrowser(true);
  };

  const handleDirectorySelected = (selectedPath: string) => {
    logger.info({ selectedPath }, "Directory selected from browser");
    setDirectory(selectedPath);
    setShowFileBrowser(false);
  };

  const navigateFields = (direction: "up" | "down") => {
    if (isEditing) return;
    if (focusArea === "buttons") return;

    let newFieldIndex = currentField;
    if (direction === "up") {
      newFieldIndex = Math.max(0, currentField - 1);
    } else {
      newFieldIndex = Math.min(FORM_FIELDS.length - 1, currentField + 1);
    }

    setCurrentField(newFieldIndex);
    const field = FORM_FIELDS[newFieldIndex];
    if (field) {
      setInputValue(field.key === "directory" ? directory : filename);
    }
  };

  const navigateButtons = (direction: "left" | "right") => {
    if (focusArea !== "buttons") return;

    const buttons: ActionButton[] = ["export", "browse", "cancel"];
    const currentIndex = buttons.indexOf(selectedButton);

    if (direction === "left") {
      const newIndex = Math.max(0, currentIndex - 1);
      setSelectedButton(buttons[newIndex] as ActionButton);
    } else {
      const newIndex = Math.min(buttons.length - 1, currentIndex + 1);
      setSelectedButton(buttons[newIndex] as ActionButton);
    }
  };

  const switchFocusArea = (direction: "up" | "down") => {
    if (isEditing) return;

    if (direction === "down" && focusArea === "fields" && currentField === FORM_FIELDS.length - 1) {
      setFocusArea("buttons");
    } else if (direction === "up" && focusArea === "buttons") {
      setFocusArea("fields");
    }
  };

  const startEditing = () => {
    const field = FORM_FIELDS[currentField];
    if (field) {
      setInputValue(field.key === "directory" ? directory : filename);
      setIsEditing(true);
    }
  };

  const saveField = () => {
    const field = FORM_FIELDS[currentField];
    if (field) {
      if (field.key === "directory") {
        setDirectory(inputValue);
      } else {
        setFilename(inputValue);
      }
      setIsEditing(false);
    }
  };

  useEscape("navigation-export", () => {
    if (showFileBrowser) {
      setShowFileBrowser(false);
    } else if (isEditing) {
      setIsEditing(false);
      const field = FORM_FIELDS[currentField];
      if (field) {
        setInputValue(field.key === "directory" ? directory : filename);
      }
    } else {
      onCancel();
    }
  });

  useInput((input, key) => {
    if (isExporting || showFileBrowser) return;

    if (isEditing) {
      // TextInput handles all input - we just need to handle save
      if (key.return) {
        saveField();
      }
      // TextInput component handles all other input (typing, backspace, etc)
    } else {
      if (key.upArrow) {
        switchFocusArea("up");
        if (focusArea === "fields") {
          navigateFields("up");
        }
      } else if (key.downArrow) {
        switchFocusArea("down");
        if (focusArea === "fields") {
          navigateFields("down");
        }
      } else if (key.leftArrow && focusArea === "buttons") {
        navigateButtons("left");
      } else if (key.rightArrow && focusArea === "buttons") {
        navigateButtons("right");
      } else if (key.return) {
        logger.info({ focusArea, selectedButton, currentField }, "Enter pressed in NavExportForm");
        if (focusArea === "fields") {
          startEditing();
        } else if (focusArea === "buttons") {
          logger.info({ selectedButton }, "Button action triggered");
          if (selectedButton === "export") {
            void handleExport();
          } else if (selectedButton === "browse") {
            handleBrowse();
          } else if (selectedButton === "cancel") {
            onCancel();
          }
        }
      }
    }
  });

  const getTotalItems = () => {
    return navigationTree.reduce((sum, locale) => sum + locale.items.length, 0);
  };

  const fullPath = `${directory}/${filename}`;

  if (showFileBrowser) {
    return (
      <FileBrowserModal
        title="Select Export Directory"
        initialPath={directory}
        mode="directory"
        onSelect={handleDirectorySelected}
        onCancel={() => setShowFileBrowser(false)}
      />
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Export Navigation
        </Text>
      </Box>

      {FORM_FIELDS.map((field, index) => {
        const isFocused = index === currentField && focusArea === "fields";
        const isEditingThis = isEditing && index === currentField;
        const displayValue = field.key === "directory" ? directory : filename;

        return (
          <Box key={field.key} marginBottom={1}>
            <Box width={20} flexShrink={0}>
              <Text
                color={isFocused ? theme.colors.accent : theme.colors.text}
                bold={isFocused}
              >
                {isFocused ? "▶ " : "  "}
                {field.label}:
              </Text>
            </Box>
            <Box marginLeft={2} flexGrow={1}>
              {isEditingThis ? (
                <TextInput
                  value={inputValue}
                  onChange={setInputValue}
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

      {navigationConfig && (
        <Box flexDirection="column" marginBottom={1}>
          <Box marginBottom={1}>
            <Text color={theme.colors.accent} bold>Preview:</Text>
          </Box>
          <Box marginLeft={2} marginBottom={1}>
            <Text color={theme.colors.muted}>
              Mode: {navigationConfig.mode} • Locales: {navigationTree.length} • Total Items: {getTotalItems()}
            </Text>
          </Box>
          {navigationTree.map((tree) => (
            <Box key={tree.locale} marginLeft={4}>
              <Text color={theme.colors.muted}>
                • {tree.locale}: {tree.items.length} items
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {error && (
        <Box marginBottom={1}>
          <Text color={theme.colors.error}>[ERROR] {error}</Text>
        </Box>
      )}

      {isExporting && (
        <Box marginBottom={1}>
          <Text color={theme.colors.warning}>Exporting navigation...</Text>
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
              focusArea === "buttons" && selectedButton === "export"
                ? theme.colors.success
                : theme.colors.muted
            }
            backgroundColor={
              focusArea === "buttons" && selectedButton === "export"
                ? theme.colors.success
                : undefined
            }
          >
            <Text
              color={
                focusArea === "buttons" && selectedButton === "export"
                  ? "black"
                  : theme.colors.success
              }
              bold={focusArea === "buttons" && selectedButton === "export"}
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
              Cancel
            </Text>
          </Box>
        </Box>

        <Text color={theme.colors.muted}>
          {isEditing
            ? "Type to edit • Enter confirm • Esc cancel"
            : focusArea === "fields"
            ? "↑↓ navigate • Enter edit • ↓ to buttons"
            : "←→ navigate buttons • Enter select • ↑ to fields"}
        </Text>
      </Box>
    </Box>
  );
}
