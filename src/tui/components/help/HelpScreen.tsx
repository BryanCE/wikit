import React, { useState } from "react";
import { Box, Text } from "ink";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { COMMANDS as BASE_COMMANDS } from "@/tui/commands";
import { CommandsTab } from "./CommandsTab";
import { NavigationHelpTab } from "./NavigationHelpTab";
import { UIComponentsTab } from "./UIComponentsTab";
import { useHelpKeyboard } from "./hooks/useHelpKeyboard";
import type {
  CommandInfo,
  KeyboardShortcut,
  UIComponent,
  HelpTab,
} from "./types";

interface HelpScreenProps {
  onClose: () => void;
}

// Command details (from original HelpScreen)
const COMMAND_DETAILS: Record<string, { details: string; examples: string[] }> =
  {
    pages: {
      details:
        "Opens an interactive browser to view all pages in your Wiki.js instance. Includes built-in search - just start typing to filter pages by title or path. Navigate with arrow keys and press Enter to view page details. Has a Delete tab for bulk page deletion.",
      examples: ["/pages"],
    },
    copypages: {
      details:
        "Copy pages from one Wiki.js instance to another. Useful for migrating content or duplicating pages across environments.",
      examples: ["/copypages"],
    },
    analyze: {
      details:
        "Three-tab analysis interface: (1) Analyze Wiki.js export files for unlisted pages, broken nav links, and title inconsistencies. (2) Compare two export snapshots to see changes. (3) Find truly orphaned pages with no incoming links from anywhere on the site (live API check).",
      examples: ["/analyze"],
    },
    users: {
      details:
        "View, create, edit, and manage users in your Wiki.js instance. Includes user permissions, roles, and authentication settings.",
      examples: ["/users"],
    },
    groups: {
      details:
        "View and manage user groups in your Wiki.js instance. Groups control permissions and page access rules for users. Use CLI commands for full group management features.",
      examples: ["/groups"],
    },
    navigation: {
      details:
        "Configure the navigation menu structure for your Wiki.js instance. Add, remove, and reorder navigation items. You can also view and modify navigation settings.",
      examples: ["/navigation", "/nav"],
    },
    compare: {
      details:
        "Compare settings, navigation, and other configurations between two Wiki.js instances. Helps identify differences when managing multiple environments.",
      examples: ["/compare"],
    },
    status: {
      details:
        "Display current status information for your Wiki.js instances, including page counts, user counts, and configuration summaries. Shows differences between instances if multiple are configured.",
      examples: ["/status"],
    },
    logs: {
      details:
        "View live server logs from your Wiki.js instance in real-time. Displays log entries with timestamps, severity levels (ERROR, WARN, INFO, DEBUG), and messages. Automatically scrolls to show the latest entries. Useful for debugging and monitoring server activity.",
      examples: ["/logs"],
    },
    sync: {
      details:
        "Sync navigation, settings, and other configurations from one Wiki.js instance to another. Useful for keeping multiple environments in sync.",
      examples: ["/sync"],
    },
    instance: {
      details:
        "Switch between configured Wiki.js instances. The current instance is shown in the header badge. All subsequent commands will use the selected instance.",
      examples: ["/instance", "/i"],
    },
    config: {
      details:
        "Manage your Wiki.js instance configurations. Add new instances via 'Add instance', or use 'List instances' to view, edit, or delete existing instances. When deleting the last instance, you'll be required to type the instance name for confirmation.",
      examples: ["/config"],
    },
    theme: {
      details:
        "Open the theme selector to choose from available color themes. Customize the appearance of the TUI to your preference.",
      examples: ["/theme", "/t"],
    },
    help: {
      details:
        "Display help information about all available commands, navigation shortcuts, and usage examples. Use arrow keys to navigate through commands and read detailed descriptions.",
      examples: ["/help"],
    },
    exit: {
      details:
        "Close the Wiki.js TUI application and return to your terminal. You can also use Ctrl+C from anywhere.",
      examples: ["/exit", "/quit"],
    },
  };

const CATEGORY_NAMES: Record<string, string> = {
  pages: "Pages",
  configuration: "Configuration",
  "multi-instance": "Multi-Instance",
  general: "General",
};

// Build commands list
const COMMANDS: CommandInfo[] = BASE_COMMANDS.map((cmd) => {
  const detail = COMMAND_DETAILS[cmd.name] ?? {
    details: cmd.description,
    examples: [`/${cmd.name}`],
  };
  const commandDisplay = cmd.aliases
    ? `/${cmd.name} or /${cmd.aliases.join(", /")}`
    : `/${cmd.name}`;

  return {
    command: commandDisplay,
    description: cmd.description,
    details: detail.details,
    examples: detail.examples,
    category: CATEGORY_NAMES[cmd.category ?? "general"] ?? "General",
  };
});

// Keyboard shortcuts data
const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // General
  { key: "Ctrl+C", description: "Exit TUI from anywhere", category: "General" },
  {
    key: "Esc",
    description: "Return to previous screen/exit mode",
    category: "General",
  },

  // Lists
  {
    key: "↑ / ↓",
    description: "Navigate up/down through items",
    category: "Lists",
  },
  { key: "Enter", description: "Select/confirm item", category: "Lists" },
  {
    key: "Space",
    description: "Toggle/mark item in multi-select",
    category: "Lists",
  },

  // Tabs
  { key: "Tab", description: "Cycle through tabs", category: "Tab Navigation" },
  {
    key: "← / →",
    description: "Switch between tabs",
    category: "Tab Navigation",
  },
  {
    key: "1/2/3/4",
    description: "Quick jump to tab number",
    category: "Tab Navigation",
  },
  {
    key: "↓",
    description: "Enter tab content from tab bar",
    category: "Tab Navigation",
  },
  {
    key: "↑",
    description: "Exit to tab bar (when at top)",
    category: "Tab Navigation",
  },

  // Search
  { key: "s", description: "Activate search mode", category: "Search" },
  {
    key: "Type",
    description: "Enter search text when in search mode",
    category: "Search",
  },
  {
    key: "Backspace",
    description: "Delete character in search",
    category: "Search",
  },

  // Trees
  { key: "→", description: "Expand tree node", category: "Trees" },
  { key: "←", description: "Collapse tree node", category: "Trees" },

  // Forms
  { key: "Enter", description: "Edit field/save changes", category: "Forms" },
  { key: "Type", description: "Enter text in active field", category: "Forms" },

  // Menus & Dialogs
  {
    key: "← / →",
    description: "Select Yes/No in confirmation",
    category: "Menus & Dialogs",
  },
  {
    key: "Enter",
    description: "Confirm selection",
    category: "Menus & Dialogs",
  },
  {
    key: "Esc",
    description: "Cancel/close dialog",
    category: "Menus & Dialogs",
  },
];

// UI components data
const UI_COMPONENTS: UIComponent[] = [
  {
    name: "Header",
    description:
      "Top bar showing current screen title, context information, and instance badge. Automatically updates based on component stack - components push their header data on mount and previous values restore on unmount.",
    whereAppears: "Top of every screen",
    relatedShortcuts: ["Changes with screen context"],
  },
  {
    name: "Footer",
    description:
      "Bottom bar split into two sections: left side shows available keyboard shortcuts for current context (help text), right side shows status messages. Uses two independent stacks for help and status.",
    whereAppears: "Bottom of every screen",
    relatedShortcuts: ["Updates based on current mode"],
  },
  {
    name: "Instance Badge",
    description:
      "Colored badge in the header showing which Wiki.js instance you're connected to. Each instance has a unique color for quick identification.",
    whereAppears: "Top-right corner of header",
    relatedShortcuts: ["/instance or /i to switch instances"],
  },
  {
    name: "Tab Bar",
    description:
      "Horizontal row of tabs for switching between different views within an interface. Active tab is highlighted with a color and indicator.",
    whereAppears: "Top of tabbed interfaces (Pages, Users, Analysis, Help)",
    relatedShortcuts: ["Tab, ←/→, or 1/2/3/4 to switch tabs"],
  },
  {
    name: "VirtualizedList",
    description:
      "Scrollable list component that efficiently renders large lists by only displaying visible items. Automatically handles scrolling and highlighting.",
    whereAppears: "Most list views (pages, users, commands, etc.)",
    relatedShortcuts: ["↑↓ to navigate", "Enter to select"],
  },
  {
    name: "Command Input",
    description:
      "Input field for entering commands at the main menu. Supports autocomplete and command preview.",
    whereAppears: "Main menu screen",
    relatedShortcuts: ["Type / to start command", "Enter to execute"],
  },
  {
    name: "Confirmation Dialog",
    description:
      "Modal dialog for confirming destructive actions. Shows Yes/No options with arrow key selection.",
    whereAppears: "Before delete operations or other destructive actions",
    relatedShortcuts: ["←/→ to select", "Enter to confirm", "Esc to cancel"],
  },
  {
    name: "Search Bar",
    description:
      "Visual search input with border highlight when active. Shows search query and provides clear feedback.",
    whereAppears: "Interfaces with search capability (Pages, Users)",
    relatedShortcuts: ["s to activate", "Type to search", "↓ to enter results"],
  },
  {
    name: "Action Menu",
    description:
      "Context menu showing available actions for selected item. Appears after selecting an item from a list.",
    whereAppears: "After selecting items in various interfaces",
    relatedShortcuts: ["↑↓ to navigate", "Enter to execute", "Esc to cancel"],
  },
  {
    name: "Borders & Panels",
    description:
      "Visual containers with colored borders to organize content and show focus. Border colors change based on interaction state (active/inactive).",
    whereAppears: "Throughout the interface",
    relatedShortcuts: ["Colors indicate active/inactive state"],
  },
];

export function HelpScreen({ onClose }: HelpScreenProps) {
  const { theme } = useTheme();

  // Tab selection
  const [currentTab, setCurrentTab] = useState<HelpTab>("commands");

  // Content focus flags
  const [inCommandsContent, setInCommandsContent] = useState(false);
  const [inNavigationContent, setInNavigationContent] = useState(false);
  const [inUIComponentsContent, setInUIComponentsContent] = useState(false);

  // Selection indices
  const [commandSelectedIndex, setCommandSelectedIndex] = useState(0);
  const [navigationSelectedIndex, setNavigationSelectedIndex] = useState(0);
  const [uiComponentsSelectedIndex, setUIComponentsSelectedIndex] = useState(0);

  // Header
  useHeaderData({
    title: "Help Menu",
    metadata: "Wikit TUI and CLI: Manage Wiki.js wikis (Wiki Kit)",
  });

  // Footer help
  const isInContent =
    (currentTab === "commands" && inCommandsContent) ||
    (currentTab === "navigation" && inNavigationContent) ||
    (currentTab === "ui" && inUIComponentsContent);

  const footerHelp = isInContent
    ? "Tab/1-3 switch tabs • ↑↓ navigate • Esc back"
    : "Tab/←→ switch tabs • 1-3 quick jump • ↓ enter • Esc back";

  useFooterHelp(footerHelp);

  // Escape handling
  useEscape("help", () => {
    onClose();
  });

  // Custom keyboard hook
  // Calculate navigation count (categories + shortcuts)
  const navigationCategories = new Set(KEYBOARD_SHORTCUTS.map((s) => s.category)).size;
  const navigationCount = navigationCategories + KEYBOARD_SHORTCUTS.length;

  useHelpKeyboard({
    currentTab,
    setCurrentTab,
    inCommandsContent,
    setInCommandsContent,
    inNavigationContent,
    setInNavigationContent,
    inUIComponentsContent,
    setInUIComponentsContent,
    commandSelectedIndex,
    setCommandSelectedIndex,
    navigationSelectedIndex,
    setNavigationSelectedIndex,
    uiComponentsSelectedIndex,
    setUIComponentsSelectedIndex,
    commandsCount: COMMANDS.length,
    navigationCount,
    uiComponentsCount: UI_COMPONENTS.length,
    onClose,
  });

  return (
    <Box flexDirection="column" padding={1} flexGrow={1}>
      {/* Tab Navigation */}
      <Box
        paddingX={1}
        borderStyle="single"
        borderColor={theme.colors.primary}
        flexShrink={0}
      >
        <Text
          color={
            currentTab === "commands"
              ? theme.colors.background
              : theme.colors.primary
          }
          backgroundColor={
            currentTab === "commands" ? theme.colors.primary : undefined
          }
          bold={currentTab === "commands"}
        >
          1. Commands
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "navigation"
              ? theme.colors.background
              : theme.colors.success
          }
          backgroundColor={
            currentTab === "navigation" ? theme.colors.success : undefined
          }
          bold={currentTab === "navigation"}
        >
          2. Navigation
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "ui" ? theme.colors.background : theme.colors.warning
          }
          backgroundColor={
            currentTab === "ui" ? theme.colors.warning : undefined
          }
          bold={currentTab === "ui"}
        >
          3. UI Components
        </Text>
      </Box>

      {/* Tab content */}
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        {currentTab === "commands" && (
          <CommandsTab
            commands={COMMANDS}
            selectedIndex={commandSelectedIndex}
            inContent={inCommandsContent}
          />
        )}

        {currentTab === "navigation" && (
          <NavigationHelpTab
            shortcuts={KEYBOARD_SHORTCUTS}
            selectedIndex={navigationSelectedIndex}
            inContent={inNavigationContent}
          />
        )}

        {currentTab === "ui" && (
          <UIComponentsTab
            components={UI_COMPONENTS}
            selectedIndex={uiComponentsSelectedIndex}
            inContent={inUIComponentsContent}
          />
        )}
      </Box>
    </Box>
  );
}
