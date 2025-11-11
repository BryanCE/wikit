import { useInput } from "ink";
import { logger } from "@/utils/logger";
import type { Page } from "@/types";

type TabType = "pages" | "export" | "delete";
type FocusArea = "fields" | "buttons";
type ActionButton = "export" | "browse" | "cancel";

interface UsePagesKeyboardProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  inPagesContent: boolean;
  setInPagesContent: (value: boolean) => void;
  inExportContent: boolean;
  setInExportContent: (value: boolean) => void;
  inDeleteContent: boolean;
  setInDeleteContent: (value: boolean) => void;

  // Pages tab state
  allPages: Page[];
  selectedPageIndex: number;
  setSelectedPageIndex: (value: number | ((prev: number) => number)) => void;
  onNavigatePage: (direction: "up" | "down") => void;
  onSelectPage: (page: Page) => void;
  isPageDetailsOpen: boolean;

  // Search state
  pageSearchQuery: string;
  setPageSearchQuery: (value: string | ((prev: string) => string)) => void;
  inSearchMode: boolean;
  setInSearchMode: (value: boolean) => void;

  // Export tab state
  currentField: number;
  setCurrentField: (value: number) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  inputValue: string;
  setInputValue: (value: string | ((prev: string) => string)) => void;
  focusArea: FocusArea;
  setFocusArea: (value: FocusArea) => void;
  selectedButton: ActionButton;
  setSelectedButton: (value: ActionButton) => void;
  showFileBrowser: boolean;
  directory: string;
  filename: string;
  includeContent: boolean;

  // Export tab actions
  onSaveField: () => void;
  onExport: () => void;
  onBrowse: () => void;
  onCancel: () => void;
  onToggleIncludeContent: () => void;

  // Delete tab state
  deletePagesData: Page[];
  selectedDeleteIndex: number;
  setSelectedDeleteIndex: (value: number | ((prev: number) => number)) => void;
  markedForDeletion: Set<string>;
  confirmDelete: boolean;

  // Delete tab actions
  onToggleMarkForDeletion: () => void;
  onClearMarked: () => void;
  onConfirmDelete: () => void;

  // Delete search state
  deleteSearchQuery: string;
  setDeleteSearchQuery: (value: string | ((prev: string) => string)) => void;
  inDeleteSearchMode: boolean;
  setInDeleteSearchMode: (value: boolean) => void;
}

const FORM_FIELDS_COUNT = 3; // directory, filename, and includeContent

export function usePagesKeyboard({
  currentTab,
  setCurrentTab,
  inPagesContent,
  setInPagesContent,
  inExportContent,
  setInExportContent,
  inDeleteContent,
  setInDeleteContent,
  allPages,
  selectedPageIndex,
  setSelectedPageIndex: _setSelectedPageIndex,
  onNavigatePage,
  onSelectPage,
  isPageDetailsOpen,
  pageSearchQuery: _pageSearchQuery,
  setPageSearchQuery,
  inSearchMode,
  setInSearchMode,
  currentField,
  setCurrentField,
  isEditing,
  setIsEditing,
  inputValue: _inputValue,
  setInputValue,
  focusArea,
  setFocusArea,
  selectedButton,
  setSelectedButton,
  showFileBrowser,
  directory,
  filename,
  includeContent: _includeContent,
  onSaveField,
  onExport,
  onBrowse,
  onCancel,
  onToggleIncludeContent,
  deletePagesData,
  selectedDeleteIndex,
  setSelectedDeleteIndex,
  markedForDeletion,
  confirmDelete,
  onToggleMarkForDeletion,
  onClearMarked,
  onConfirmDelete,
  deleteSearchQuery: _deleteSearchQuery,
  setDeleteSearchQuery,
  inDeleteSearchMode,
  setInDeleteSearchMode,
}: UsePagesKeyboardProps) {
  useInput((input, key) => {
    // Block input when PageDetails modal is open, file browser is open, or confirming delete
    if (isPageDetailsOpen || showFileBrowser || confirmDelete) {
      return;
    }

    // Tab key ALWAYS works - exits content modes and switches tabs
    if (key.tab) {
      setInPagesContent(false);
      setInExportContent(false);
      setInDeleteContent(false);
      setIsEditing(false);
      const tabs: TabType[] = ["pages", "export", "delete"];
      const currentIndex = tabs.indexOf(currentTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setCurrentTab(tabs[nextIndex] as TabType);
      return;
    }

    // Arrow keys for tab navigation - ONLY when NOT in content
    if (key.rightArrow && !inPagesContent && !inExportContent && !inDeleteContent) {
      if (currentTab === "pages") {
        setCurrentTab("export");
      } else if (currentTab === "export") {
        setCurrentTab("delete");
      }
      return;
    }
    if (key.leftArrow && !inPagesContent && !inExportContent && !inDeleteContent) {
      if (currentTab === "delete") {
        setCurrentTab("export");
      } else if (currentTab === "export") {
        setCurrentTab("pages");
      }
      return;
    }

    // Quick tab keys - ALWAYS work
    if (input === "1") {
      setCurrentTab("pages");
      setInPagesContent(false);
      setInExportContent(false);
      setInDeleteContent(false);
      setIsEditing(false);
      return;
    }
    if (input === "2") {
      setCurrentTab("export");
      setInPagesContent(false);
      setInExportContent(false);
      setInDeleteContent(false);
      setIsEditing(false);
      return;
    }
    if (input === "3") {
      setCurrentTab("delete");
      setInPagesContent(false);
      setInExportContent(false);
      setInDeleteContent(false);
      setIsEditing(false);
      return;
    }

    // PAGES TAB: 's' key enters search mode from tab bar or content
    if (currentTab === "pages" && input === "s" && !inSearchMode) {
      setInSearchMode(true);
      return;
    }

    // PAGES TAB: Search mode handling
    if (currentTab === "pages" && inSearchMode) {
      // All typing goes to search (including numbers 1-4)
      if (!key.upArrow && !key.downArrow && !key.return && input && input.length === 1) {
        setPageSearchQuery((prev) => prev + input);
        return;
      }

      // Backspace edits search
      if (key.backspace) {
        setPageSearchQuery((prev) => prev.slice(0, -1));
        return;
      }

      // Down arrow exits search mode and enters content
      if (key.downArrow) {
        setInSearchMode(false);
        setInPagesContent(true);
        return;
      }
    }

    // PAGES TAB: Enter content (down arrow when NOT in content and NOT in search)
    if (currentTab === "pages" && !inPagesContent && !inSearchMode && key.downArrow) {
      setInPagesContent(true);
      return;
    }

    // PAGES TAB: Exit content (up arrow at position 0 when IN content) - like UsersInterface line 177
    if (currentTab === "pages" && inPagesContent && key.upArrow && selectedPageIndex === 0) {
      setInPagesContent(false);
      return;
    }

    // PAGES TAB: Content navigation (when IN content) - like UsersInterface line 189
    if (currentTab === "pages" && inPagesContent) {
      if (key.upArrow) {
        onNavigatePage("up");
        return;
      }
      if (key.downArrow) {
        onNavigatePage("down");
        return;
      }
      if (key.return) {
        const selectedPage = allPages[selectedPageIndex];
        if (selectedPage) {
          // Clear search when selecting a page
          setPageSearchQuery("");
          setInSearchMode(false);
          onSelectPage(selectedPage);
        }
        return;
      }
    }

    // EXPORT TAB: Enter content (down arrow when NOT in content)
    if (currentTab === "export" && !inExportContent && key.downArrow) {
      setInExportContent(true);
      return;
    }

    // EXPORT TAB: Exit content (up arrow at top when IN content and NOT editing)
    if (currentTab === "export" && inExportContent && !isEditing && key.upArrow) {
      if (focusArea === "fields" && currentField === 0) {
        setInExportContent(false);
        return;
      }
    }

    // EXPORT TAB: Content navigation (only when IN content)
    if (currentTab === "export" && inExportContent) {
      // Editing mode - TextInput handles all input, we just need to handle save/cancel
      if (isEditing) {
        if (key.return) {
          onSaveField();
        }
        // TextInput component handles all other input (typing, backspace, etc)
        return;
      }

      // Field navigation
      if (focusArea === "fields") {
        if (key.upArrow) {
          const newField = Math.max(0, currentField - 1);
          setCurrentField(newField);
        } else if (key.downArrow) {
          const newField = Math.min(FORM_FIELDS_COUNT - 1, currentField + 1);
          if (newField === FORM_FIELDS_COUNT - 1 && currentField === FORM_FIELDS_COUNT - 1) {
            // At last field, pressing down moves to buttons
            setFocusArea("buttons");
          } else {
            setCurrentField(newField);
          }
        } else if (key.return) {
          // Field 2 is the boolean field (includeContent), toggle it instead of editing
          if (currentField === 2) {
            onToggleIncludeContent();
          } else {
            // Fields 0 and 1 are text fields (directory and filename)
            setIsEditing(true);
            setInputValue(currentField === 0 ? directory : filename);
          }
        }
        return;
      }

      // Button navigation
      if (focusArea === "buttons") {
        if (key.upArrow) {
          setFocusArea("fields");
          setCurrentField(FORM_FIELDS_COUNT - 1);
        } else if (key.leftArrow) {
          const buttons: ActionButton[] = ["export", "browse", "cancel"];
          const currentIndex = buttons.indexOf(selectedButton);
          const newIndex = Math.max(0, currentIndex - 1);
          setSelectedButton(buttons[newIndex] as ActionButton);
        } else if (key.rightArrow) {
          const buttons: ActionButton[] = ["export", "browse", "cancel"];
          const currentIndex = buttons.indexOf(selectedButton);
          const newIndex = Math.min(buttons.length - 1, currentIndex + 1);
          setSelectedButton(buttons[newIndex] as ActionButton);
        } else if (key.return) {
          logger.info({ selectedButton }, "Button action triggered in export");
          if (selectedButton === "export") {
            onExport();
          } else if (selectedButton === "browse") {
            onBrowse();
          } else if (selectedButton === "cancel") {
            onCancel();
          }
        }
        return;
      }
    }

    // DELETE TAB: 's' key enters search mode from tab bar or content
    if (currentTab === "delete" && input === "s" && !inDeleteSearchMode) {
      setInDeleteSearchMode(true);
      return;
    }

    // DELETE TAB: Search mode handling
    if (currentTab === "delete" && inDeleteSearchMode) {
      // All typing goes to search (including numbers 1-3)
      if (!key.upArrow && !key.downArrow && !key.return && input && input.length === 1) {
        setDeleteSearchQuery((prev) => prev + input);
        return;
      }

      // Backspace edits search
      if (key.backspace) {
        setDeleteSearchQuery((prev) => prev.slice(0, -1));
        return;
      }

      // Down arrow exits search mode and enters content
      if (key.downArrow) {
        setInDeleteSearchMode(false);
        setInDeleteContent(true);
        return;
      }
    }

    // DELETE TAB: Enter content (down arrow when NOT in content and NOT in search)
    if (currentTab === "delete" && !inDeleteContent && !inDeleteSearchMode && key.downArrow) {
      setInDeleteContent(true);
      return;
    }

    // DELETE TAB: Exit content (up arrow at position 0 when IN content)
    if (currentTab === "delete" && inDeleteContent && key.upArrow && selectedDeleteIndex === 0) {
      setInDeleteContent(false);
      return;
    }

    // DELETE TAB: Content navigation (when IN content)
    if (currentTab === "delete" && inDeleteContent) {
      if (key.upArrow) {
        setSelectedDeleteIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setSelectedDeleteIndex((prev) => Math.min(deletePagesData.length - 1, prev + 1));
        return;
      }
      if (input === " ") {
        // Space toggles marking for deletion
        onToggleMarkForDeletion();
        return;
      }
      if (key.return && markedForDeletion.size > 0) {
        // Enter confirms deletion (shows confirmation dialog)
        onConfirmDelete();
        return;
      }
      if (input === "c") {
        // 'c' clears all marked pages
        onClearMarked();
        return;
      }
    }
  });
}
