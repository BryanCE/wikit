import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { getConfigManager } from "@/config/dynamicConfig";
import { testConnection } from "@/api/test";
import { ConfirmationDialog } from "@comps/modals/ConfirmationDialog";
import type { WikiInstance } from "@/config/configManager";

interface InstanceFormProps {
  mode: "add" | "edit";
  instanceId?: string;
  onSave: (instance: WikiInstance) => Promise<void>;
  onCancel: () => void;
  onStatusMessage: (message: string) => void;
}

interface FormField {
  key: keyof WikiInstance;
  label: string;
  placeholder: string;
  sensitive?: boolean;
}

const FORM_FIELDS: FormField[] = [
  { key: "id", label: "Instance ID", placeholder: "e.g., 'mywiki'" },
  { key: "name", label: "Display Name", placeholder: "e.g., 'My Wiki'" },
  { key: "url", label: "Site URL", placeholder: "https://your-wiki.com" },
  {
    key: "key",
    label: "API Key",
    placeholder: "your-api-key-here",
    sensitive: true,
  },
];

type ActionButton = "save" | "test" | "cancel";

export function InstanceForm({
  mode,
  instanceId,
  onSave,
  onCancel,
  onStatusMessage,
}: InstanceFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<WikiInstance>({
    id: "",
    name: "",
    url: "",
    key: "",
  });
  const [currentField, setCurrentField] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [focusArea, setFocusArea] = useState<"fields" | "buttons">("fields");
  const [selectedButton, setSelectedButton] = useState<ActionButton>("save");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (mode === "edit" && instanceId) {
      void loadExistingInstance();
    } else {
      // For add mode, start in navigation mode
      setIsEditing(false);
      setInputValue("");
      setCurrentField(0);
    }
  }, [mode, instanceId]);

  const loadExistingInstance = async () => {
    if (!instanceId) {
      onStatusMessage("No instance ID provided for editing");
      return;
    }

    onStatusMessage(`Loading instance: ${instanceId}...`);

    try {
      const configManager = getConfigManager();
      const instance = await configManager.getInstance(instanceId);
      if (instance) {
        setFormData(instance);
        setInputValue(""); // Start in navigation mode, not editing
        setCurrentField(0);
        setIsEditing(false);
        onStatusMessage(`Loaded instance: ${instance.name}`);
      } else {
        onStatusMessage(`Instance '${instanceId}' not found`);
      }
    } catch (error) {
      onStatusMessage(
        `Error loading instance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const navigateFields = (direction: "up" | "down") => {
    if (isEditing) return;

    if (focusArea === "buttons") {
      // Navigate between buttons horizontally
      return;
    }

    let newFieldIndex = currentField;
    if (direction === "up") {
      newFieldIndex = Math.max(0, currentField - 1);
    } else {
      newFieldIndex = Math.min(FORM_FIELDS.length - 1, currentField + 1);
    }

    setCurrentField(newFieldIndex);

    // Update input value to the new field value
    const field = FORM_FIELDS[newFieldIndex];
    if (field) {
      setInputValue(formData[field.key] ?? "");
    }
  };

  const navigateButtons = (direction: "left" | "right") => {
    if (focusArea !== "buttons") return;

    const buttons: ActionButton[] = ["save", "test", "cancel"];
    const currentIndex = buttons.indexOf(selectedButton);

    if (direction === "left") {
      const newIndex = Math.max(0, currentIndex - 1);
      setSelectedButton(buttons[newIndex] as ActionButton);
    } else {
      const newIndex = Math.min(buttons.length - 1, currentIndex + 1);
      setSelectedButton(buttons[newIndex] as ActionButton);
    }
  };

  const switchFocusArea = (direction: "up" | "down") => {
    if (isEditing) return;

    if (direction === "down" && focusArea === "fields" && currentField === FORM_FIELDS.length - 1) {
      setFocusArea("buttons");
    } else if (direction === "up" && focusArea === "buttons") {
      setFocusArea("fields");
    }
  };

  const startEditing = () => {
    const field = FORM_FIELDS[currentField];
    if (field) {
      setInputValue(formData[field.key] ?? "");
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

  const validateForm = (): string | null => {
    if (!formData.id.trim()) return "Instance ID is required";
    if (!formData.name.trim()) return "Display name is required";
    if (!formData.url.trim()) return "API URL is required";
    if (!formData.key.trim()) return "API Key is required";

    // Validate URL format
    try {
      new URL(formData.url);
    } catch {
      return "Invalid URL format";
    }

    // Validate ID format (alphanumeric + underscore/dash)
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.id)) {
      return "Instance ID can only contain letters, numbers, underscores, and dashes";
    }

    return null;
  };

  const normalizeUrl = (url: string): string => {
    // Remove trailing slash
    let normalizedUrl = url.replace(/\/$/, "");

    // Add /graphql if not already present
    if (!normalizedUrl.endsWith("/graphql")) {
      normalizedUrl += "/graphql";
    }

    return normalizedUrl;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      onStatusMessage(validationError);
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const confirmSave = async () => {
    setShowConfirmDialog(false);

    try {
      // Normalize the URL to ensure it has /graphql endpoint
      const instanceToSave = {
        ...formData,
        url: normalizeUrl(formData.url),
      };
      await onSave(instanceToSave);
    } catch (error) {
      onStatusMessage(
        `Error saving instance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const testConnectionHandler = async () => {
    if (!formData.url || !formData.key) {
      onStatusMessage("URL and API key are required to test connection");
      return;
    }

    onStatusMessage("Testing connection...");

    try {
      // Normalize URL for testing
      const testUrl = normalizeUrl(formData.url);

      // Test the actual API connection
      await testConnection(testUrl, formData.key);

      onStatusMessage("✓ Connection test passed! API is working correctly.");
    } catch (error) {
      onStatusMessage(
        `Connection test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  useInput((input, key) => {
    if (showConfirmDialog) return; // Let confirmation dialog handle input

    if (key.escape) {
      if (isEditing) {
        // Cancel editing current field
        setIsEditing(false);
        const field = FORM_FIELDS[currentField];
        if (field) {
          setInputValue(formData[field.key] ?? "");
        }
      } else {
        // Cancel entire form
        onCancel();
      }
      return;
    }

    if (isEditing) {
      // TextInput handles all input - we just need to handle save
      if (key.return) {
        saveField();
      }
      // TextInput component handles all other input (typing, backspace, etc)
    } else {
      // Handle navigation when not editing
      if (key.upArrow) {
        switchFocusArea("up");
        if (focusArea === "fields") {
          navigateFields("up");
        }
      } else if (key.downArrow) {
        switchFocusArea("down");
        if (focusArea === "fields") {
          navigateFields("down");
        }
      } else if (key.leftArrow && focusArea === "buttons") {
        navigateButtons("left");
      } else if (key.rightArrow && focusArea === "buttons") {
        navigateButtons("right");
      } else if (key.return) {
        if (focusArea === "fields") {
          startEditing();
        } else if (focusArea === "buttons") {
          // Execute button action
          if (selectedButton === "save") {
            void handleSave();
          } else if (selectedButton === "test") {
            void testConnectionHandler();
          } else if (selectedButton === "cancel") {
            onCancel();
          }
        }
      }
    }
  });

  const getFieldDisplayValue = (field: FormField): string => {
    const currentFieldObj = FORM_FIELDS[currentField];
    if (isEditing && currentFieldObj && currentFieldObj.key === field.key) {
      return inputValue;
    }

    const value = formData[field.key] ?? "";
    if (field.sensitive && value) {
      return "•".repeat(Math.min(value.length, 20));
    }
    return value;
  };

  if (showConfirmDialog) {
    return (
      <ConfirmationDialog
        title={mode === "add" ? "Confirm Add Instance" : "Confirm Save Changes"}
        message={
          mode === "add"
            ? `Add new instance "${formData.name}" with ID "${formData.id}"?`
            : `Save changes to instance "${formData.name}"?`
        }
        confirmText="Save"
        cancelText="Cancel"
        items={[
          `URL: ${normalizeUrl(formData.url)}`,
          `Key: ${"•".repeat(Math.min(formData.key.length, 20))}`,
        ]}
        onConfirm={() => void confirmSave()}
        onCancel={() => setShowConfirmDialog(false)}
        destructive={false}
      />
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          {mode === "add" ? "Add New Instance" : `Edit Instance: ${instanceId}`}
        </Text>
      </Box>

      {FORM_FIELDS.map((field, index) => {
        const isFocused = index === currentField && focusArea === "fields";
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
                  mask={field.sensitive ? "•" : undefined}
                />
              ) : (
                <Text
                  color={isFocused ? theme.colors.accent : theme.colors.text}
                  backgroundColor={isFocused && !isEditing ? "gray" : undefined}
                  bold={isFocused}
                >
                  {getFieldDisplayValue(field) || (
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

      {/* Action Buttons */}
      <Box marginTop={2} flexDirection="column">
        <Box marginBottom={1}>
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
              Save
            </Text>
          </Box>

          <Box
            marginRight={2}
            paddingX={2}
            paddingY={0}
            borderStyle="round"
            borderColor={
              focusArea === "buttons" && selectedButton === "test"
                ? theme.colors.primary
                : theme.colors.muted
            }
            backgroundColor={
              focusArea === "buttons" && selectedButton === "test"
                ? theme.colors.primary
                : undefined
            }
          >
            <Text
              color={
                focusArea === "buttons" && selectedButton === "test"
                  ? "black"
                  : theme.colors.primary
              }
              bold={focusArea === "buttons" && selectedButton === "test"}
            >
              Test
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

        <Text color={theme.colors.muted}>
          {isEditing
            ? "Type to edit, Enter to confirm, Esc to cancel"
            : focusArea === "fields"
            ? "↑↓ navigate, Enter to edit, ↓ to buttons"
            : "← → navigate buttons, Enter to select, ↑ to fields"}
        </Text>
      </Box>

      {formData.id && formData.name && formData.url && formData.key && (
        <Box marginTop={1} paddingTop={1} borderStyle="single" borderTop>
          <Box flexDirection="column">
            <Text color={theme.colors.success}>Form Complete ✓</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
