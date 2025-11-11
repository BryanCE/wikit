import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import type { TeamMember } from "@/types";

interface EditProfileModalProps {
  member: TeamMember;
  onSave: (profile: {
    portfolio?: string;
    team?: string;
    birthday?: string;
    bio?: string;
    hire_date?: string;
    role?: string;
  }) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

type FieldKey =
  | "portfolio"
  | "team"
  | "birthday"
  | "bio"
  | "hire_date"
  | "role";

const FIELDS: Array<{ key: FieldKey; label: string; placeholder: string }> = [
  { key: "portfolio", label: "Portfolio", placeholder: "e.g., iLeadServe" },
  { key: "team", label: "Team", placeholder: "e.g., Engineering" },
  { key: "birthday", label: "Birthday", placeholder: "YYYY-MM-DD" },
  { key: "bio", label: "Bio", placeholder: "Short bio" },
  { key: "hire_date", label: "Hire Date", placeholder: "YYYY-MM-DD" },
  { key: "role", label: "Role", placeholder: "e.g., Senior Developer" },
];

export function EditProfileModal({
  member,
  onSave,
  onCancel,
  isSaving = false,
}: EditProfileModalProps) {
  const { theme } = useTheme();
  const [focusArea, setFocusArea] = useState<"fields" | "buttons">("fields");
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);
  const [selectedButton, setSelectedButton] = useState<"save" | "cancel">(
    "save"
  );
  const [isEditingField, setIsEditingField] = useState(false);

  // Helper to format dates to YYYY-MM-DD
  const formatDate = (date?: string) => {
    if (!date) return "";
    if (date.includes("T")) {
      return date.split("T")[0];
    }
    return date;
  };

  // Form values
  const [formValues, setFormValues] = useState({
    portfolio: member.portfolio ?? "",
    team: member.team ?? "",
    birthday: formatDate(member.birthday),
    bio: member.bio ?? "",
    hire_date: formatDate(member.hire_date),
    role: member.role ?? "",
  });

  // Current field being edited
  const [editBuffer, setEditBuffer] = useState("");

  const currentField = FIELDS[selectedFieldIndex];

  // Footer help text
  const helpText = isEditingField
    ? formatHelpText(
        HELP_TEXT.TYPE_TO_EDIT,
        HELP_TEXT.ENTER_SAVE,
        HELP_TEXT.CANCEL
      )
    : focusArea === "fields"
    ? formatHelpText(HELP_TEXT.NAVIGATE, "Enter=edit", HELP_TEXT.CANCEL)
    : formatHelpText("←→=select", HELP_TEXT.ENTER_CONFIRM, HELP_TEXT.CANCEL);

  useFooterHelp(helpText);

  useEscape("edit-profile", () => {
    if (isEditingField) {
      setIsEditingField(false);
      setEditBuffer("");
    } else {
      onCancel();
    }
  });

  useInput((input, key) => {
    if (isSaving) return;

    // Field editing mode
    if (isEditingField && currentField) {
      if (key.return) {
        // Save the edited value
        setFormValues((prev) => ({
          ...prev,
          [currentField.key]: editBuffer,
        }));
        setIsEditingField(false);
        setEditBuffer("");
      // TextInput component handles all other input (typing, backspace, etc)
      }
      return;
    }

    // Field selection mode
    if (focusArea === "fields") {
      if (key.upArrow) {
        setSelectedFieldIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        if (selectedFieldIndex === FIELDS.length - 1) {
          setFocusArea("buttons");
        } else {
          setSelectedFieldIndex((prev) => prev + 1);
        }
      } else if (key.return && currentField) {
        // Start editing this field
        setEditBuffer(formValues[currentField.key] ?? "");
        setIsEditingField(true);
      }
      return;
    }

    // Button selection mode
    if (focusArea === "buttons") {
      if (key.upArrow) {
        setFocusArea("fields");
        setSelectedFieldIndex(FIELDS.length - 1);
      } else if (key.leftArrow) {
        setSelectedButton("save");
      } else if (key.rightArrow) {
        setSelectedButton("cancel");
      } else if (key.return) {
        if (selectedButton === "save") {
          onSave({
            portfolio: formValues.portfolio ?? undefined,
            team: formValues.team ?? undefined,
            birthday: formValues.birthday ?? undefined,
            bio: formValues.bio ?? undefined,
            hire_date: formValues.hire_date ?? undefined,
            role: formValues.role ?? undefined,
          });
        } else {
          onCancel();
        }
      }
      return;
    }
  });

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Edit Profile: {member.name}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.muted}>{member.email}</Text>
      </Box>

      {/* Form Fields */}
      <Box flexDirection="column" marginBottom={1}>
        {FIELDS.map((field, index) => {
          const isSelected =
            focusArea === "fields" && selectedFieldIndex === index;
          const isEditing = isEditingField && isSelected;
          const displayValue = isEditing ? editBuffer : formValues[field.key];

          return (
            <Box
              key={field.key}
              marginBottom={0}
              height={2}
              flexDirection="column"
            >
              <Box>
                <Text
                  color={isSelected ? theme.colors.accent : theme.colors.text}
                  bold={isSelected}
                >
                  {isSelected ? " ► " : "   "}
                  {field.label.padEnd(12)}:{" "}
                </Text>
                {isEditing ? (
                  <TextInput
                    value={editBuffer}
                    onChange={setEditBuffer}
                    placeholder={field.placeholder}
                    focus={true}
                    showCursor={true}
                  />
                ) : (
                  <Text
                    color={
                      displayValue ? theme.colors.text : theme.colors.muted
                    }
                  >
                    {displayValue ?? field.placeholder}
                  </Text>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Buttons */}
      <Box marginTop={1}>
        <Box
          marginRight={2}
          paddingX={2}
          paddingY={0}
          borderStyle="round"
          borderColor={
            focusArea === "buttons" && selectedButton === "save"
              ? theme.colors.success
              : theme.colors.muted
          }
          backgroundColor={
            focusArea === "buttons" && selectedButton === "save"
              ? theme.colors.success
              : undefined
          }
        >
          <Text
            color={
              focusArea === "buttons" && selectedButton === "save"
                ? "black"
                : theme.colors.success
            }
            bold={focusArea === "buttons" && selectedButton === "save"}
          >
            {isSaving ? "Saving..." : "Save"}
          </Text>
        </Box>

        <Box
          paddingX={2}
          paddingY={0}
          borderStyle="round"
          borderColor={
            focusArea === "buttons" && selectedButton === "cancel"
              ? theme.colors.muted
              : theme.colors.muted
          }
          backgroundColor={
            focusArea === "buttons" && selectedButton === "cancel"
              ? theme.colors.muted
              : undefined
          }
        >
          <Text
            color={
              focusArea === "buttons" && selectedButton === "cancel"
                ? "black"
                : theme.colors.muted
            }
            bold={focusArea === "buttons" && selectedButton === "cancel"}
          >
            Cancel
          </Text>
        </Box>
      </Box>

      {isSaving && (
        <Box marginTop={1}>
          <Text color={theme.colors.warning}>Saving profile...</Text>
        </Box>
      )}
    </Box>
  );
}
