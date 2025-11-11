import React from "react";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import type { UserMinimal, User, UsersInterfaceMode } from "@/types";
import { UserActionMenu } from "./UserActionMenu";
import { UserDetailView } from "./UserDetailView";
import { UserEditForm } from "./UserEditForm";
import { UserDeleteDialog } from "./UserDeleteDialog";
import { UsersList } from "./UsersList";
import { ConfirmationDialog } from "@comps/modals/ConfirmationDialog";

interface AllUsersTabProps {
  users: UserMinimal[];
  selectedIndex: number;
  mode: UsersInterfaceMode;
  selectedUser: UserMinimal | null;
  fullUser: User | null;
  onStatusChange: (message: string) => void;
  onUserUpdate: () => void;
  onAction: (action: string, user: UserMinimal) => void;
  pendingAction: { action: string; user: UserMinimal } | null;
  onConfirmAction: () => void;
  onCancelAction: () => void;
  getConfirmationMessage: (action: string, userName: string) => { title: string; message: string; isDestructive: boolean };
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (value: boolean) => void;
  inUserList: boolean;
  searchQuery?: string;
  isSearchActive?: boolean;
  totalUserCount?: number;
}

export function AllUsersTab({
  users,
  selectedIndex,
  mode,
  selectedUser,
  fullUser,
  onStatusChange,
  onUserUpdate,
  onAction,
  pendingAction,
  onConfirmAction,
  onCancelAction,
  getConfirmationMessage,
  showDeleteConfirm,
  setShowDeleteConfirm,
  inUserList,
  searchQuery = "",
  isSearchActive = false,
  totalUserCount,
}: AllUsersTabProps) {
  // Set footer help text
  const footerHelp = mode === "list" && inUserList
    ? formatHelpText("Tab/1-4=switch tabs", HELP_TEXT.NAVIGATE, HELP_TEXT.ENTER_SELECT, HELP_TEXT.BACK)
    : formatHelpText("Tab/←→ switch tabs", "1-4 quick jump", "type to search", "↓ enter list", HELP_TEXT.BACK);

  useFooterHelp(footerHelp);

  // Render different views based on mode
  if (mode === "action" && selectedUser) {
    return <UserActionMenu user={selectedUser} onAction={(action) => onAction(action, selectedUser)} />;
  }

  if (mode === "detail" && fullUser) {
    return <UserDetailView user={fullUser} />;
  }

  if (mode === "edit" && fullUser) {
    return (
      <UserEditForm
        user={fullUser}
        onSuccess={onUserUpdate}
        onStatusChange={onStatusChange}
      />
    );
  }

  if (mode === "delete" && selectedUser && showDeleteConfirm) {
    return (
      <ConfirmationDialog
        title="Delete User?"
        message={`Are you sure you want to delete ${selectedUser.name}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          // Handle actual delete here or via callback
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
        }}
        destructive={true}
      />
    );
  }

  if (mode === "delete" && selectedUser) {
    return (
      <UserDeleteDialog
        user={selectedUser}
        onSuccess={onUserUpdate}
        onStatusChange={onStatusChange}
      />
    );
  }

  if (mode === "confirm" && pendingAction) {
    const confirmation = getConfirmationMessage(
      pendingAction.action,
      pendingAction.user.name
    );
    return (
      <ConfirmationDialog
        title={confirmation.title}
        message={confirmation.message}
        confirmText="Yes, proceed"
        cancelText="No, cancel"
        onConfirm={onConfirmAction}
        onCancel={onCancelAction}
        destructive={confirmation.isDestructive}
      />
    );
  }

  // Default: show user list
  return (
    <UsersList
      users={users}
      selectedIndex={selectedIndex}
      inUserList={inUserList}
      searchQuery={searchQuery}
      isSearchActive={isSearchActive}
      totalCount={totalUserCount}
    />
  );
}
