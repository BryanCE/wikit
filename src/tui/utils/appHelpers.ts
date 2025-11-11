import { AppMode } from "@/tui/AppContent";
import { COMMON_HELP_PATTERNS, formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";

export function getInstanceBgColor(instance: string | null): string {
  if (!instance) return "gray";
  // Use a simple hash to pick colors consistently
  const colors = ["magenta", "green", "blue", "yellow", "cyan", "red"];
  const hash = instance
    .split("")
    .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff, 0);
  return colors[Math.abs(hash) % colors.length] ?? "gray";
}

export function getFooterHelpText(
  currentMode: AppMode,
  contextHelpText: string | null
): string {
  // Use help text from context if a child component set it
  if (contextHelpText) return contextHelpText;

  // Otherwise use default help text based on mode
  switch (currentMode) {
    case AppMode.COMMAND:
      return "Type /command or → for quick menu • Ctrl+C to exit";
    case AppMode.PAGES:
      return COMMON_HELP_PATTERNS.LIST;
    case AppMode.COPY_PAGES:
      return formatHelpText(
        HELP_TEXT.NAVIGATE,
        HELP_TEXT.TOGGLE,
        "Enter=copy",
        HELP_TEXT.BACK
      );
    case AppMode.NAVIGATION:
      return COMMON_HELP_PATTERNS.LIST;
    case AppMode.USERS:
      return COMMON_HELP_PATTERNS.LIST;
    case AppMode.GROUPS:
      return COMMON_HELP_PATTERNS.LIST;
    case AppMode.HELP:
      return COMMON_HELP_PATTERNS.VIEW_ONLY;
    case AppMode.THEME:
      return COMMON_HELP_PATTERNS.MENU;
    default:
      return COMMON_HELP_PATTERNS.VIEW_ONLY;
  }
}
