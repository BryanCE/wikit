import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { updateUser } from "@/api/users";
import { GroupSelector } from "./GroupSelector";
import { AsyncActionDialog } from "../../modals/AsyncActionDialog";
import { ConfirmationDialog } from "../../modals/ConfirmationDialog";
import { Button } from "../../ui/Button";
import { logger } from "@/utils/logger";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";
import type { User, UpdateUserInput, GroupMinimal } from "@/types";

interface UserEditFormProps {
  user: User;
  onSuccess: () => void;
  onStatusChange: (message: string) => void;
}

interface FormField {
  key: keyof UpdateUserInput;
  label: string;
  placeholder: string;
  editable: boolean;
}

const FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", placeholder: "Full name", editable: true },
  {
    key: "email",
    label: "Email",
    placeholder: "email@example.com",
    editable: true,
  },
  {
    key: "location",
    label: "Location",
    placeholder: "City, Country",
    editable: true,
  },
  {
    key: "jobTitle",
    label: "Job Title",
    placeholder: "Position",
    editable: true,
  },
  { key: "timezone", label: "Timezone", placeholder: "UTC", editable: true },
  {
    key: "dateFormat",
    label: "Date Format",
    placeholder: "YYYY-MM-DD",
    editable: true,
  },
  {
    key: "appearance",
    label: "Appearance",
    placeholder: "light/dark",
    editable: true,
  },
];

export function UserEditForm({
  user,
  onSuccess,
  onStatusChange,
}: UserEditFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<UpdateUserInput>({
    id: user.id,
    name: user.name,
    email: user.email,
    location: user.location ?? "",
    jobTitle: user.jobTitle ?? "",
    timezone: user.timezone,
    dateFormat: user.dateFormat,
    appearance: user.appearance,
    groups: user.groups.map((g: GroupMinimal) => g.id),
  });
  const [currentField, setCurrentField] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [showGroupConfirmation, setShowGroupConfirmation] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [pendingGroupIds, setPendingGroupIds] = useState<number[]>([]);

  const helpText = isEditing
    ? COMMON_HELP_PATTERNS.FORM_EDITING
    : COMMON_HELP_PATTERNS.FORM_SELECT_FIELD;

  useFooterHelp(helpText);

  useEffect(() => {
    const field = FORM_FIELDS[currentField];
    if (field) {
      const value = formData[field.key];
      setInputValue(typeof value === "string" ? value : "");
    }
  }, [currentField]);

  const navigateFields = (direction: "up" | "down") => {
    if (isEditing) return;

    let newFieldIndex = currentField;
    if (direction === "up") {
      newFieldIndex = Math.max(0, currentField - 1);
    } else {
      // Allow navigation to Groups (FORM_FIELDS.length) and Save (FORM_FIELDS.length + 1)
      newFieldIndex = Math.min(FORM_FIELDS.length + 1, currentField + 1);
    }

    setCurrentField(newFieldIndex);

    if (newFieldIndex < FORM_FIELDS.length) {
      const field = FORM_FIELDS[newFieldIndex];
      if (field) {
        const value = formData[field.key];
        setInputValue(typeof value === "string" ? value : "");
      }
    }
  };

  const startEditing = () => {
    // Groups field
    if (currentField === FORM_FIELDS.length) {
      setShowGroupSelector(true);
      return;
    }

    // Save field
    if (currentField === FORM_FIELDS.length + 1) {
      setShowSaveConfirmation(true);
      return;
    }

    const field = FORM_FIELDS[currentField];
    if (field && field.editable) {
      const value = formData[field.key];
      setInputValue(typeof value === "string" ? value : "");
      setIsEditing(true);
    }
  };

  const saveField = () => {
    const field = FORM_FIELDS[currentField];
    if (field) {
      setFormData((prev) => ({
        ...prev,
        [field.key]: inputValue,
      }));
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    onStatusChange("Saving user changes...");

    try {
      const response = await updateUser(formData);

      if (response.responseResult.succeeded) {
        onStatusChange("User updated successfully!");
        onSuccess();
      } else {
        onStatusChange(
          `Failed to update user: ${response.responseResult.message}`
        );
        setIsSaving(false);
      }
    } catch (error) {
      onStatusChange(
        `Error updating user: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setIsSaving(false);
    }
  };

  useInput((input, key) => {
    if (isSaving || showGroupSelector || showGroupConfirmation || showSaveConfirmation) return;

    if (isEditing) {
      // TextInput handles all input - we just need to handle save
      if (key.return) {
        saveField();
      }
      // TextInput component handles all other input (typing, backspace, etc)
    } else {
      if (key.upArrow) {
        navigateFields("up");
      } else if (key.downArrow) {
        navigateFields("down");
      } else if (key.return) {
        startEditing();
      }
    }
  });

  if (showGroupSelector) {
    return (
      <GroupSelector
        selectedGroupIds={formData.groups ?? []}
        onConfirm={(groupIds) => {
          logger.info({
            userId: user.id,
            currentGroups: formData.groups,
            selectedGroups: groupIds
          }, "GroupSelector confirmed - setting pending groups");
          setPendingGroupIds(groupIds);
          setShowGroupSelector(false);
          setShowGroupConfirmation(true);
        }}
        onCancel={() => setShowGroupSelector(false)}
      />
    );
  }

  if (showGroupConfirmation) {
    const currentGroupCount = formData.groups?.length ?? 0;
    const newGroupCount = pendingGroupIds.length;
    const diff = newGroupCount - currentGroupCount;
    const changeDescription =
      diff > 0
        ? `+${diff} group${diff !== 1 ? "s" : ""}`
        : diff < 0
        ? `${diff} group${diff !== -1 ? "s" : ""}`
        : "no change";

    return (
      <AsyncActionDialog
        title="Update User Groups?"
        message={`Change groups from ${currentGroupCount} to ${newGroupCount} (${changeDescription})`}
        confirmText="Update"
        cancelText="Cancel"
        destructive={false}
        loadingMessage="Updating user groups..."
        successMessage="User groups updated successfully!"
        onConfirm={async () => {
          logger.info({
            userId: user.id,
            userName: user.name,
            currentGroups: formData.groups,
            pendingGroups: pendingGroupIds
          }, "Group update started via AsyncActionDialog");

          const response = await updateUser(
            { id: user.id, groups: pendingGroupIds }
          );

          logger.info({
            userId: user.id,
            response,
            succeeded: response.responseResult.succeeded,
            message: response.responseResult.message
          }, "updateUser API response received");

          if (!response.responseResult.succeeded) {
            throw new Error(response.responseResult.message ?? "Failed to update user groups");
          }

          // Update the form data to reflect the new groups
          setFormData((prev) => ({
            ...prev,
            groups: pendingGroupIds,
          }));
        }}
        onSuccess={() => {
          logger.info({ userId: user.id }, "Group update completed successfully, refreshing user list");
          setShowGroupConfirmation(false);
          onSuccess();
        }}
        onCancel={() => {
          setShowGroupConfirmation(false);
          onStatusChange("");
        }}
        onError={(err) => {
          logger.error({ err, userId: user.id, pendingGroupIds }, "Group update failed");
        }}
      />
    );
  }

  if (showSaveConfirmation) {
    return (
      <ConfirmationDialog
        title="Save User Changes?"
        message={`Save all changes to ${user.name}?`}
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={() => {
          setShowSaveConfirmation(false);
          void handleSave();
        }}
        onCancel={() => {
          setShowSaveConfirmation(false);
          onStatusChange("");
        }}
      />
    );
  }

  const getFieldDisplayValue = (field: FormField): string => {
    const currentFieldObj = FORM_FIELDS[currentField];
    if (isEditing && currentFieldObj && currentFieldObj.key === field.key) {
      return inputValue;
    }

    const value = formData[field.key];
    return typeof value === "string" ? value : "";
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Edit User: {user.name}
        </Text>
      </Box>

      {FORM_FIELDS.map((field, index) => {
        const isFocused = index === currentField;
        const isEditingThis = isEditing && index === currentField;

        return (
          <Box key={field.key} marginBottom={1}>
            <Box width={20} flexShrink={0}>
              <Text
                color={isFocused ? theme.colors.accent : theme.colors.text}
                bold={isFocused}
              >
                {isFocused ? "▶ " : "  "}
                {field.label}:
              </Text>
            </Box>
            <Box marginLeft={2} flexGrow={1}>
              {isEditingThis ? (
                <TextInput
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder={field.placeholder}
                  focus={true}
                  showCursor={true}
                />
              ) : (
                <Text
                  color={isFocused ? theme.colors.accent : theme.colors.text}
                  bold={isFocused}
                >
                  {getFieldDisplayValue(field) ?? (
                    <Text color={theme.colors.muted} italic>
                      {field.placeholder}
                    </Text>
                  )}
                </Text>
              )}
            </Box>
          </Box>
        );
      })}

      <Box marginBottom={1}>
        <Box width={20} flexShrink={0}>
          <Text
            color={
              currentField === FORM_FIELDS.length
                ? theme.colors.accent
                : theme.colors.text
            }
            bold={currentField === FORM_FIELDS.length}
          >
            {currentField === FORM_FIELDS.length ? "▶ " : "  "}
            Groups:
          </Text>
        </Box>
        <Box marginLeft={2} flexGrow={1}>
          <Text
            color={
              currentField === FORM_FIELDS.length
                ? theme.colors.accent
                : theme.colors.text
            }
            bold={currentField === FORM_FIELDS.length}
          >
            {formData.groups && formData.groups.length > 0
              ? `${formData.groups.length} group(s) assigned`
              : "No groups assigned"}
          </Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Button
          label="Save Changes"
          isSelected={currentField === FORM_FIELDS.length + 1}
          variant="success"
          disabled={isSaving}
        />
      </Box>

      {isSaving && (
        <Box marginTop={1}>
          <Text color={theme.colors.info}>Saving changes...</Text>
        </Box>
      )}
    </Box>
  );
}
