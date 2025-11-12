import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { useSearch } from "@/tui/hooks/useSearch";
import * as userApi from "@/api/users";
import type { UserMinimal, UsersInterfaceMode, User } from "@/types";
import { AllUsersTab } from "./AllUsersTab";
import { ImportTab } from "./ImportTab";
import { ExportTab } from "./ExportTab";
import { CreateUserTab } from "./CreateUserTab";
import { ConfirmationDialog } from "@comps/modals/ConfirmationDialog";
import { useUserActions } from "./useUserActions";
import { exportUsersCommand, importUsersCommand } from "@/commands/users";

interface UsersInterfaceProps {
  onEsc?: () => void;
}

type TabType = "users" | "import" | "export" | "create";

export function UsersInterface({
  onEsc,
}: UsersInterfaceProps) {
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserMinimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>("users");
  const [statusMsg, setStatusMsg] = useState("");

  // State for All Users tab
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<UsersInterfaceMode>("list");
  const [selectedUser, setSelectedUser] = useState<UserMinimal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mode flags
  const [inUserList, setInUserList] = useState(false);
  const [inCreateForm, setInCreateForm] = useState(false);

  // Import/Export tab state
  const [inImportExportContent, setInImportExportContent] = useState(false);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [focusArea, setFocusArea] = useState<"fields" | "buttons">("fields");
  const [importExportError, setImportExportError] = useState<string | null>(null);

  // Import state
  const [importFilePath, setImportFilePath] = useState("");
  const [importSelectedButton, setImportSelectedButton] = useState<"import" | "clear">("import");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  // Export state
  const [exportDirectory, setExportDirectory] = useState(".");
  const [exportFilename, setExportFilename] = useState("");
  const [exportCurrentField, setExportCurrentField] = useState(0);
  const [exportIsEditing, setExportIsEditing] = useState(false);
  const [exportInputValue, setExportInputValue] = useState("");
  const [exportSelectedButton, setExportSelectedButton] = useState<"export" | "browse" | "cancel">("export");
  const [isExporting, setIsExporting] = useState(false);

  // Search for users
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [inUserSearchMode, setInUserSearchMode] = useState(false);

  // Filtered results using search hook
  const filteredUsers = useSearch(users, userSearchQuery, ["name", "email", "providerKey"]);

  const loadUsers = async () => {
    setLoading(true);
    setStatusMsg("Loading users...");
    try {
      const userList = await userApi.listUsers({});
      setUsers(userList);
      setStatusMsg(`${userList.length} users loaded`);
    } catch (error) {
      const errorMsg = `Error loading users: ${
        error instanceof Error ? error.message : String(error)
      }`;
      setStatusMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const {
    pendingAction,
    fullUser,
    setFullUser,
    handleAction,
    executeConfirmedAction,
    cancelPendingAction,
    getConfirmationMessage,
  } = useUserActions({
    onStatusChange: setStatusMsg,
    onModeChange: setMode,
    onUserUpdate: () => { void loadUsers(); },
  });

  // Dynamic footer help - each tab sets its own
  const footerHelpText = null;

  useFooterHelp(footerHelpText);
  useFooterStatus(statusMsg);
  useHeaderData({ title: "User Management", metadata: `${users.length} users` });

  // Escape handler
  useEscape("users", () => {
    // Handle import confirmation
    if (showImportConfirm) {
      setShowImportConfirm(false);
      return;
    }

    // Handle file browser
    if (showFileBrowser) {
      setShowFileBrowser(false);
      return;
    }

    // Handle search mode - exit search mode first
    if (currentTab === "users" && inUserSearchMode) {
      setInUserSearchMode(false);
      return;
    }

    // Handle search - clear search if query exists
    if (currentTab === "users" && userSearchQuery) {
      setUserSearchQuery("");
      return;
    }

    // Handle escape based on current tab and mode
    if (currentTab === "create") {
      if (inCreateForm) {
        // Exit create form content mode
        setInCreateForm(false);
      } else {
        // From tab bar: go back to users tab
        setCurrentTab("users");
      }
    } else if (currentTab === "import") {
      if (importResult) {
        // Clear import results, go back to form
        setImportResult(null);
        setImportExportError(null);
      } else if (inImportExportContent) {
        // Exit content mode (back to tab bar)
        setInImportExportContent(false);
      } else {
        // From tab bar: exit to main menu
        onEsc?.();
      }
    } else if (currentTab === "export") {
      // Handle export editing mode
      if (exportIsEditing) {
        setExportIsEditing(false);
        const FORM_FIELDS = [
          { key: "directory", label: "Directory" },
          { key: "filename", label: "Filename" },
        ];
        const field = FORM_FIELDS[exportCurrentField];
        if (field) {
          setExportInputValue(field.key === "directory" ? exportDirectory : exportFilename);
        }
        return;
      }

      if (inImportExportContent) {
        // Exit content mode (back to tab bar)
        setInImportExportContent(false);
      } else {
        // From tab bar: exit to main menu
        onEsc?.();
      }
    } else if (currentTab === "users") {
      // Check content mode FIRST before checking modes
      if (mode !== "list" && inUserList) {
        // In nested mode (action/detail/edit) while in content - go back one mode level
        if (mode === "action") {
          setMode("list");
          setSelectedUser(null);
        } else if (mode === "detail") {
          setMode("action");
        } else if (mode === "edit") {
          setMode("action");
        } else if (mode === "delete") {
          setMode("action");
        } else if (mode === "confirm") {
          cancelPendingAction();
        }
      } else if (mode === "list" && inUserList) {
        // In list while in content mode - exit content mode
        setInUserList(false);
      } else if (mode === "list") {
        // At tab bar level - exit to main menu
        onEsc?.();
      } else {
        // In nested mode but NOT in content (shouldn't happen but handle it)
        setMode("list");
        setSelectedUser(null);
      }
    }
  });

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    // Initialize export filename with current date
    const date = new Date().toISOString().split("T")[0];
    setExportFilename(`users-export-${date}.json`);
  }, []);

  // Tab navigation
  useInput((input, key) => {
    if (loading) return;

    // Block input when dialogs/modals are open
    if (showDeleteConfirm || mode === "confirm" ||
        showImportConfirm ||
        showFileBrowser || isImporting || isExporting) {
      return;
    }

    const inAnyContentMode = inUserList || inCreateForm || inImportExportContent;

    // Tab key cycles through tabs, exits content modes
    if (key.tab) {
      setInUserList(false);
      setInCreateForm(false);
      setInImportExportContent(false);
      setSelectedIndex(0);
      const tabs: TabType[] = ["users", "import", "export", "create"];
      const currentIndex = tabs.indexOf(currentTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      const nextTab = tabs[nextIndex];
      if (nextTab) setCurrentTab(nextTab);
      return;
    }

    // Arrow navigation for tabs ONLY when NOT in content mode
    if (key.rightArrow && !inAnyContentMode) {
      setSelectedIndex(0);
      const tabs: TabType[] = ["users", "import", "export", "create"];
      const currentIndex = tabs.indexOf(currentTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      const nextTab = tabs[nextIndex];
      if (nextTab) setCurrentTab(nextTab);
      return;
    }
    if (key.leftArrow && !inAnyContentMode) {
      setSelectedIndex(0);
      const tabs: TabType[] = ["users", "import", "export", "create"];
      const currentIndex = tabs.indexOf(currentTab);
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      const prevTab = tabs[prevIndex];
      if (prevTab) setCurrentTab(prevTab);
      return;
    }

    // Quick tab keys 1-4
    if (input === "1") {
      setCurrentTab("users");
      setInUserList(false);
      setInImportExportContent(false);
      setInCreateForm(false);
      setSelectedIndex(0);
      return;
    }
    if (input === "2") {
      setCurrentTab("import");
      setInUserList(false);
      setInImportExportContent(false);
      setInCreateForm(false);
      return;
    }
    if (input === "3") {
      setCurrentTab("export");
      setInUserList(false);
      setInImportExportContent(false);
      setInCreateForm(false);
      return;
    }
    if (input === "4") {
      setCurrentTab("create");
      setInUserList(false);
      setInImportExportContent(false);
      setInCreateForm(false);
      return;
    }

    // USERS TAB: Search and navigation
    if (currentTab === "users" && mode === "list") {
      // 's' key enters search mode from tab bar or content
      if (input === "s" && !inUserSearchMode) {
        setInUserSearchMode(true);
        return;
      }

      // Search mode handling
      if (inUserSearchMode) {
        // All typing goes to search (including numbers 1-4)
        if (!key.upArrow && !key.downArrow && !key.return && input && input.length === 1) {
          setUserSearchQuery((prev) => prev + input);
          return;
        }

        // Backspace edits search
        if (key.backspace) {
          setUserSearchQuery((prev) => prev.slice(0, -1));
          return;
        }

        // Down arrow exits search mode and enters content
        if (key.downArrow) {
          setInUserSearchMode(false);
          setInUserList(true);
          return;
        }
      }

      // Exit content mode with up arrow (from anywhere in the list)
      if (inUserList && key.upArrow) {
        if (selectedIndex === 0) {
          setInUserList(false);
          return;
        } else {
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          return;
        }
      }

      // Enter content mode (when not in search)
      if (!inUserList && !inUserSearchMode && key.downArrow) {
        setInUserList(true);
        return;
      }

      // Content navigation
      if (inUserList) {
        if (key.downArrow) {
          setSelectedIndex((prev) => Math.min(filteredUsers.length - 1, prev + 1));
          return;
        }
        if (key.return) {
          const user = filteredUsers[selectedIndex];
          if (user) {
            // Clear search when selecting a user
            setUserSearchQuery("");
            setInUserSearchMode(false);
            handleSelect(user);
          }
          return;
        }
      }
    }


    // IMPORT TAB: Navigation
    if (currentTab === "import") {
      // Enter content mode
      if (!inImportExportContent && key.downArrow) {
        setInImportExportContent(true);
        return;
      }

      if (inImportExportContent) {
        // IMPORT MODE
        // Navigate between field and buttons, or exit content mode
        if (key.upArrow) {
          if (focusArea === "fields") {
            // At top of form - exit content mode
            setInImportExportContent(false);
            return;
          } else if (focusArea === "buttons") {
            setFocusArea("fields");
            return;
          }
        }
        if (key.downArrow) {
          if (focusArea === "fields") {
            setFocusArea("buttons");
          }
          return;
        }

        // Field area: Space to open file browser
        if (focusArea === "fields" && input === " ") {
          setShowFileBrowser(true);
          return;
        }

        // Buttons area: Navigate and execute
        if (focusArea === "buttons") {
          if (key.leftArrow) {
            setImportSelectedButton("import");
            return;
          }
          if (key.rightArrow) {
            setImportSelectedButton("clear");
            return;
          }
          if (key.return) {
            if (importSelectedButton === "import") {
              void handleImport();
            } else {
              handleClearImport();
            }
            return;
          }
        }
      }
    }

    // EXPORT TAB: Navigation
    if (currentTab === "export") {
      // Enter content mode
      if (!inImportExportContent && key.downArrow) {
        setInImportExportContent(true);
        return;
      }

      if (inImportExportContent) {
        // EXPORT MODE
        if (exportIsEditing) {
          // Editing a field
          if (key.return) {
            // Save field
            if (exportCurrentField === 0) {
              setExportDirectory(exportInputValue);
            } else {
              setExportFilename(exportInputValue);
            }
            setExportIsEditing(false);
          } else if (key.backspace || key.delete) {
            setExportInputValue((prev) => prev.slice(0, -1));
          } else if (input) {
            setExportInputValue((prev) => prev + input);
          }
        } else {
          // Not editing
          if (key.upArrow) {
            if (focusArea === "fields" && exportCurrentField === 0) {
              // At top of form - exit content mode
              setInImportExportContent(false);
              return;
            } else if (focusArea === "fields") {
              setExportCurrentField(Math.max(0, exportCurrentField - 1));
              return;
            } else if (focusArea === "buttons") {
              setFocusArea("fields");
              setExportCurrentField(1); // Move to last field
              return;
            }
          }
          if (key.downArrow) {
            if (focusArea === "fields" && exportCurrentField < 1) {
              setExportCurrentField(exportCurrentField + 1);
              return;
            } else if (focusArea === "fields") {
              setFocusArea("buttons");
              return;
            }
          }

          // Field area: Enter to edit
          if (focusArea === "fields" && key.return) {
            const FORM_FIELDS = [
              { key: "directory", label: "Directory" },
              { key: "filename", label: "Filename" },
            ];
            const field = FORM_FIELDS[exportCurrentField];
            if (field) {
              setExportInputValue(field.key === "directory" ? exportDirectory : exportFilename);
              setExportIsEditing(true);
            }
            return;
          }

          // Buttons area: Navigate and execute
          if (focusArea === "buttons") {
            if (key.leftArrow) {
              const buttons: Array<"export" | "browse" | "cancel"> = ["export", "browse", "cancel"];
              const currentIndex = buttons.indexOf(exportSelectedButton);
              const newIndex = Math.max(0, currentIndex - 1);
              const newButton = buttons[newIndex];
              if (newButton) setExportSelectedButton(newButton);
              return;
            }
            if (key.rightArrow) {
              const buttons: Array<"export" | "browse" | "cancel"> = ["export", "browse", "cancel"];
              const currentIndex = buttons.indexOf(exportSelectedButton);
              const newIndex = Math.min(buttons.length - 1, currentIndex + 1);
              const newButton = buttons[newIndex];
              if (newButton) setExportSelectedButton(newButton);
              return;
            }
            if (key.return) {
              if (exportSelectedButton === "export") {
                void handleExport();
              } else if (exportSelectedButton === "browse") {
                handleExportBrowse();
              } else {
                handleExportCancel();
              }
              return;
            }
          }
        }
      }
    }

    // CREATE TAB: Enter/exit content mode
    if (currentTab === "create") {
      if (!inCreateForm && key.downArrow) {
        setInCreateForm(true);
        return;
      }
      // Note: The form itself handles its own up arrow navigation,
      // but we need to ensure it can exit when appropriate
      // This is handled by the form's internal logic
    }
  });

  const handleSelect = (user: UserMinimal) => {
    setSelectedUser(user);
    setMode("action");
  };

  const handleUserUpdate = () => {
    void loadUsers();
    setMode("list");
    setFullUser(null);
  };

  // Import handlers
  const handleImport = () => {
    if (!importFilePath) {
      setImportExportError("Please select a file");
      return;
    }
    // Show confirmation dialog
    setShowImportConfirm(true);
  };

  const executeImport = async () => {
    setShowImportConfirm(false);
    setIsImporting(true);
    setImportExportError(null);
    setStatusMsg("Importing users...");

    try {
      const result = await importUsersCommand(importFilePath);

      setImportResult(result);
      setStatusMsg(`Import complete: ${result.success} success, ${result.failed} failed`);

      if (result.success > 0) {
        await loadUsers();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setImportExportError(errorMsg);
      setStatusMsg(`Import error: ${errorMsg}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearImport = () => {
    setImportFilePath("");
    setImportExportError(null);
    setImportResult(null);
    setStatusMsg("Import cleared");
  };

  // Export handlers
  const handleExport = async () => {
    setIsExporting(true);
    setImportExportError(null);
    setStatusMsg("Exporting users...");

    try {
      const path = await import("path");
      const fullPath = path.join(exportDirectory, exportFilename);
      const result = await exportUsersCommand(fullPath);

      if (result.success) {
        setStatusMsg(`Exported ${result.userCount} users to ${exportFilename}`);
        setInImportExportContent(false);
      } else {
        setImportExportError(result.message);
        setStatusMsg(`Export failed: ${result.message}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setImportExportError(errorMsg);
      setStatusMsg(`Export error: ${errorMsg}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportBrowse = () => {
    setShowFileBrowser(true);
  };

  const handleExportCancel = () => {
    setCurrentTab("import");
    setInImportExportContent(false);
  };

  const handleExportDirectorySelected = (selectedPath: string) => {
    setExportDirectory(selectedPath);
    setShowFileBrowser(false);
  };

  if (loading) {
    return (
      <Box flexDirection="column">
        <Text color={theme.colors.muted}>Loading users...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Tab Navigation - 4 tabs */}
      <Box
        paddingX={1}
        borderStyle="single"
        borderColor={theme.colors.primary}
        flexShrink={0}
      >
        <Text
          color={currentTab === "users" ? theme.colors.background : theme.colors.primary}
          backgroundColor={currentTab === "users" ? theme.colors.primary : undefined}
          bold={currentTab === "users"}
        >
          1. All Users
        </Text>
        <Text> | </Text>
        <Text
          color={currentTab === "import" ? theme.colors.background : theme.colors.info}
          backgroundColor={currentTab === "import" ? theme.colors.info : undefined}
          bold={currentTab === "import"}
        >
          2. Import
        </Text>
        <Text> | </Text>
        <Text
          color={currentTab === "export" ? theme.colors.background : theme.colors.warning}
          backgroundColor={currentTab === "export" ? theme.colors.warning : undefined}
          bold={currentTab === "export"}
        >
          3. Export
        </Text>
        <Text> | </Text>
        <Text
          color={currentTab === "create" ? theme.colors.background : theme.colors.success}
          backgroundColor={currentTab === "create" ? theme.colors.success : undefined}
          bold={currentTab === "create"}
        >
          4. Create User
        </Text>
      </Box>

      {/* Import Confirmation */}
      {showImportConfirm && (
        <ConfirmationDialog
          title="Import Users?"
          message={`Import users from ${importFilePath}?`}
          confirmText="Import"
          cancelText="Cancel"
          onConfirm={() => void executeImport()}
          onCancel={() => setShowImportConfirm(false)}
          destructive={false}
        />
      )}

      {/* Tab Content */}
      {!showImportConfirm && (
        <Box flexGrow={1} flexDirection="column" overflow="hidden">
          {currentTab === "users" && (
          <AllUsersTab
            users={filteredUsers}
            selectedIndex={selectedIndex}
            mode={mode}
            selectedUser={selectedUser}
            fullUser={fullUser}
            onStatusChange={setStatusMsg}
            onUserUpdate={handleUserUpdate}
            onAction={handleAction}
            pendingAction={pendingAction}
            onConfirmAction={() => void executeConfirmedAction()}
            onCancelAction={cancelPendingAction}
            getConfirmationMessage={getConfirmationMessage}
            showDeleteConfirm={showDeleteConfirm}
            setShowDeleteConfirm={setShowDeleteConfirm}
            inUserList={inUserList}
            searchQuery={userSearchQuery}
            isSearchActive={inUserSearchMode}
            totalUserCount={users.length}
          />
        )}

        {currentTab === "import" && (
          <ImportTab
            inContent={inImportExportContent}
            focusArea={focusArea}
            showFileBrowser={showFileBrowser}
            error={importExportError}
            importFilePath={importFilePath}
            importSelectedButton={importSelectedButton}
            isImporting={isImporting}
            importResult={importResult}
            setImportFilePath={setImportFilePath}
            setShowFileBrowser={setShowFileBrowser}
          />
        )}

        {currentTab === "export" && (
          <ExportTab
            inContent={inImportExportContent}
            focusArea={focusArea}
            showFileBrowser={showFileBrowser}
            error={importExportError}
            exportDirectory={exportDirectory}
            exportFilename={exportFilename}
            exportCurrentField={exportCurrentField}
            exportIsEditing={exportIsEditing}
            exportInputValue={exportInputValue}
            exportSelectedButton={exportSelectedButton}
            isExporting={isExporting}
            userCount={users.length}
            setShowFileBrowser={setShowFileBrowser}
            onExportDirectorySelected={handleExportDirectorySelected}
          />
        )}

        {currentTab === "create" && (
          <CreateUserTab
            onStatusChange={setStatusMsg}
            onSuccess={() => {
              void loadUsers();
              setCurrentTab("users");
            }}
            onCancel={() => setCurrentTab("users")}
            isActiveTab={currentTab === "create"}
            inCreateForm={inCreateForm}
            onExitForm={() => setInCreateForm(false)}
          />
        )}
        </Box>
      )}
    </Box>
  );
}
