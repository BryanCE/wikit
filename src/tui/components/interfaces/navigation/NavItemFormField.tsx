import React from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import type { FormFieldConfig } from "./navFormTypes";
import { useTheme } from "@/tui/contexts/ThemeContext";

interface NavItemFormFieldProps {
  field: FormFieldConfig;
  index: number;
  currentField: number;
  focusArea: "fields" | "buttons";
  isEditing: boolean;
  displayValue: string;
  placeholder: string;
  inputValue: string;
  onInputChange: (value: string) => void;
}

export function NavItemFormField({
  field,
  index,
  currentField,
  focusArea,
  isEditing,
  displayValue,
  placeholder,
  inputValue,
  onInputChange,
}: NavItemFormFieldProps) {
  const { theme } = useTheme();
  const isFocused = index === currentField && focusArea === "fields";
  const isEditingThis = isEditing && index === currentField;

  return (
    <Box marginBottom={1}>
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
            onChange={onInputChange}
            placeholder={placeholder}
            focus={true}
            showCursor={true}
          />
        ) : (
          <Text
            color={isFocused ? theme.colors.accent : theme.colors.text}
            bold={isFocused}
          >
            {displayValue || (
              <Text color={theme.colors.muted} italic>
                {placeholder}
              </Text>
            )}
          </Text>
        )}
      </Box>
    </Box>
  );
}
