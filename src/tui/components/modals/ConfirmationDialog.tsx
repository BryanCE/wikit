import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface ConfirmationDialogProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  items?: string[];
  itemsLimit?: number;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmationDialog({
  title,
  message,
  confirmText,
  cancelText,
  items = [],
  itemsLimit = 5,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmationDialogProps) {
  const { theme } = useTheme();
  const [selectedOption, setSelectedOption] = useState<"confirm" | "cancel">(
    "cancel"
  );

  useFooterHelp(COMMON_HELP_PATTERNS.CONFIRMATION_DIALOG);

  // Setup escape handling
  useEscape("confirmation", () => {
    onCancel();
  });

  useInput((input, key) => {
    if (key.leftArrow) {
      setSelectedOption("confirm");
    } else if (key.rightArrow) {
      setSelectedOption("cancel");
    } else if (key.return) {
      if (selectedOption === "confirm") {
        onConfirm();
      } else {
        onCancel();
      }
    }
  });

  const confirmColor = destructive ? theme.colors.error : theme.colors.success;
  const titleColor = destructive ? theme.colors.error : theme.colors.warning;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={titleColor} bold>
          {title}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.text}>{message}</Text>
      </Box>

      {items.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          {items.slice(0, itemsLimit).map((item, index) => (
            <Text key={index} color={theme.colors.primary}>
              {item}
            </Text>
          ))}
          {items.length > itemsLimit && (
            <Text color={theme.colors.muted}>
              ... and {items.length - itemsLimit} more
            </Text>
          )}
        </Box>
      )}

      <Box>
        <Box
          marginRight={2}
          paddingX={2}
          paddingY={0}
          borderStyle="round"
          borderColor={
            selectedOption === "confirm" ? confirmColor : theme.colors.muted
          }
          backgroundColor={
            selectedOption === "confirm" ? confirmColor : undefined
          }
        >
          <Text
            color={selectedOption === "confirm" ? "black" : confirmColor}
            bold={selectedOption === "confirm"}
          >
            {confirmText}
          </Text>
        </Box>

        <Box
          paddingX={2}
          paddingY={0}
          borderStyle="round"
          borderColor={
            selectedOption === "cancel"
              ? theme.colors.muted
              : theme.colors.muted
          }
          backgroundColor={
            selectedOption === "cancel" ? theme.colors.muted : undefined
          }
        >
          <Text
            color={selectedOption === "cancel" ? "black" : theme.colors.muted}
            bold={selectedOption === "cancel"}
          >
            {cancelText}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
