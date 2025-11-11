import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { ConfirmationDialog } from "@comps/modals/ConfirmationDialog";
import { listUsers, deleteUser } from "@/api/users";
import type { UserMinimal } from "@/types";

interface UserDeleteDialogProps {
  user: UserMinimal;
  instance?: string;
  onSuccess: () => void;
  onStatusChange: (message: string) => void;
}

export function UserDeleteDialog({
  user,
  instance,
  onSuccess,
  onStatusChange,
}: UserDeleteDialogProps) {
  const { theme } = useTheme();
  const [replacementUsers, setReplacementUsers] = useState<UserMinimal[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useFooterHelp("↑↓=navigate • Enter=select replacement • Esc=back");

  useEffect(() => {
    void loadReplacementUsers();
  }, [instance]);

  const loadReplacementUsers = async () => {
    setLoading(true);
    try {
      const users = await listUsers({}, instance);
      const filtered = users.filter((u) => u.id !== user.id && !u.isSystem);
      setReplacementUsers(filtered);
    } catch (error) {
      onStatusChange(
        `Error loading users: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (replacementUsers.length === 0) {
      onStatusChange("No replacement user available");
      return;
    }

    const replacementUser = replacementUsers[selectedIndex];
    if (!replacementUser) {
      onStatusChange("Please select a replacement user");
      return;
    }

    setIsDeleting(true);
    onStatusChange(`Deleting user ${user.name}...`);

    try {
      const response = await deleteUser(user.id, replacementUser.id, instance);

      if (response.responseResult.succeeded) {
        onStatusChange(
          `User ${user.name} deleted successfully! Content reassigned to ${replacementUser.name}`
        );
        onSuccess();
      } else {
        onStatusChange(
          `Failed to delete user: ${response.responseResult.message}`
        );
        setIsDeleting(false);
        setShowConfirmation(false);
      }
    } catch (error) {
      onStatusChange(
        `Error deleting user: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  useInput((input, key) => {
    if (loading || isDeleting || showConfirmation) return;

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) =>
        Math.min(replacementUsers.length - 1, prev + 1)
      );
    } else if (key.return) {
      if (replacementUsers.length > 0) {
        setShowConfirmation(true);
      }
    }
  });

  if (loading) {
    return (
      <Box>
        <Text color={theme.colors.muted}>Loading users...</Text>
      </Box>
    );
  }

  if (showConfirmation && replacementUsers[selectedIndex]) {
    const replacementUser = replacementUsers[selectedIndex];
    return (
      <ConfirmationDialog
        title="⚠️ CONFIRM USER DELETION"
        message={`Are you sure you want to delete user "${user.name}"?\n\nAll content will be reassigned to: ${replacementUser.name} (${replacementUser.email})`}
        confirmText="Yes, delete user"
        cancelText="No, cancel"
        onConfirm={() => void handleDelete()}
        onCancel={() => setShowConfirmation(false)}
        destructive={true}
      />
    );
  }

  if (replacementUsers.length === 0) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color={theme.colors.error} bold>
            Cannot Delete User
          </Text>
        </Box>
        <Box marginBottom={1}>
          <Text color={theme.colors.text}>
            No replacement users available. At least one other non-system user
            is required to delete this user.
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.error} bold>
          Delete User: {user.name}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.warning}>
          Select a user to reassign content from {user.name}:
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Box marginBottom={1}>
          <Text color={theme.colors.muted}>
            {"ID".padEnd(6)}
            {"Name".padEnd(25)}
            {"Email".padEnd(30)}
            {"Active"}
          </Text>
        </Box>

        {replacementUsers.map((replacementUser, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Box key={replacementUser.id}>
              <Text
                color={isSelected ? theme.colors.accent : theme.colors.text}
                bold={isSelected}
              >
                {isSelected ? "▶ " : "  "}
                {String(replacementUser.id).padEnd(6)}
                {replacementUser.name.padEnd(25)}
                {replacementUser.email.padEnd(30)}
                {replacementUser.isActive ? "[X]" : "[ ]"}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1}>
        <Text color={theme.colors.danger}>
          Warning: This action cannot be undone!
        </Text>
      </Box>
    </Box>
  );
}
