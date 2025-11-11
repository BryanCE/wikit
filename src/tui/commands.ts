import { type Theme } from "./theme";
import type { Command, QuickAction } from "@/types";

export const COMMANDS: Command[] = [
  {
    name: "pages",
    description: "Browse and manage all wiki pages (with search)",
    category: "pages",
    quickAction: true,
  },
  {
    name: "copypages",
    description: "Copy pages between instances",
    category: "pages",
  },
  {
    name: "analyze",
    description: "Analyze exports and find orphaned pages",
    category: "pages",
  },
  {
    name: "users",
    description: "Manage Wiki.js users",
    category: "users",
    quickAction: true,
  },
  {
    name: "groups",
    description: "Manage Wiki.js groups and permissions",
    category: "users",
    quickAction: true,
  },
  {
    name: "navigation",
    description: "Manage Wiki.js navigation tree and settings",
    aliases: ["nav"],
    category: "configuration",
  },
  {
    name: "config",
    description: "Manage Wiki.js instances and configuration",
    category: "configuration",
  },
  {
    name: "theme",
    description: "Toggle between light and dark themes",
    aliases: ["t"],
    category: "configuration",
    quickAction: true,
  },
  {
    name: "compare",
    description: "Compare pages between instances",
    category: "multi-instance",
  },
  {
    name: "status",
    description: "Show instance status and info",
    category: "multi-instance",
    quickAction: true,
  },
  {
    name: "sync",
    description: "Sync configurations between instances",
    category: "multi-instance",
  },
  {
    name: "instance",
    description: "Toggle between instances",
    aliases: ["i"],
    category: "multi-instance",
    quickAction: true,
  },
  {
    name: "help",
    description: "Show detailed help and shortcuts",
    category: "general",
    quickAction: true,
  },
  {
    name: "exit",
    description: "Exit the TUI application",
    aliases: ["quit"],
    category: "general",
    quickAction: true,
  },
];

export const getQuickActions = (theme: Theme): QuickAction[] => {
  return COMMANDS.filter((cmd) => cmd.quickAction).map((cmd) => ({
    id: cmd.name,
    label: cmd.name.charAt(0).toUpperCase() + cmd.name.slice(1),
    description: cmd.description,
    color: getCommandColor(cmd, theme),
  }));
};

function getCommandColor(command: Command, theme: Theme): string {
  switch (command.name) {
    case "pages":
      return theme.colors.success;
    case "users":
      return theme.colors.info;
    case "groups":
      return theme.colors.warning;
    case "status":
      return theme.colors.accent;
    case "instance":
      return theme.colors.secondary;
    case "theme":
      return theme.colors.highlight;
    case "help":
      return theme.colors.primary;
    case "exit":
      return theme.colors.muted;
    default:
      return theme.colors.primary;
  }
}
