import React, { useState, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import type { NavigationTree, NavigationItem } from "@/types";
import { addNavigationItem } from "@/commands/navigation";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { AsyncActionDialog } from "@comps/modals/AsyncActionDialog";
import { NavItemPlacementPreview } from "./NavItemPlacementPreview";
import { NavItemTreePreview } from "./NavItemTreePreview";
import { NavItemFormField } from "./NavItemFormField";
import { NavItemFormButtons } from "./NavItemFormButtons";
import type { FormData, FormFieldConfig, ActionButton } from "./navFormTypes";
import { FORM_FIELDS, KIND_TYPES, TARGET_TYPES, PREVIEW_INPUT_HANDLER } from "./navFormTypes";

interface NavItemFormProps {
  instance: string;
  locale: string;
  existingTree?: NavigationTree;
  onSubmit: () => void;
  onCancel: () => void;
}

export function NavItemForm({
  instance,
  locale,
  existingTree,
  onSubmit,
  onCancel,
}: NavItemFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    kind: "link",
    label: "",
    target: "",
    targetType: "page",
    icon: "",
    insertAfterId: "",
  });

  const [currentField, setCurrentField] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [focusArea, setFocusArea] = useState<"fields" | "buttons">("fields");
  const [selectedButton, setSelectedButton] = useState<ActionButton>("save");
  const [showPreview, setShowPreview] = useState(false);
  const [showPlacementPreview, setShowPlacementPreview] = useState(false);
  const [placementPreviewIndex, setPlacementPreviewIndex] = useState(0);
  const [previewSelectedButton, setPreviewSelectedButton] = useState<"confirm" | "back">("confirm");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTree, setPreviewTree] = useState<NavigationItem[]>([]);

  const availableItems =
    existingTree?.items.map((item) => ({
      id: item.id,
      label: item.label ?? item.id,
      kind: item.kind,
      icon: item.icon,
    })) ?? [];

  const getItemDisplayLabel = (item: typeof availableItems[0]): string => {
    if (!item) return "";
    if (item.kind === "divider") return "─────────────────────";
    const icon = item.icon ? `${item.icon} ` : "";
    const kindBadge = item.kind === "header" ? " [H]" : "";
    return `${icon}${item.label}${kindBadge}`;
  };

  const isFieldVisible = (fieldKey: keyof FormData): boolean => {
    if (fieldKey === "kind" || fieldKey === "insertAfterId") return true;

    if (formData.kind === "divider") {
      return false; // dividers only show kind and insertAfterId
    }

    if (formData.kind === "header") {
      return fieldKey === "label" || fieldKey === "icon";
    }

    // kind === "link"
    return true;
  };

  const visibleFields = useMemo(() => {
    return FORM_FIELDS.filter(field => isFieldVisible(field.key));
  }, [formData.kind]);

  const getVisibleFields = (): FormFieldConfig[] => {
    return visibleFields;
  };

  // Dynamic help text based on current state
  const helpText = useMemo(() => {
    if (isEditing) {
      return "Type to edit • ←→ navigate text • Enter confirm • Esc cancel edit";
    }
    if (focusArea === "fields") {
      const currentFieldKey = visibleFields[currentField]?.key;
      if (currentFieldKey === "kind") {
        return "↑↓ navigate • Space cycle type (link/header/divider) • Esc exit";
      } else if (currentFieldKey === "targetType") {
        return "↑↓ navigate • Space cycle target type • Esc exit";
      } else if (currentFieldKey === "insertAfterId") {
        return "↑↓ navigate • Space cycle • → open placement picker • Esc exit";
      } else {
        const field = visibleFields[currentField];
        if (field?.isSelect) {
          return "↑↓ navigate • Space cycle • Esc exit";
        }
        return "↑↓ navigate • Enter edit field • Esc exit";
      }
    }
    return "←→ navigate buttons • Enter select • Esc exit";
  }, [isEditing, focusArea, currentField, visibleFields]);

  const headerMetadata = useMemo(() => {
    const kindLabel = formData.kind === "link" ? "Link" : formData.kind === "header" ? "Header" : "Divider";
    return `${kindLabel} • ${locale}`;
  }, [formData.kind, locale]);

  useFooterHelp(helpText);
  useHeaderData({ title: "Add Navigation Item", metadata: headerMetadata });

  const navigateFields = (direction: "up" | "down") => {
    if (isEditing) return;

    if (focusArea === "buttons") {
      return;
    }

    const visibleFields = getVisibleFields();
    let newFieldIndex = currentField;
    if (direction === "up") {
      newFieldIndex = Math.max(0, currentField - 1);
    } else {
      newFieldIndex = Math.min(visibleFields.length - 1, currentField + 1);
    }

    setCurrentField(newFieldIndex);

    const field = visibleFields[newFieldIndex];
    if (field) {
      setInputValue(formData[field.key] ?? "");
    }
  };

  const navigateButtons = (direction: "left" | "right") => {
    if (focusArea !== "buttons") return;

    const buttons: ActionButton[] = ["save", "cancel"];
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

    const visibleFields = getVisibleFields();
    if (
      direction === "down" &&
      focusArea === "fields" &&
      currentField === visibleFields.length - 1
    ) {
      setFocusArea("buttons");
    } else if (direction === "up" && focusArea === "buttons") {
      setFocusArea("fields");
    }
  };

  const startEditing = () => {
    const visibleFields = getVisibleFields();
    const field = visibleFields[currentField];
    if (field && !field.isSelect) {
      setInputValue(formData[field.key] ?? "");
      setIsEditing(true);
    }
  };

  const cycleSelectValue = () => {
    const visibleFields = getVisibleFields();
    const field = visibleFields[currentField];
    if (!field) return;

    if (field.key === "kind") {
      const currentIndex = KIND_TYPES.indexOf(formData.kind);
      const nextIndex = (currentIndex + 1) % KIND_TYPES.length;
      const newKind = KIND_TYPES[nextIndex]!;
      setFormData((prev) => ({
        ...prev,
        kind: newKind,
      }));
      // Reset currentField to 0 when kind changes to avoid out of bounds
      setCurrentField(0);
    } else if (field.key === "targetType") {
      const currentIndex = TARGET_TYPES.indexOf(formData.targetType);
      const nextIndex = (currentIndex + 1) % TARGET_TYPES.length;
      setFormData((prev) => ({
        ...prev,
        targetType: TARGET_TYPES[nextIndex]!,
      }));
    } else if (field.key === "insertAfterId") {
      const currentIndex = availableItems.findIndex(
        (p) => p.id === formData.insertAfterId
      );
      const totalOptions = availableItems.length + 1;
      const nextIndex =
        currentIndex === -1 ? 0 : (currentIndex + 1) % totalOptions;
      const newInsertAfterId =
        nextIndex === availableItems.length
          ? ""
          : availableItems[nextIndex]!.id;
      setFormData((prev) => ({ ...prev, insertAfterId: newInsertAfterId }));
    }
  };

  const saveField = () => {
    const visibleFields = getVisibleFields();
    const field = visibleFields[currentField];
    if (field) {
      setFormData((prev) => ({
        ...prev,
        [field.key]: inputValue,
      }));
      setIsEditing(false);
    }
  };

  const validateForm = (): string | null => {
    if (formData.kind === "link") {
      if (!formData.label.trim()) return "Label is required for links";
      if (!formData.target.trim()) return "Target is required for links";
    } else if (formData.kind === "header") {
      if (!formData.label.trim()) return "Label is required for headers";
    }
    // divider has no required fields
    return null;
  };


  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Build preview tree
    const newItem: NavigationItem = {
      id: `PREVIEW-${Date.now()}`,
      kind: formData.kind,
      label: formData.kind === "divider" ? undefined : formData.label ?? undefined,
      target: formData.kind === "link" ? formData.target ?? undefined : undefined,
      targetType: formData.kind === "link" ? formData.targetType : undefined,
      icon: formData.kind !== "divider" && formData.icon ? formData.icon : undefined,
      visibilityMode: "all",
    };

    const items = existingTree?.items ?? [];
    let preview: NavigationItem[];

    if (formData.insertAfterId) {
      const insertAfterIndex = items.findIndex(
        (item) => item.id === formData.insertAfterId
      );
      if (insertAfterIndex !== -1) {
        preview = [...items];
        preview.splice(insertAfterIndex + 1, 0, newItem);
      } else {
        preview = [newItem, ...items];
      }
    } else {
      preview = [newItem, ...items];
    }

    setPreviewTree(preview);
    setPreviewSelectedButton("confirm");
    setShowPreview(true);
  };

  const handleConfirmFromPreview = () => {
    setShowPreview(false);
    setShowConfirmDialog(true);
  };


  useEscape("navigation-form", () => {
    if (showPreview) {
      setShowPreview(false);
    } else if (showPlacementPreview) {
      setShowPlacementPreview(false);
    } else if (isEditing) {
      setIsEditing(false);
      const visibleFields = getVisibleFields();
      const field = visibleFields[currentField];
      if (field) {
        setInputValue(formData[field.key] ?? "");
      }
    } else {
      onCancel();
    }
  });

  useInput((input, key) => {
    if (showPreview) {
      PREVIEW_INPUT_HANDLER(
        key,
        previewSelectedButton,
        handleConfirmFromPreview,
        () => setShowPreview(false),
        (direction) => {
          if (direction === "left") {
            setPreviewSelectedButton("confirm");
          } else {
            setPreviewSelectedButton("back");
          }
        }
      );
      return;
    }

    if (showPlacementPreview) {
      const items = existingTree?.items ?? [];
      if (key.upArrow) {
        setPlacementPreviewIndex(prev => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setPlacementPreviewIndex(prev => Math.min(items.length, prev + 1));
      } else if (key.return) {
        // Set the insertAfterId based on position
        if (placementPreviewIndex === 0) {
          setFormData(prev => ({ ...prev, insertAfterId: "" }));
        } else {
          const itemBefore = items[placementPreviewIndex - 1];
          if (itemBefore) {
            setFormData(prev => ({ ...prev, insertAfterId: itemBefore.id }));
          }
        }
        setShowPlacementPreview(false);
      }
      return;
    }

    if (showConfirmDialog) return;

    if (isEditing) {
      if (key.return) {
        saveField();
      }
      // TextInput handles all other input (arrow keys, backspace, character input)
      return;
    } else {
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
      } else if (key.rightArrow) {
        if (focusArea === "buttons") {
          navigateButtons("right");
        } else if (focusArea === "fields") {
          const visibleFields = getVisibleFields();
          const field = visibleFields[currentField];
          if (field?.key === "insertAfterId") {
            // Calculate initial position based on current insertAfterId
            const items = existingTree?.items ?? [];
            const currentIndex = formData.insertAfterId
              ? items.findIndex(item => item.id === formData.insertAfterId)
              : -1;
            setPlacementPreviewIndex(currentIndex + 1);
            setShowPlacementPreview(true);
          }
        }
      } else if (input === " ") {
        if (focusArea === "fields") {
          const visibleFields = getVisibleFields();
          const field = visibleFields[currentField];
          if (field?.isSelect) {
            cycleSelectValue();
          }
        }
      } else if (key.return) {
        if (focusArea === "fields") {
          startEditing();
        } else if (focusArea === "buttons") {
          if (selectedButton === "save") {
            void handleSave();
          } else if (selectedButton === "cancel") {
            onCancel();
          }
        }
      }
    }
  });

  const getFieldDisplayValue = (field: FormFieldConfig): string => {
    const currentFieldObj = FORM_FIELDS[currentField];
    if (isEditing && currentFieldObj && currentFieldObj.key === field.key) {
      return inputValue;
    }

    const value = formData[field.key] ?? "";

    if (field.key === "kind") {
      return formData.kind;
    } else if (field.key === "targetType") {
      return formData.targetType;
    } else if (field.key === "insertAfterId") {
      if (!formData.insertAfterId) return "(beginning)";
      const item = availableItems.find((p) => p.id === formData.insertAfterId);
      return item ? getItemDisplayLabel(item) : formData.insertAfterId;
    }

    return value;
  };

  if (showPlacementPreview) {
    const items = existingTree?.items ?? [];
    return (
      <NavItemPlacementPreview
        existingItems={items}
        formData={formData}
        placementPreviewIndex={placementPreviewIndex}
      />
    );
  }

  if (showPreview) {
    return (
      <NavItemTreePreview
        previewTree={previewTree}
        selectedButton={previewSelectedButton}
      />
    );
  }

  if (showConfirmDialog) {
    const confirmItems = [`Kind: ${formData.kind}`];

    if (formData.kind !== "divider") {
      confirmItems.push(`Label: ${formData.label}`);
    }

    if (formData.kind === "link") {
      confirmItems.push(`Target: ${formData.target}`);
      confirmItems.push(`Type: ${formData.targetType}`);
    }

    if (formData.kind !== "divider" && formData.icon) {
      confirmItems.push(`Icon: ${formData.icon}`);
    }

    if (formData.insertAfterId) {
      const item = availableItems.find((p) => p.id === formData.insertAfterId);
      confirmItems.push(
        `Insert After: ${item?.label ?? formData.insertAfterId}`
      );
    } else {
      confirmItems.push(`Insert After: (beginning)`);
    }

    const itemLabel = formData.kind === "divider" ? "divider" : formData.label;

    return (
      <AsyncActionDialog
        title="Confirm Add Navigation Item"
        message={`Add new navigation item "${itemLabel}"?`}
        confirmText="Add"
        cancelText="Cancel"
        items={confirmItems}
        destructive={false}
        loadingMessage="Adding navigation item..."
        successMessage="Navigation item added successfully!"
        onConfirm={async () => {
          await addNavigationItem(
            {
              kind: formData.kind,
              label: formData.kind === "divider" ? undefined : formData.label ?? undefined,
              target: formData.kind === "link" ? formData.target ?? undefined : undefined,
              targetType: formData.kind === "link" ? formData.targetType : undefined,
              icon: formData.kind !== "divider" && formData.icon ? formData.icon ?? undefined : undefined,
              locale,
              insertAfterId: formData.insertAfterId ?? undefined,
            },
            { instance }
          );
        }}
        onSuccess={() => {
          setShowConfirmDialog(false);
          onSubmit();
        }}
        onCancel={() => setShowConfirmDialog(false)}
        onError={(err) => setError(err)}
      />
    );
  }

  return (
    <Box flexDirection="column">
      {visibleFields.map((field, index) => (
        <NavItemFormField
          key={field.key}
          field={field}
          index={index}
          currentField={currentField}
          focusArea={focusArea}
          isEditing={isEditing}
          displayValue={getFieldDisplayValue(field)}
          placeholder={field.placeholder}
          inputValue={inputValue}
          onInputChange={setInputValue}
        />
      ))}

      <NavItemFormButtons
        focusArea={focusArea}
        selectedButton={selectedButton}
      />

      {error && (
        <Box marginTop={1}>
          <Text color={theme.colors.error}>[ERROR] {error}</Text>
        </Box>
      )}

      {validateForm() === null && (
        <Box marginTop={1}>
          <Text color={theme.colors.success}>Required fields complete ✓</Text>
        </Box>
      )}
    </Box>
  );
}
