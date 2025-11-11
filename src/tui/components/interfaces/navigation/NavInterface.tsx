import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { getNavigationTree, getNavigationConfig } from "@/api/navigation";
import type { NavigationTree, NavigationConfig } from "@/types";
import { NavTreeDisplay } from "./NavTree.js";
import { NavItemForm } from "./NavItemForm.js";
import { NavItemMoveInterface } from "./NavItemMoveInterface.js";
import { NavModeSelector } from "./NavModeSelector.js";
import { NavExportForm } from "./NavExportForm.js";
import { NavImportForm } from "./NavImportForm.js";
import { NavDeleteModal } from "./NavDeleteInterface/NavDeleteModal.js";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext.js";
import {
  useFooterHelp,
  useFooterStatus,
} from "@/tui/contexts/FooterContext.js";
import {
  useHeaderData,
} from "@/tui/contexts/HeaderContext";

interface NavInterfaceProps {
  onEsc?: () => void;
}

enum NavMode {
  OPTIONS = "options",
  TREE = "tree",
  ADD_ITEM = "add",
  MOVE_ITEM = "move",
  MODE_SELECT = "mode",
  EXPORT = "export",
  IMPORT = "import",
  DELETE_ITEM = "delete",
}

const NAVIGATION_OPTIONS = [
  {
    key: "tree",
    label: "View Navigation Tree",
    desc: "Browse and manage navigation items",
  },
  {
    key: "add",
    label: "Add Navigation Item",
    desc: "Create new navigation item",
  },
  {
    key: "move",
    label: "Move Navigation Item",
    desc: "Reorder navigation items",
  },
  {
    key: "delete",
    label: "Delete Navigation Items",
    desc: "Remove one or more items",
  },
  {
    key: "mode",
    label: "Change Navigation Mode",
    desc: "Set navigation display mode",
  },
  {
    key: "export",
    label: "Export Navigation",
    desc: "Export navigation to JSON file",
  },
  {
    key: "import",
    label: "Import Navigation",
    desc: "Import navigation from JSON file",
  },
];

export function NavInterface({
  onEsc,
}: NavInterfaceProps) {
  useEscape("navigation", () => {
    if (currentMode === NavMode.OPTIONS) {
      onEsc?.();
    } else if (currentMode === NavMode.DELETE_ITEM) {
      // NavDeleteModal handles its own escape for nested dialogs
      // This only fires if user escapes from the delete interface itself
      setCurrentMode(NavMode.OPTIONS);
      setSelectedOption(0);
    } else {
      setCurrentMode(NavMode.OPTIONS);
      setSelectedOption(0);
    }
  });

  const { theme } = useTheme();
  const [currentMode, setCurrentMode] = useState<NavMode>(NavMode.OPTIONS);
  const [selectedOption, setSelectedOption] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [navigationTree, setNavigationTree] = useState<NavigationTree[]>([]);
  const [navigationConfig, setNavigationConfig] =
    useState<NavigationConfig | null>(null);
  const [selectedLocale] = useState("en");
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  // Set footer help text based on current mode
  // NavDeleteModal sets its own footer help when in DELETE_ITEM mode
  const helpText = currentMode === NavMode.DELETE_ITEM
    ? null
    : currentMode === NavMode.OPTIONS
    ? "↑↓=navigate • Enter=select • Esc=back"
    : currentMode === NavMode.TREE
    ? "↑↓=navigate • Enter=select • Esc=back"
    : currentMode === NavMode.EXPORT
    ? "Type path • Space=open file browser • Enter=export • Esc=back"
    : currentMode === NavMode.IMPORT
    ? "Type path • Space=open file browser • Enter=import • Esc=back"
    : "Esc=back to options";

  useFooterHelp(helpText);
  useFooterStatus(statusMsg);

  // ALWAYS set header unconditionally - children override when they render (PagesInterface pattern)
  useHeaderData({
    title: "Navigation Management",
    metadata: navigationConfig ? `Mode: ${navigationConfig.mode} • Locale: ${selectedLocale}` : "Navigation"
  });

  useInput((input, key) => {
    if (isLoading) return;

    if (currentMode === NavMode.OPTIONS) {
      if (key.upArrow) {
        setSelectedOption((prev) =>
          prev > 0 ? prev - 1 : NAVIGATION_OPTIONS.length - 1
        );
      } else if (key.downArrow) {
        setSelectedOption((prev) =>
          prev < NAVIGATION_OPTIONS.length - 1 ? prev + 1 : 0
        );
      } else if (key.return) {
        const selectedOpt = NAVIGATION_OPTIONS[selectedOption];
        if (selectedOpt) {
          setCurrentMode(selectedOpt.key as NavMode);
          if (selectedOpt.key === "tree") {
            void loadNavigation();
          }
        }
      }
    }
  });

  const loadNavigation = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMsg("Loading navigation...");

    try {
      const [tree, config] = await Promise.all([
        getNavigationTree(),
        getNavigationConfig(),
      ]);

      setNavigationTree(tree);
      setNavigationConfig(config);
      setStatusMsg(`Navigation loaded - Mode: ${config.mode}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setStatusMsg(`Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigationUpdate = () => {
    void loadNavigation();
    setCurrentMode(NavMode.OPTIONS);
    setSelectedOption(0);
  };

  useEffect(() => {
    void loadNavigation();
  }, []);

  const currentLocaleTree = navigationTree.find(
    (t) => t.locale === selectedLocale
  );

  if (isLoading) {
    return (
      <Box justifyContent="center" paddingY={2}>
        <Text color={theme.colors.warning}>Loading navigation...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box paddingY={1}>
        <Text color={theme.colors.error}>[ERROR] {error}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width="100%" height="100%">
      {currentMode === NavMode.OPTIONS && (
        <>
          <Box marginBottom={1}>
            <Text color={theme.colors.primary} bold>
              Navigation Options
            </Text>
          </Box>
          {NAVIGATION_OPTIONS.map((option, index) => {
            const isSelected = index === selectedOption;
            return (
              <Box
                key={option.key}
                backgroundColor={isSelected ? theme.colors.primary : undefined}
                paddingX={1}
                marginBottom={1}
              >
                <Box width={25}>
                  <Text
                    color={
                      isSelected
                        ? theme.colors.background
                        : theme.colors.primary
                    }
                    bold={isSelected}
                  >
                    {option.label}
                  </Text>
                </Box>
                <Text
                  color={
                    isSelected ? theme.colors.background : theme.colors.muted
                  }
                >
                  {option.desc}
                </Text>
              </Box>
            );
          })}
        </>
      )}

      {currentMode === NavMode.TREE && (
        <NavTreeDisplay
          tree={currentLocaleTree}
          theme={theme}
          onItemSelect={(itemId) => {
            setStatusMsg(`Selected item: ${itemId}`);
          }}
        />
      )}

      {currentMode === NavMode.ADD_ITEM && (
        <NavItemForm
          locale={selectedLocale}
          existingTree={currentLocaleTree}
          onSubmit={handleNavigationUpdate}
          onCancel={() => setCurrentMode(NavMode.OPTIONS)}
        />
      )}

      {currentMode === NavMode.MOVE_ITEM && (
        <NavItemMoveInterface
          locale={selectedLocale}
          existingTree={currentLocaleTree}
          onSubmit={handleNavigationUpdate}
          onCancel={() => setCurrentMode(NavMode.OPTIONS)}
        />
      )}

      {currentMode === NavMode.MODE_SELECT && (
        <NavModeSelector
          currentMode={navigationConfig?.mode ?? "NONE"}
          onModeChange={handleNavigationUpdate}
          onCancel={() => setCurrentMode(NavMode.OPTIONS)}
        />
      )}

      {currentMode === NavMode.EXPORT && (
        <NavExportForm
          onSuccess={() => {
            setStatusMsg("Navigation exported successfully");
            setCurrentMode(NavMode.OPTIONS);
            setSelectedOption(0);
          }}
          onCancel={() => setCurrentMode(NavMode.OPTIONS)}
        />
      )}

      {currentMode === NavMode.IMPORT && (
        <NavImportForm
          onSuccess={handleNavigationUpdate}
          onCancel={() => setCurrentMode(NavMode.OPTIONS)}
        />
      )}

      {currentMode === NavMode.DELETE_ITEM && currentLocaleTree && (
        <NavDeleteModal
          tree={currentLocaleTree}
          onClose={() => setCurrentMode(NavMode.OPTIONS)}
          onSuccess={handleNavigationUpdate}
          onStatusChange={setStatusMsg}
        />
      )}
    </Box>
  );
}
