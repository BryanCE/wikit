import React, { useState } from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { deleteGroup } from "@/api/groups";
import { ConfirmationDialog } from "../../modals/ConfirmationDialog";
import type { GroupMinimal } from "@/types";

interface GroupDeleteDialogProps {
  group: GroupMinimal;
  instance: string;
  onSuccess: () => void;
  onStatusChange: (message: string) => void;
}

export function GroupDeleteDialog({
  group,
  instance,
  onSuccess,
  onStatusChange,
}: GroupDeleteDialogProps) {
  const { theme } = useTheme();
  const [confirmed, setConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteGroup = async () => {
    setIsDeleting(true);
    onStatusChange(`Deleting group "${group.name}"...`);

    try {
      const result = await deleteGroup(group.id, instance);

      if (result.succeeded) {
        onStatusChange(`Group "${group.name}" deleted successfully`);
        onSuccess();
      } else {
        onStatusChange(`Failed to delete group: ${result.message}`);
        setIsDeleting(false);
      }
    } catch (error) {
      onStatusChange(
        `Error deleting group: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setIsDeleting(false);
    }
  };

  if (group.isSystem) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color={theme.colors.error} bold>
            Cannot Delete System Group
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.warning}>
            System groups cannot be deleted: {group.name}
          </Text>
        </Box>
      </Box>
    );
  }

  if (isDeleting) {
    return (
      <Box flexDirection="column">
        <Text color={theme.colors.warning}>Deleting group...</Text>
      </Box>
    );
  }

  // First confirmation
  if (!confirmed) {
    return (
      <ConfirmationDialog
        title="Delete Group"
        message={`Are you sure you want to delete "${group.name}" (ID: ${group.id}, ${group.userCount ?? 0} members)?`}
        confirmText="Continue"
        cancelText="Cancel"
        destructive={true}
        onConfirm={() => setConfirmed(true)}
        onCancel={onSuccess}
      />
    );
  }

  // Final confirmation
  return (
    <ConfirmationDialog
      title="FINAL CONFIRMATION"
      message={`This will permanently delete "${group.name}". This action cannot be undone!`}
      confirmText="Delete"
      cancelText="Go Back"
      destructive={true}
      onConfirm={handleDeleteGroup}
      onCancel={() => setConfirmed(false)}
    />
  );
}
