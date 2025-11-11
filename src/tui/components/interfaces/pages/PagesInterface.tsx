import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { useSearch } from "@/tui/hooks/useSearch";
import { getAllPages } from "@/api/pages";
import { getPages } from "@/commands/listPages";
import { exportPages } from "@/commands/pages";
import { logger } from "@/utils/logger";
import { AllPagesTab } from "./AllPagesTab";
import { ExportTab } from "./ExportTab";
import { DeleteTab } from "./DeleteTab";
import { PageDetails } from "./PageDetailsInterface/PageDetails";
import { AsyncActionDialog } from "@comps/modals/AsyncActionDialog";
import { deletePage } from "@/api/pages";
import { usePagesKeyboard } from "./hooks/usePagesKeyboard";
import type { Page } from "@/types";

interface PagesInterfaceProps {
  instance: string | null;
  onEsc?: () => void;
}

type TabType = "pages" | "export" | "delete";
type FocusArea = "fields" | "buttons";
type ActionButton = "export" | "browse" | "cancel";

export function PagesInterface({
  instance,
  onEsc,
}: PagesInterfaceProps) {
  const { theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<TabType>("pages");
  const [statusMsg, setStatusMsg] = useState("");

  // Page details state (owned by this component)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  // Mode flags
  const [inPagesContent, setInPagesContent] = useState(false);
  const [inExportContent, setInExportContent] = useState(false);
  const [inDeleteContent, setInDeleteContent] = useState(false);

  // Pages tab state (like UsersInterface)
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [loadingPages, setLoadingPages] = useState(true);
  const [pagesError, setPagesError] = useState<string | null>(null);

  // Search state (for pages tab)
  const [pageSearchQuery, setPageSearchQuery] = useState("");
  const [inSearchMode, setInSearchMode] = useState(false);

  // Filtered pages using search hook
  const filteredPages = useSearch(allPages, pageSearchQuery, ["title", "path"]);

  // Export tab state
  const [directory, setDirectory] = useState(".");
  const [filename, setFilename] = useState("");
  const [includeContent, setIncludeContent] = useState(false);
  const [currentField, setCurrentField] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [focusArea, setFocusArea] = useState<FocusArea>("fields");
  const [selectedButton, setSelectedButton] = useState<ActionButton>("export");
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [showFileBrowser, setShowFileBrowser] = useState(false);

  // Delete tab state
  const [deletePagesData, setDeletePagesData] = useState<Page[]>([]);
  const [selectedDeleteIndex, setSelectedDeleteIndex] = useState(0);
  const [markedForDeletion, setMarkedForDeletion] = useState<Set<string>>(new Set());
  const [loadingDeletePages, setLoadingDeletePages] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Search state (for delete tab)
  const [deleteSearchQuery, setDeleteSearchQuery] = useState("");
  const [inDeleteSearchMode, setInDeleteSearchMode] = useState(false);

  // Filtered delete pages using search hook
  const filteredDeletePages = useSearch(deletePagesData, deleteSearchQuery, ["title", "path"]);

  useEffect(() => {
    const date = new Date().toISOString().split("T")[0];
    setFilename(`pages-export-${date}.json`);
    if (instance) {
      void loadBothPageSets();
    }
  }, [instance]);

  const loadBothPageSets = async () => {
    await Promise.all([loadPagesForList(), loadPagesForExport(), loadPagesForDelete()]);
  };

  const loadPagesForList = async () => {
    if (!instance) return;
    try {
      setLoadingPages(true);
      setPagesError(null);
      setStatusMsg("Loading pages...");
      const pageList = await getPages("", {
        instance,
        recursive: true,
        limit: 500,
      });
      setAllPages(pageList);
      setSelectedPageIndex(0);
      setStatusMsg(`${pageList.length} pages loaded`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setPagesError(errorMsg);
      setStatusMsg(`Error loading pages: ${errorMsg}`);
    } finally {
      setLoadingPages(false);
    }
  };

  const loadPagesForExport = async () => {
    if (!instance) return;
    try {
      setStatusMsg("Loading pages for export...");
      const exportPages = await getAllPages();
      setPages(exportPages);
      setStatusMsg(`${exportPages.length} pages ready for export`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setStatusMsg(`Error: ${errorMsg}`);
    }
  };

  const loadPagesForDelete = async () => {
    if (!instance) return;
    try {
      setLoadingDeletePages(true);
      setDeleteError(null);
      setStatusMsg("Loading pages for deletion...");
      const deletePages = await getPages("", {
        instance,
        recursive: true,
        limit: 500,
      });
      setDeletePagesData(deletePages);
      setSelectedDeleteIndex(0);
      setStatusMsg(`${deletePages.length} pages loaded`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setDeleteError(errorMsg);
      setStatusMsg(`Error loading pages: ${errorMsg}`);
    } finally {
      setLoadingDeletePages(false);
    }
  };

  const handleSaveField = () => {
    if (currentField === 0) {
      setDirectory(inputValue);
    } else if (currentField === 1) {
      setFilename(inputValue);
    }
    // currentField === 2 is the boolean field (includeContent), handled by toggle
    setIsEditing(false);
  };

  const handleToggleIncludeContent = () => {
    setIncludeContent((prev) => !prev);
  };

  const handleExport = () => {
    if (!instance) {
      logger.error("No instance configured for export");
      setError("No instance configured");
      setStatusMsg("Error: No instance configured");
      return;
    }
    setShowExportDialog(true);
  };

  const performExport = async (setProgress: (msg: string) => void) => {
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

    const result = await exportPages(fullPath, {
      includeContent,
      onProgress: setProgress,
    });

    if (!result.success) {
      throw new Error(result.message);
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

  const handleCancelExport = () => {
    setCurrentTab("pages");
    setInExportContent(false);
  };

  const handleToggleMarkForDeletion = () => {
    const currentPage = filteredDeletePages[selectedDeleteIndex];
    if (currentPage) {
      setMarkedForDeletion((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(currentPage.id)) {
          newSet.delete(currentPage.id);
        } else {
          newSet.add(currentPage.id);
        }
        return newSet;
      });
    }
  };

  const handleClearMarked = () => {
    setMarkedForDeletion(new Set());
  };

  const handleConfirmDelete = () => {
    if (markedForDeletion.size > 0) {
      setConfirmDelete(true);
    }
  };

  const handleNavigatePage = (direction: "up" | "down") => {
    if (direction === "up") {
      setSelectedPageIndex((prev) => Math.max(0, prev - 1));
    } else {
      setSelectedPageIndex((prev) => Math.min(allPages.length - 1, prev + 1));
    }
  };

  const handleSelectPage = (page: Page) => {
    setSelectedPage(page);
  };

  useFooterStatus(statusMsg);
  useHeaderData({
    title: "Pages",
    metadata: currentTab === "delete"
      ? `${markedForDeletion.size} marked`
      : instance ?? "No instance"
  });

  // Footer help text
  const footerHelpText = (() => {
    if (currentTab === "pages") {
      if (inSearchMode) {
        return "Type to search • ↓ enter results • Esc exit search";
      }
      if (inPagesContent) {
        return "Tab/1-3 switch tabs • s=search • ↑↓ navigate • Enter view • ↑ to tab bar • Esc back";
      }
      return "Tab/←→ switch tabs • 1-3 quick jump • s=search • ↓ enter list • Esc back";
    } else if (currentTab === "export") {
      if (inExportContent) {
        if (isEditing) {
          return "Type to edit • Enter confirm • Esc cancel";
        }
        if (focusArea === "fields") {
          return "Tab/1-3 switch tabs • ↑↓ navigate • Enter edit • ↑ to tab bar";
        }
        return "Tab/1-3 switch tabs • ←→ navigate buttons • Enter select • ↑ to fields";
      }
      return "Tab/←→ switch tabs • 1-3 quick jump • ↓ enter form • Esc back";
    } else {
      // delete tab
      if (inDeleteSearchMode) {
        return "Type to search • ↓ enter results • Esc exit search";
      }
      if (inDeleteContent) {
        return "Tab/1-3 switch tabs • s=search • ↑↓ navigate • Space toggle • c clear • Enter delete • ↑ to tab bar • Esc back";
      }
      return "Tab/←→ switch tabs • 1-3 quick jump • s=search • ↓ enter list • Esc back";
    }
  })();

  useFooterHelp(footerHelpText);

  // Escape handler
  useEscape("pages", () => {
    // Check for page details modal first (highest priority)
    if (selectedPage) {
      setSelectedPage(null);
      return;
    }

    // Check for export dialog
    if (showExportDialog) {
      setShowExportDialog(false);
      return;
    }

    // Check for confirm delete dialog
    if (confirmDelete) {
      setConfirmDelete(false);
      return;
    }

    // Handle search mode - exit search mode first (pages tab)
    if (currentTab === "pages" && inSearchMode) {
      setInSearchMode(false);
      return;
    }

    // Handle search - clear search if query exists (before exiting) (pages tab)
    if (currentTab === "pages" && pageSearchQuery) {
      setPageSearchQuery("");
      return;
    }

    // Handle search mode - exit search mode first (delete tab)
    if (currentTab === "delete" && inDeleteSearchMode) {
      setInDeleteSearchMode(false);
      return;
    }

    // Handle search - clear search if query exists (before exiting) (delete tab)
    if (currentTab === "delete" && deleteSearchQuery) {
      setDeleteSearchQuery("");
      return;
    }

    if (showFileBrowser) {
      setShowFileBrowser(false);
    } else if (isEditing) {
      setIsEditing(false);
      setInputValue(currentField === 0 ? directory : filename);
    } else if (currentTab === "export") {
      setCurrentTab("pages");
      setInExportContent(false);
    } else if (currentTab === "delete") {
      setCurrentTab("pages");
      setInDeleteContent(false);
    } else if (currentTab === "pages") {
      onEsc?.();
    }
  });

  // Keyboard navigation hook
  usePagesKeyboard({
    currentTab,
    setCurrentTab,
    inPagesContent,
    setInPagesContent,
    inExportContent,
    setInExportContent,
    inDeleteContent,
    setInDeleteContent,
    // Pages tab state
    allPages: filteredPages,
    selectedPageIndex,
    setSelectedPageIndex,
    onNavigatePage: handleNavigatePage,
    onSelectPage: handleSelectPage,
    isPageDetailsOpen: !!selectedPage,
    // Search state
    pageSearchQuery,
    setPageSearchQuery,
    inSearchMode,
    setInSearchMode,
    // Export tab state
    currentField,
    setCurrentField,
    isEditing,
    setIsEditing,
    inputValue,
    setInputValue,
    focusArea,
    setFocusArea,
    selectedButton,
    setSelectedButton,
    showFileBrowser,
    directory,
    filename,
    includeContent,
    onSaveField: handleSaveField,
    onExport: handleExport,
    onBrowse: handleBrowse,
    onCancel: handleCancelExport,
    onToggleIncludeContent: handleToggleIncludeContent,
    // Delete tab state
    deletePagesData: filteredDeletePages,
    selectedDeleteIndex,
    setSelectedDeleteIndex,
    markedForDeletion,
    confirmDelete,
    onToggleMarkForDeletion: handleToggleMarkForDeletion,
    onClearMarked: handleClearMarked,
    onConfirmDelete: handleConfirmDelete,
    // Delete search state
    deleteSearchQuery,
    setDeleteSearchQuery,
    inDeleteSearchMode,
    setInDeleteSearchMode,
  });

  if (!instance) {
    return (
      <Box flexDirection="column">
        <Text color={theme.colors.error}>
          No instance configured. Please run setup first.
        </Text>
      </Box>
    );
  }

  // If export dialog is open, render it
  if (showExportDialog) {
    const fullPath = `${directory}/${filename}`;
    const exportDetails = [
      `• Location: ${fullPath}`,
      `• Pages: ${pages.length} (${pages.filter(p => p.isPublished).length} published, ${pages.filter(p => !p.isPublished).length} unpublished)`,
      `• Include Content: ${includeContent ? "Yes" : "No"}`,
      `• Instance: ${instance}`,
    ];

    return (
      <AsyncActionDialog
        title="EXPORT PAGES"
        message="Confirm export with the following settings:"
        items={exportDetails}
        confirmText="Export"
        cancelText="Cancel"
        loadingMessage="Exporting pages..."
        successMessage={`Successfully exported ${pages.length} pages to ${fullPath}`}
        onConfirm={performExport}
        onSuccess={() => {
          setShowExportDialog(false);
          setStatusMsg("Export complete");
          setCurrentTab("pages");
          setInExportContent(false);
        }}
        onCancel={() => setShowExportDialog(false)}
      />
    );
  }

  // If confirm delete dialog is open, render it
  if (confirmDelete) {
    const pagesToDelete = deletePagesData.filter((p) => markedForDeletion.has(p.id));
    return (
      <AsyncActionDialog
        title="CONFIRM DELETION"
        message={`Are you sure you want to delete ${pagesToDelete.length} page(s)?`}
        confirmText="Yes, delete them"
        cancelText="No, cancel"
        items={pagesToDelete.map((page) => `• ${page.path} - ${page.title}`)}
        destructive={true}
        loadingMessage="Deleting pages..."
        successMessage="Pages deleted successfully!"
        onConfirm={async (setProgress) => {
          // Deletion logic
          const pages = deletePagesData.filter((p) => markedForDeletion.has(p.id));
          let successCount = 0;
          let errorCount = 0;

          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            if (!page) continue;

            setProgress(`Deleting page ${i + 1}/${pages.length}: ${page.path}`);

            try {
              const result = await deletePage(page.id);
              if (result.succeeded) {
                successCount++;
              } else {
                errorCount++;
                logger.error({ pageId: page.id, path: page.path, message: result.message }, "Failed to delete page");
              }
            } catch (error) {
              errorCount++;
              logger.error({ err: error, pageId: page.id, path: page.path }, "Error deleting page");
            }
          }

          // Store counts for status message (will be shown after dialog closes)
          if (errorCount > 0) {
            setStatusMsg(`Delete complete (${errorCount} failed)`);
          } else {
            setStatusMsg("Delete complete");
          }

          // If all failed, throw error to trigger error state
          if (successCount === 0 && errorCount > 0) {
            throw new Error(`Failed to delete all ${errorCount} page(s)`);
          }
        }}
        onSuccess={async () => {
          setConfirmDelete(false);
          setMarkedForDeletion(new Set());
          await loadBothPageSets();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    );
  }

  // If viewing page details, render ONLY the modal (component stays mounted, preserves state)
  if (selectedPage) {
    return (
      <PageDetails
        page={selectedPage}
        instance={instance}
        onClose={() => setSelectedPage(null)}
        onRefresh={loadPagesForList}
        onSetStatus={(message, duration) => {
          setStatusMsg(message);
          if (duration) {
            setTimeout(() => setStatusMsg(""), duration);
          }
        }}
      />
    );
  }

  // Otherwise render the normal interface
  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Tab Navigation */}
      <Box
        paddingX={1}
        borderStyle="single"
        borderColor={
          currentTab === "pages"
            ? theme.colors.primary
            : currentTab === "export"
            ? theme.colors.success
            : theme.colors.error
        }
        flexShrink={0}
      >
        <Text
          color={
            currentTab === "pages"
              ? theme.colors.background
              : theme.colors.primary
          }
          backgroundColor={
            currentTab === "pages" ? theme.colors.primary : undefined
          }
          bold={currentTab === "pages"}
        >
          1. All Pages
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "export"
              ? theme.colors.background
              : theme.colors.success
          }
          backgroundColor={
            currentTab === "export" ? theme.colors.success : undefined
          }
          bold={currentTab === "export"}
        >
          2. Export
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "delete"
              ? theme.colors.background
              : theme.colors.error
          }
          backgroundColor={
            currentTab === "delete" ? theme.colors.error : undefined
          }
          bold={currentTab === "delete"}
        >
          3. Delete
        </Text>
      </Box>

      {/* Tab Content */}
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        {currentTab === "pages" && (
          <AllPagesTab
            pages={filteredPages}
            selectedIndex={selectedPageIndex}
            loading={loadingPages}
            error={pagesError}
            inPagesContent={inPagesContent}
            searchQuery={pageSearchQuery}
            isSearchActive={inSearchMode}
            totalCount={allPages.length}
          />
        )}

        {currentTab === "export" && (
          <ExportTab
            instance={instance}
            directory={directory}
            filename={filename}
            includeContent={includeContent}
            currentField={currentField}
            isEditing={isEditing}
            inputValue={inputValue}
            onInputChange={setInputValue}
            focusArea={focusArea}
            selectedButton={selectedButton}
            error={error}
            pages={pages}
            showFileBrowser={showFileBrowser}
            inExportContent={inExportContent}
            onDirectorySelected={handleDirectorySelected}
            onCloseFileBrowser={() => setShowFileBrowser(false)}
          />
        )}

        {currentTab === "delete" && (
          <DeleteTab
            pages={filteredDeletePages}
            selectedIndex={selectedDeleteIndex}
            markedForDeletion={markedForDeletion}
            loading={loadingDeletePages}
            error={deleteError}
            inDeleteContent={inDeleteContent}
            searchQuery={deleteSearchQuery}
            isSearchActive={inDeleteSearchMode}
            totalCount={deletePagesData.length}
          />
        )}
      </Box>
    </Box>
  );
}
