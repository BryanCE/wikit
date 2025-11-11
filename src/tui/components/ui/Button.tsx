import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";

interface ButtonProps {
  label: string;
  isSelected?: boolean;
  variant?: "primary" | "success" | "danger" | "info";
  disabled?: boolean;
}

export function Button({
  label,
  isSelected = false,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const { theme } = useTheme();

  const variantColors = {
    primary: theme.colors.primary,
    success: theme.colors.success,
    danger: theme.colors.error,
    info: theme.colors.info,
  };

  const accentColor = variantColors[variant];

  const borderColor = disabled
    ? theme.colors.muted
    : isSelected
    ? accentColor
    : theme.colors.muted;

  const backgroundColor = disabled ? undefined : isSelected ? accentColor : undefined;

  const textColor = disabled
    ? theme.colors.muted
    : isSelected
    ? theme.colors.background
    : theme.colors.text;

  return (
    <Box
      borderStyle="round"
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      paddingX={2}
      paddingY={0}
      flexShrink={0}
    >
      <Text color={textColor} bold={isSelected && !disabled}>
        {label}
      </Text>
    </Box>
  );
}
