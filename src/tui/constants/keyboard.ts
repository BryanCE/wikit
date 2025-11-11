/**
 * Standard keyboard navigation constants for TUI components
 *
 * PHILOSOPHY:
 * - Arrow keys for navigation (↑↓ for lists, →← for trees)
 * - Space for selection/deselection (toggle) everywhere
 * - Enter for submit/confirm/action everywhere
 * - Escape for back/cancel everywhere
 * - Avoid letter key shortcuts - use menus instead
 */

/**
 * Standard help text descriptions for common actions
 * Use these consistently across all components
 */
export const HELP_TEXT = {
  // Core navigation (always use these patterns)
  NAVIGATE: "↑↓=navigate",
  NAVIGATE_HORIZONTAL: "←→=navigate",
  EXPAND: "→=expand",
  COLLAPSE: "←=collapse",
  SELECT: "Space=select",
  DESELECT: "Space=deselect",
  TOGGLE: "Space=toggle",
  BACK: "Esc=back",
  CANCEL: "Esc=cancel",

  // Enter key variations (different contexts)
  ENTER_CONFIRM: "Enter=confirm",
  ENTER_SELECT: "Enter=select",
  ENTER_SUBMIT: "Enter=submit",
  ENTER_SAVE: "Enter=save",
  ENTER_EDIT: "Enter=edit",
  ENTER_ACTION: "Enter=action",
  ENTER_ACTIONS: "Enter=actions",
  ENTER_MANAGE: "Enter=manage",
  ENTER_VIEW: "Enter=view",
  ENTER_DONE: "Enter=done",

  // Typing/Input
  TYPE_TO_EDIT: "Type to edit",
  TYPE_TO_SEARCH: "Type to search",
} as const;

/**
 * Helper function to format help text consistently
 * Uses bullet (•) separators between actions
 */
export function formatHelpText(...actions: string[]): string {
  return actions.join(" • ");
}

/**
 * Common help text combinations for different component types
 * These represent the standard patterns - use as-is when possible
 */
export const COMMON_HELP_PATTERNS = {
  // Lists and selection
  LIST: formatHelpText(
    HELP_TEXT.NAVIGATE,
    HELP_TEXT.ENTER_SELECT,
    HELP_TEXT.BACK
  ),
  MULTI_SELECT: formatHelpText(
    HELP_TEXT.NAVIGATE,
    HELP_TEXT.TOGGLE,
    HELP_TEXT.ENTER_CONFIRM,
    HELP_TEXT.BACK
  ),

  // Tree navigation
  TREE: formatHelpText(
    HELP_TEXT.NAVIGATE,
    HELP_TEXT.EXPAND,
    HELP_TEXT.COLLAPSE,
    HELP_TEXT.ENTER_SELECT,
    HELP_TEXT.BACK
  ),

  // Menus and dialogs
  MENU: formatHelpText(
    HELP_TEXT.NAVIGATE,
    HELP_TEXT.ENTER_SELECT,
    HELP_TEXT.CANCEL
  ),
  ACTION_MENU: formatHelpText(
    HELP_TEXT.NAVIGATE,
    HELP_TEXT.ENTER_ACTION,
    HELP_TEXT.CANCEL
  ),
  CONFIRMATION_DIALOG: formatHelpText(
    "←→=select",
    HELP_TEXT.ENTER_CONFIRM,
    HELP_TEXT.CANCEL
  ),

  // Forms and editing
  FORM_NAVIGATION: formatHelpText(
    HELP_TEXT.NAVIGATE,
    HELP_TEXT.ENTER_EDIT,
    HELP_TEXT.CANCEL
  ),
  FORM_EDITING: formatHelpText(
    HELP_TEXT.TYPE_TO_EDIT,
    HELP_TEXT.ENTER_SAVE,
    HELP_TEXT.CANCEL
  ),
  FORM_SELECT_FIELD: formatHelpText(
    HELP_TEXT.NAVIGATE,
    "Enter=edit/select",
    HELP_TEXT.CANCEL
  ),

  // Detail views
  DETAIL_VIEW: formatHelpText(
    HELP_TEXT.NAVIGATE,
    HELP_TEXT.ENTER_VIEW,
    HELP_TEXT.BACK
  ),
  DETAIL_VIEW_SECTIONS: formatHelpText(
    HELP_TEXT.NAVIGATE,
    "Enter=view section",
    HELP_TEXT.BACK
  ),

  // Management interfaces
  MANAGE_MEMBERS: formatHelpText(
    HELP_TEXT.NAVIGATE,
    HELP_TEXT.ENTER_MANAGE,
    HELP_TEXT.BACK
  ),
  VIEW_WITH_MANAGE: formatHelpText(
    HELP_TEXT.NAVIGATE,
    "Enter=manage members",
    HELP_TEXT.BACK
  ),

  // Read-only views
  VIEW_ONLY: formatHelpText(HELP_TEXT.BACK),
  SEARCH_RESULTS: formatHelpText(
    HELP_TEXT.NAVIGATE,
    HELP_TEXT.ENTER_SELECT,
    HELP_TEXT.BACK
  ),
} as const;
