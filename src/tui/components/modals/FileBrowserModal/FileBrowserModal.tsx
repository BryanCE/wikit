import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import path from "path";
import fs from "fs/promises";

interface FileBrowserModalProps {
  title: string;
  initialPath?: string;
  mode: "file" | "directory";
  allowedExtensions?: string[];
  onSelect: (selectedPath: string) => void;
  onCancel: () => void;
}

interface FileSystemItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

export function FileBrowserModal({
  title,
  initialPath = ".",
  mode,
  allowedExtensions = [],
  onSelect,
  onCancel,
}: FileBrowserModalProps) {
  const { theme } = useTheme();
  const [currentPath, setCurrentPath] = useState(() => {
    const resolved = path.resolve(initialPath);
    return resolved;
  });
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void initializePath();
  }, []);

  useEffect(() => {
    void loadDirectory(currentPath);
  }, [currentPath]);

  const initializePath = async () => {
    try {
      const resolved = path.resolve(initialPath);
      await fs.access(resolved);
      setCurrentPath(resolved);
    } catch {
      setCurrentPath(process.cwd());
    }
  };

  const loadDirectory = async (dirPath: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const fileSystemItems: FileSystemItem[] = [];

      const parentDir = path.dirname(dirPath);
      if (parentDir !== dirPath) {
        fileSystemItems.push({
          name: "..",
          path: parentDir,
          isDirectory: true,
        });
      }

      for (const entry of entries) {
        const itemPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          fileSystemItems.push({
            name: entry.name,
            path: itemPath,
            isDirectory: true,
          });
        } else if (mode === "file") {
          if (allowedExtensions.length === 0 || allowedExtensions.some(ext => entry.name.endsWith(ext))) {
            fileSystemItems.push({
              name: entry.name,
              path: itemPath,
              isDirectory: false,
            });
          }
        }
      }

      fileSystemItems.sort((a, b) => {
        if (a.name === "..") return -1;
        if (b.name === "..") return 1;
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      setItems(fileSystemItems);
      setSelectedIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = () => {
    const selectedItem = items[selectedIndex];
    if (!selectedItem) return;

    if (selectedItem.isDirectory) {
      setCurrentPath(selectedItem.path);
    } else if (mode === "file") {
      onSelect(selectedItem.path);
    }
  };

  const handleConfirmDirectory = () => {
    if (mode === "directory") {
      onSelect(currentPath);
    }
  };

  useEscape("file-browser", onCancel);

  useInput((input, key) => {
    if (isLoading) return;

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
    } else if (key.return) {
      if (input === "\r") {
        handleSelect();
      }
    } else if (input === " " && mode === "directory") {
      handleConfirmDirectory();
    }
  });

  const getItemIcon = (item: FileSystemItem) => {
    if (item.name === "..") return "↰";
    return item.isDirectory ? "📁" : "📄";
  };

  const helpText = mode === "directory"
    ? formatHelpText(HELP_TEXT.NAVIGATE, "Enter=open", "Space=confirm current dir", HELP_TEXT.BACK)
    : formatHelpText(HELP_TEXT.NAVIGATE, HELP_TEXT.ENTER_SELECT, HELP_TEXT.BACK);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          {title}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.accent}>Current: </Text>
        <Text color={theme.colors.text}>{currentPath}</Text>
      </Box>

      {error && (
        <Box marginBottom={1}>
          <Text color={theme.colors.error}>[ERROR] {error}</Text>
        </Box>
      )}

      {isLoading ? (
        <Box marginBottom={1}>
          <Text color={theme.colors.warning}>Loading...</Text>
        </Box>
      ) : items.length === 0 ? (
        <Box marginBottom={1}>
          <Text color={theme.colors.muted}>No items found</Text>
        </Box>
      ) : (
        <VirtualizedList
          items={items}
          selectedIndex={selectedIndex}
          getItemKey={(item) => item.path}
          itemHeight={1}
          renderItem={(item, index, isHighlighted) => (
            <Box height={1} flexShrink={0}>
              <Text
                color={isHighlighted ? theme.colors.accent : item.isDirectory ? theme.colors.primary : theme.colors.text}
                bold={isHighlighted}
                wrap="truncate"
              >
                {isHighlighted ? " ► " : "   "}{getItemIcon(item)} {item.name}
              </Text>
            </Box>
          )}
        />
      )}

      {items.length > 0 && (
        <Box marginTop={1}>
          <Text color={theme.colors.muted}>
            Item {selectedIndex + 1} of {items.length} • {helpText}
          </Text>
        </Box>
      )}

      {items.length === 0 && (
        <Box marginTop={1}>
          <Text color={theme.colors.muted}>{helpText}</Text>
        </Box>
      )}
    </Box>
  );
}
