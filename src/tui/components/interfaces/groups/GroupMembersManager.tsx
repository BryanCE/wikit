import React, { useState, useEffect, useMemo } from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { ConfirmationDialog } from "@comps/modals/ConfirmationDialog";
import { assignUser, unassignUser } from "@/api/groups";
import { listUsers } from "@/api/users";
import type { Group, UserMinimal } from "@/types";
import { MembersTab } from "./MembersTab";
import { AddUsersTab } from "./AddUsersTab";
import { useGroupMembersKeyboard } from "./hooks/useGroupMembersKeyboard";

interface GroupMembersManagerProps {
  group: Group;
  onSuccess: () => void;
  onStatusChange: (message: string) => void;
  onClose: () => void;
}

type TabType = "members" | "add";

export function GroupMembersManager({
  group,
  onSuccess,
  onStatusChange,
  onClose,
}: GroupMembersManagerProps) {
  const { theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<TabType>("members");

  // Mode flags
  const [inMembersContent, setInMembersContent] = useState(false);
  const [inAddContent, setInAddContent] = useState(false);

  // Members tab state
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);
  const [markedForRemoval, setMarkedForRemoval] = useState<Set<number>>(
    new Set()
  );
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Add tab state
  const [availableUsers, setAvailableUsers] = useState<UserMinimal[]>([]);
  const [selectedAddIndex, setSelectedAddIndex] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const members = group.users ?? [];
  const memberIds = new Set(members.map((u) => u.id));
  const nonMembers = availableUsers.filter((u) => !memberIds.has(u.id));

  useHeaderData({
    title: `Manage Members: ${group.name}`,
    metadata: `${members.length} members`,
  });

  useFooterStatus(`Group: ${group.name} | Members: ${members.length}`);

  // Dynamic footer help text
  const footerHelpText = useMemo(() => {
    if (currentTab === "members") {
      if (inMembersContent) {
        return "Tab/1-2 switch tabs • ↑↓ navigate • Space toggle • Enter remove • ↑ to tab bar • Esc back";
      }
      return "Tab/←→ switch tabs • 1-2 quick jump • ↓ enter list • Esc back";
    } else {
      if (inAddContent) {
        return "Tab/1-2 switch tabs • ↑↓ navigate • Enter add user • ↑ to tab bar • Esc back";
      }
      return "Tab/←→ switch tabs • 1-2 quick jump • ↓ enter list • Esc back";
    }
  }, [currentTab, inMembersContent, inAddContent]);

  useFooterHelp(footerHelpText);

  // Load users when switching to add tab
  useEffect(() => {
    if (currentTab === "add" && availableUsers.length === 0) {
      void loadUsers();
    }
  }, [currentTab]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const users = await listUsers({});
      setAvailableUsers(users);
    } catch (error) {
      onStatusChange(
        `Error loading users: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddUser = async (userId: number) => {
    setIsProcessing(true);
    onStatusChange("Adding user to group...");

    try {
      const result = await assignUser(group.id, userId);

      if (result.succeeded) {
        onStatusChange("User added to group successfully");
        setSelectedAddIndex(0);
        onSuccess();
        // Reload users to update non-members list
        await loadUsers();
      } else {
        onStatusChange(`Failed to add user: ${result.message}`);
      }
    } catch (error) {
      onStatusChange(
        `Error adding user: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRemove = async () => {
    if (markedForRemoval.size === 0) return;

    setIsProcessing(true);
    setShowRemoveConfirm(false);

    const marked = Array.from(markedForRemoval);
    onStatusChange(`Removing ${marked.length} user(s) from group...`);

    let successCount = 0;
    let errorCount = 0;

    for (const userId of marked) {
      try {
        const result = await unassignUser(group.id, userId);
        if (result.succeeded) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setMarkedForRemoval(new Set());
    setIsProcessing(false);

    onStatusChange(
      `Removed ${successCount} user(s)${
        errorCount > 0 ? `, ${errorCount} failed` : ""
      }`
    );

    onSuccess();
  };

  // Escape handler
  useEscape("group-members", () => {
    if (showRemoveConfirm) {
      setShowRemoveConfirm(false);
    } else if (inMembersContent) {
      setInMembersContent(false);
    } else if (inAddContent) {
      setInAddContent(false);
    } else {
      onClose();
    }
  });

  // Keyboard navigation hook
  useGroupMembersKeyboard({
    currentTab,
    setCurrentTab,
    inMembersContent,
    setInMembersContent,
    inAddContent,
    setInAddContent,
    members,
    selectedMemberIndex,
    setSelectedMemberIndex,
    markedForRemoval,
    setMarkedForRemoval,
    onShowRemoveConfirm: () => setShowRemoveConfirm(true),
    nonMembers,
    selectedAddIndex,
    setSelectedAddIndex,
    onAddUser: (userId: number) => {
      void handleAddUser(userId);
    },
    isLoading: isProcessing || isLoadingUsers,
  });

  // Show confirmation dialog
  if (showRemoveConfirm) {
    const usersToRemove = members.filter((u) => markedForRemoval.has(u.id));
    return (
      <ConfirmationDialog
        title="Remove Users from Group?"
        message={`Remove ${markedForRemoval.size} user(s) from "${group.name}"?`}
        confirmText="Yes, remove"
        cancelText="No, cancel"
        items={usersToRemove.slice(0, 5).map((u) => u.name)}
        onConfirm={() => void handleBulkRemove()}
        onCancel={() => setShowRemoveConfirm(false)}
        destructive={false}
      />
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Tab Navigation */}
      <Box
        paddingX={1}
        borderStyle="single"
        borderColor={
          currentTab === "members" ? theme.colors.error : theme.colors.success
        }
        flexShrink={0}
      >
        <Text
          color={
            currentTab === "members"
              ? theme.colors.background
              : theme.colors.error
          }
          backgroundColor={
            currentTab === "members" ? theme.colors.error : undefined
          }
          bold={currentTab === "members"}
        >
          1. Remove Users
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "add"
              ? theme.colors.background
              : theme.colors.success
          }
          backgroundColor={
            currentTab === "add" ? theme.colors.success : undefined
          }
          bold={currentTab === "add"}
        >
          2. Add Users
        </Text>
      </Box>

      {/* Tab Content */}
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        {currentTab === "members" && (
          <MembersTab
            members={members}
            selectedIndex={selectedMemberIndex}
            markedForRemoval={markedForRemoval}
            inMembersContent={inMembersContent}
          />
        )}

        {currentTab === "add" && (
          <AddUsersTab
            nonMembers={nonMembers}
            selectedIndex={selectedAddIndex}
            inAddContent={inAddContent}
            isLoading={isLoadingUsers}
          />
        )}
      </Box>
    </Box>
  );
}
