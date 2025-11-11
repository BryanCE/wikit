/**
 * Icon formatting utilities for TUI display
 *
 * Handles conversion of Wiki.js MDI icon names (mdi-atlassian) to
 * displayable formats for the terminal.
 */

/**
 * Extract the icon name from Wiki.js MDI format
 * @param icon - Icon string like "mdi-atlassian"
 * @returns Icon name without prefix, or null if invalid
 */
export function getMdiIconName(icon?: string): string | null {
  if (!icon) return null;

  const prefix = "mdi-";
  if (icon.startsWith(prefix)) {
    return icon.slice(prefix.length);
  }

  return icon;
}

/**
 * Get first letter abbreviation for an icon
 * @param iconName - Icon name like "atlassian"
 * @returns First letter with diamonds, like "◆a◆ "
 */
export function getIconAbbreviation(iconName: string): string {
  if (!iconName) return "";
  const firstLetter = iconName[0]?.toLowerCase() ?? "";
  return firstLetter ? `◆    ` : "";
}

/**
 * Format icon for display (Tier 1 fallback)
 * Uses first letter abbreviation
 */
export function formatIconFallback(icon?: string): string {
  const iconName = getMdiIconName(icon);
  if (!iconName) return "";

  return getIconAbbreviation(iconName);
}
