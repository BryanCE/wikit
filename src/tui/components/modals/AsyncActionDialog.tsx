import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface AsyncActionDialogProps {
  // Confirmation stage
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  items?: string[];
  itemsLimit?: number;
  destructive?: boolean;

  // Loading stage
  loadingMessage: string;
  progressMessage?: string; // Dynamic progress updates

  // Success stage
  successMessage: string;
  successDuration?: number;

  // Action
  onConfirm: (setProgress: (msg: string) => void) => Promise<void>;
  onSuccess: () => void;
  onCancel: () => void;

  // Error handling
  onError?: (error: string) => void;
}

type DialogState = "confirming" | "loading" | "success" | "error";

export function AsyncActionDialog({
  title,
  message,
  confirmText,
  cancelText,
  items = [],
  itemsLimit = 5,
  destructive = false,
  loadingMessage,
  successMessage,
  successDuration = 3000,
  onConfirm,
  onSuccess,
  onCancel,
  onError,
}: AsyncActionDialogProps) {
  const { theme } = useTheme();
  const [state, setState] = useState<DialogState>("confirming");
  const [selectedOption, setSelectedOption] = useState<"confirm" | "cancel">("cancel");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentProgress, setCurrentProgress] = useState<string>("");

  const handleConfirm = async () => {
    setState("loading");
    setCurrentProgress(""); // Reset progress

    try {
      await onConfirm(setCurrentProgress);
      setState("success");

      // Show success message for specified duration, then call onSuccess
      setTimeout(() => {
        onSuccess();
      }, successDuration);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      setErrorMessage(errorMsg);
      setState("error");

      if (onError) {
        onError(errorMsg);
      }
    }
  };

  const handleRetry = () => {
    setErrorMessage("");
    setState("confirming");
    setSelectedOption("cancel");
  };

  useFooterHelp(
    state === "confirming"
      ? COMMON_HELP_PATTERNS.CONFIRMATION_DIALOG
      : ""
  );

  // Setup escape handling
  useEscape("async-action-dialog", () => {
    // Block escape during loading and success
    if (state === "loading" || state === "success") {
      return;
    }

    if (state === "error") {
      handleRetry();
    } else {
      onCancel();
    }
  });

  useInput((input, key) => {
    // Block all input during loading and success
    if (state === "loading" || state === "success") {
      return;
    }

    if (state === "error") {
      if (key.leftArrow) {
        setSelectedOption("confirm");
      } else if (key.rightArrow) {
        setSelectedOption("cancel");
      } else if (key.return) {
        if (selectedOption === "confirm") {
          handleRetry();
        } else {
          onCancel();
        }
      }
      return;
    }

    // Confirming state
    if (key.leftArrow) {
      setSelectedOption("confirm");
    } else if (key.rightArrow) {
      setSelectedOption("cancel");
    } else if (key.return) {
      if (selectedOption === "confirm") {
        void handleConfirm();
      } else {
        onCancel();
      }
    }
  });

  const confirmColor = destructive ? theme.colors.error : theme.colors.success;
  const titleColor = destructive ? theme.colors.error : theme.colors.warning;

  // Loading state
  if (state === "loading") {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color={theme.colors.warning} bold>
          {loadingMessage}
        </Text>
        {currentProgress && (
          <Box marginTop={1}>
            <Text color={theme.colors.accent}>{currentProgress}</Text>
          </Box>
        )}
        {items.length > 0 && !currentProgress && (
          <Box marginTop={1}>
            <Text color={theme.colors.text}>{items[0]?.replace("• ", "")}</Text>
          </Box>
        )}
        <Box marginTop={1}>
          <Text color={theme.colors.muted}>Please wait...</Text>
        </Box>
      </Box>
    );
  }

  // Success state
  if (state === "success") {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color={theme.colors.success} bold>
          {successMessage}
        </Text>
        <Box marginTop={1}>
          <Text color={theme.colors.muted}>Closing...</Text>
        </Box>
      </Box>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color={theme.colors.error} bold>
            Error
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.text}>{errorMessage}</Text>
        </Box>

        <Box>
          <Box
            marginRight={2}
            paddingX={2}
            paddingY={0}
            borderStyle="round"
            borderColor={
              selectedOption === "confirm" ? theme.colors.warning : theme.colors.muted
            }
            backgroundColor={
              selectedOption === "confirm" ? theme.colors.warning : undefined
            }
          >
            <Text
              color={selectedOption === "confirm" ? "black" : theme.colors.warning}
              bold={selectedOption === "confirm"}
            >
              Try Again
            </Text>
          </Box>

          <Box
            paddingX={2}
            paddingY={0}
            borderStyle="round"
            borderColor={
              selectedOption === "cancel" ? theme.colors.muted : theme.colors.muted
            }
            backgroundColor={
              selectedOption === "cancel" ? theme.colors.muted : undefined
            }
          >
            <Text
              color={selectedOption === "cancel" ? "black" : theme.colors.muted}
              bold={selectedOption === "cancel"}
            >
              Cancel
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  // Confirming state (default)
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
