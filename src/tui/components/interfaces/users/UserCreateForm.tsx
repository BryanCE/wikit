import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { createUser } from "@/api/users";
import { GroupSelector } from "./GroupSelector";
import { Button } from "../../ui/Button";
import { formatHelpText, HELP_TEXT, COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";
import type { CreateUserInput } from "@/types";

interface UserCreateFormProps {
  instance?: string;
  onSuccess: () => void;
  onStatusChange: (message: string) => void;
  inCreateForm?: boolean;
  onExitForm?: () => void;
}

interface FormField {
  key: keyof CreateUserInput | "password";
  label: string;
  placeholder: string;
  required: boolean;
  sensitive?: boolean;
}

const FORM_FIELDS: FormField[] = [
  {
    key: "email",
    label: "Email",
    placeholder: "user@example.com",
    required: true,
  },
  { key: "name", label: "Name", placeholder: "Full Name", required: true },
  {
    key: "password",
    label: "Password",
    placeholder: "Optional - leave blank for SSO",
    required: false,
    sensitive: true,
  },
  {
    key: "providerKey",
    label: "Provider",
    placeholder: "local",
    required: true,
  },
];

const PROVIDER_OPTIONS = ["local", "oauth2", "saml"];

export function UserCreateForm({
  instance,
  onSuccess,
  onStatusChange,
  inCreateForm = false,
  onExitForm,
}: UserCreateFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<
    CreateUserInput & { password?: string }
  >({
    email: "",
    name: "",
    password: "",
    providerKey: "local",
    groups: [],
    mustChangePassword: false,
    sendWelcomeEmail: true,
  });
  const [currentField, setCurrentField] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const helpText = showOptions
    ? formatHelpText(HELP_TEXT.TOGGLE, HELP_TEXT.ENTER_DONE, HELP_TEXT.CANCEL)
    : isEditing
    ? COMMON_HELP_PATTERNS.FORM_EDITING
    : inCreateForm
    ? formatHelpText("Tab/1-2=switch tabs", HELP_TEXT.NAVIGATE, HELP_TEXT.ENTER_SELECT, HELP_TEXT.BACK)
    : formatHelpText("Tab/←→ switch tabs", "1-2 quick jump", "↓ enter form", HELP_TEXT.BACK);

  useFooterHelp(helpText);

  const navigateFields = (direction: "up" | "down") => {
    if (isEditing) return;

    let newFieldIndex = currentField;
    if (direction === "up") {
      newFieldIndex = Math.max(0, currentField - 1);
    } else {
      newFieldIndex = Math.min(FORM_FIELDS.length + 2, currentField + 1);
    }

    setCurrentField(newFieldIndex);

    if (newFieldIndex < FORM_FIELDS.length) {
      const field = FORM_FIELDS[newFieldIndex];
      if (field) {
        if (field.key === "providerKey") {
          setInputValue(formData.providerKey);
        } else if (field.key === "password") {
          setInputValue(formData.password ?? "");
        } else {
          const value = formData[field.key as keyof CreateUserInput];
          setInputValue(typeof value === "string" ? value : "");
        }
      }
    }
  };

  const startEditing = () => {
    if (currentField === FORM_FIELDS.length) {
      setShowGroupSelector(true);
      return;
    }

    if (currentField === FORM_FIELDS.length + 1) {
      setShowOptions(true);
      return;
    }

    const field = FORM_FIELDS[currentField];
    if (field) {
      if (field.key === "providerKey") {
        const currentIndex = PROVIDER_OPTIONS.indexOf(formData.providerKey);
        const nextIndex = (currentIndex + 1) % PROVIDER_OPTIONS.length;
        setFormData((prev: CreateUserInput & { password?: string }) => ({
          ...prev,
          providerKey: PROVIDER_OPTIONS[nextIndex] ?? "local",
        }));
        setInputValue(PROVIDER_OPTIONS[nextIndex] ?? "local");
      } else if (field.key === "password") {
        setInputValue(formData.password ?? "");
        setIsEditing(true);
      } else {
        const value = formData[field.key as keyof CreateUserInput];
        setInputValue(typeof value === "string" ? value : "");
        setIsEditing(true);
      }
    }
  };

  const saveField = () => {
    const field = FORM_FIELDS[currentField];
    if (field) {
      if (field.key === "password") {
        setFormData((prev: CreateUserInput & { password?: string }) => ({
          ...prev,
          password: inputValue,
          passwordRaw: inputValue ?? undefined,
        }));
      } else {
        setFormData((prev: CreateUserInput & { password?: string }) => ({
          ...prev,
          [field.key]: inputValue,
        }));
      }
      setIsEditing(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return "Email is required";
    if (!formData.name.trim()) return "Name is required";
    if (!formData.providerKey) return "Provider is required";
    if (formData.groups.length === 0)
      return "At least one group must be selected";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Invalid email format";

    return null;
  };

  const handleCreate = async () => {
    const validationError = validateForm();
    if (validationError) {
      onStatusChange(validationError);
      return;
    }

    setIsCreating(true);
    onStatusChange("Creating user...");

    try {
      const input: CreateUserInput = {
        email: formData.email,
        name: formData.name,
        providerKey: formData.providerKey,
        groups: formData.groups,
        mustChangePassword: formData.mustChangePassword,
        sendWelcomeEmail: formData.sendWelcomeEmail,
      };

      if (formData.password) {
        input.passwordRaw = formData.password;
      }

      const response = await createUser(input, instance);

      if (response.responseResult.succeeded) {
        onStatusChange(`User created successfully! ID: ${response.user?.id}`);
        onSuccess();
      } else {
        onStatusChange(
          `Failed to create user: ${response.responseResult.message}`
        );
        setIsCreating(false);
      }
    } catch (error) {
      onStatusChange(
        `Error creating user: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setIsCreating(false);
    }
  };

  useInput((input, key) => {
    if (isCreating || showGroupSelector || showOptions) return;

    // Only handle navigation when IN the form (like NavDeleteModal pattern)
    if (!inCreateForm) return;

    if (isEditing) {
      // TextInput handles all input - we just need to handle save
      if (key.return) {
        saveField();
      }
      // TextInput component handles all other input (typing, backspace, etc)
    } else {
      if (key.upArrow) {
        // Exit form if at top field (like NavDeleteModal line 113-115)
        if (currentField === 0 && onExitForm) {
          onExitForm();
        } else {
          navigateFields("up");
        }
      } else if (key.downArrow) {
        navigateFields("down");
      } else if (key.return) {
        // If on the "Create User" button (last position)
        if (currentField === FORM_FIELDS.length + 2) {
          void handleCreate();
        } else {
          startEditing();
        }
      }
    }
  });

  if (showGroupSelector) {
    return (
      <GroupSelector
        instance={instance}
        selectedGroupIds={formData.groups}
        onConfirm={(groupIds) => {
          setFormData((prev: CreateUserInput & { password?: string }) => ({
            ...prev,
            groups: groupIds,
          }));
          setShowGroupSelector(false);
          onStatusChange(`${groupIds.length} group(s) selected`);
        }}
        onCancel={() => setShowGroupSelector(false)}
      />
    );
  }

  if (showOptions) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color={theme.colors.primary} bold>
            User Options
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.text} bold={currentField === 0}>
            {currentField === 0 ? "▶ " : "  "}
            Must Change Password: {formData.mustChangePassword ? "[X]" : "[ ]"}
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.text} bold={currentField === 1}>
            {currentField === 1 ? "▶ " : "  "}
            Send Welcome Email: {formData.sendWelcomeEmail ? "[X]" : "[ ]"}
          </Text>
        </Box>
      </Box>
    );
  }

  const getFieldDisplayValue = (field: FormField): string => {
    const currentFieldObj = FORM_FIELDS[currentField];
    if (isEditing && currentFieldObj && currentFieldObj.key === field.key) {
      return field.sensitive && inputValue
        ? "•".repeat(inputValue.length)
        : inputValue;
    }

    let value: string;
    if (field.key === "password") {
      value = formData.password ?? "";
    } else {
      const fieldValue = formData[field.key];
      value = typeof fieldValue === "string" ? fieldValue : "";
    }

    if (field.sensitive && value) {
      return "•".repeat(Math.min(value.length, 20));
    }
    return value;
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text
          color={inCreateForm ? theme.colors.success : theme.colors.muted}
          bold={inCreateForm}
        >
          Create New User
        </Text>
      </Box>

      {FORM_FIELDS.map((field, index) => {
        const isFocused = index === currentField && inCreateForm;
        const isEditingThis = isEditing && index === currentField && inCreateForm;

        return (
          <Box key={field.key as string} marginBottom={1}>
            <Box width={20} flexShrink={0}>
              <Text
                color={inCreateForm ? (isFocused ? theme.colors.success : theme.colors.text) : theme.colors.muted}
                bold={isFocused}
                dimColor={!inCreateForm}
              >
                {isFocused ? "▶ " : "  "}
                {field.label}
                {field.required && <Text color={theme.colors.error}>*</Text>}:
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
                  mask={field.sensitive ? "•" : undefined}
                />
              ) : (
                <Text
                  color={inCreateForm ? (isFocused ? theme.colors.success : theme.colors.text) : theme.colors.muted}
                  bold={isFocused}
                  dimColor={!inCreateForm}
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
              inCreateForm
                ? (currentField === FORM_FIELDS.length ? theme.colors.success : theme.colors.text)
                : theme.colors.muted
            }
            bold={currentField === FORM_FIELDS.length && inCreateForm}
            dimColor={!inCreateForm}
          >
            {currentField === FORM_FIELDS.length && inCreateForm ? "▶ " : "  "}
            Groups<Text color={theme.colors.error}>*</Text>:
          </Text>
        </Box>
        <Box marginLeft={2} flexGrow={1}>
          <Text
            color={
              inCreateForm
                ? (currentField === FORM_FIELDS.length ? theme.colors.success : theme.colors.text)
                : theme.colors.muted
            }
            bold={currentField === FORM_FIELDS.length && inCreateForm}
            dimColor={!inCreateForm}
          >
            {formData.groups.length > 0
              ? `${formData.groups.length} group(s) selected`
              : "Select groups"}
          </Text>
        </Box>
      </Box>

      <Box marginBottom={1}>
        <Box width={20} flexShrink={0}>
          <Text
            color={
              inCreateForm
                ? (currentField === FORM_FIELDS.length + 1 ? theme.colors.success : theme.colors.text)
                : theme.colors.muted
            }
            bold={currentField === FORM_FIELDS.length + 1 && inCreateForm}
            dimColor={!inCreateForm}
          >
            {currentField === FORM_FIELDS.length + 1 && inCreateForm ? "▶ " : "  "}
            Options:
          </Text>
        </Box>
        <Box marginLeft={2} flexGrow={1}>
          <Text
            color={
              inCreateForm
                ? (currentField === FORM_FIELDS.length + 1 ? theme.colors.success : theme.colors.text)
                : theme.colors.muted
            }
            bold={currentField === FORM_FIELDS.length + 1 && inCreateForm}
            dimColor={!inCreateForm}
          >
            Change password: {formData.mustChangePassword ? "Yes" : "No"},
            Welcome email: {formData.sendWelcomeEmail ? "Yes" : "No"}
          </Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Button
          label="Create User"
          isSelected={currentField === FORM_FIELDS.length + 2 && inCreateForm}
          variant="success"
          disabled={isCreating || !inCreateForm}
        />
      </Box>

      {isCreating && (
        <Box marginTop={1}>
          <Text color={theme.colors.info}>Creating user...</Text>
        </Box>
      )}

      {validateForm() && !isCreating && (
        <Box marginTop={1}>
          <Text color={theme.colors.warning}>{validateForm()}</Text>
        </Box>
      )}
    </Box>
  );
}
