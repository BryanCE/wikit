import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useState } from "react";
import { AsyncActionDialog } from "@comps/modals/AsyncActionDialog";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";

interface MovePageDialogProps {
  currentPath: string;
  currentLocale: string;
  onMove: (destinationPath: string, locale: string) => Promise<void>;
  onSuccess: (newPath: string) => void;
  onCancel: () => void;
}

type Field = "destination" | "locale" | "move";

export function MovePageDialog({
  currentPath,
  currentLocale,
  onMove,
  onSuccess,
  onCancel,
}: MovePageDialogProps) {
  const { theme } = useTheme();
  const [destination, setDestination] = useState("");
  const [locale, setLocale] = useState(currentLocale);
  const [currentField, setCurrentField] = useState<Field>("destination");
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useInput((input, key) => {
    if (showConfirmation) return;

    if (key.escape) {
      if (isEditing) {
        setIsEditing(false);
      } else {
        onCancel();
      }
      return;
    }

    if (isEditing) {
      // TextInput handles all input - we just need to handle save
      if (key.return) {
        if (currentField === "destination") {
          setDestination(inputValue);
        } else if (currentField === "locale") {
          setLocale(inputValue);
        }
        setIsEditing(false);
        return;
      }
      // TextInput component handles all other input (typing, backspace, etc)
    } else {
      if (key.upArrow) {
        if (currentField === "locale") {
          setCurrentField("destination");
        } else if (currentField === "move") {
          setCurrentField("locale");
        }
        return;
      }

      if (key.downArrow) {
        if (currentField === "destination") {
          setCurrentField("locale");
        } else if (currentField === "locale") {
          setCurrentField("move");
        }
        return;
      }

      if (key.return) {
        if (currentField === "move") {
          if (destination) {
            setShowConfirmation(true);
          }
        } else {
          const value = currentField === "destination" ? destination : locale;
          setInputValue(value);
          setIsEditing(true);
        }
      }
    }
  });

  if (showConfirmation) {
    return (
      <Box
        position="absolute"
        width={70}
        flexDirection="column"
        borderStyle="double"
        borderColor={theme.colors.warning}
        backgroundColor="black"
        paddingX={2}
        paddingY={1}
      >
        <AsyncActionDialog
          title="Confirm Move"
          message={`Move "${currentPath}" to "${destination}"?`}
          confirmText="Move"
          cancelText="Cancel"
          items={[`• Locale: ${locale}`]}
          destructive={false}
          loadingMessage="Moving page..."
          successMessage="Page moved successfully!"
          onConfirm={() => onMove(destination, locale)}
          onSuccess={() => onSuccess(destination)}
          onCancel={() => setShowConfirmation(false)}
        />
      </Box>
    );
  }

  const isFieldSelected = (field: Field) => currentField === field && !isEditing;
  const isFieldEditing = (field: Field) => currentField === field && isEditing;

  return (
    <Box
      position="absolute"
      width={70}
      flexDirection="column"
      borderStyle="double"
      borderColor={theme.colors.warning}
      backgroundColor="black"
      paddingX={2}
      paddingY={1}
    >
      <Text color={theme.colors.warning} bold>
        Move Page
      </Text>
      <Text color={theme.colors.muted}>
        Current: {currentPath} ({currentLocale})
      </Text>

      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text
            color={
              isFieldSelected("destination") || isFieldEditing("destination")
                ? theme.colors.primary
                : theme.colors.text
            }
            bold={isFieldSelected("destination")}
          >
            {isFieldSelected("destination") ? " ► " : "   "}
            Destination:{" "}
          </Text>
          {isFieldEditing("destination") ? (
            <TextInput
              value={inputValue}
              onChange={setInputValue}
              placeholder="destination path"
              focus={true}
              showCursor={true}
            />
          ) : (
            <Text
              color={
                isFieldSelected("destination")
                  ? theme.colors.primary
                  : theme.colors.text
              }
            >
              {destination || "(empty)"}
            </Text>
          )}
        </Box>

        <Box marginTop={1}>
          <Text
            color={
              isFieldSelected("locale") || isFieldEditing("locale")
                ? theme.colors.primary
                : theme.colors.text
            }
            bold={isFieldSelected("locale")}
          >
            {isFieldSelected("locale") ? " ► " : "   "}
            Locale:{" "}
          </Text>
          {isFieldEditing("locale") ? (
            <TextInput
              value={inputValue}
              onChange={setInputValue}
              placeholder="locale"
              focus={true}
              showCursor={true}
            />
          ) : (
            <Text
              color={
                isFieldSelected("locale")
                  ? theme.colors.primary
                  : theme.colors.text
              }
            >
              {locale}
            </Text>
          )}
        </Box>

        <Box marginTop={1}>
          <Text
            color={isFieldSelected("move") ? theme.colors.success : theme.colors.text}
            bold={isFieldSelected("move")}
          >
            {isFieldSelected("move") ? " ► " : "   "}
            [Move Page]
          </Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text color={theme.colors.muted}>
          {isEditing
            ? formatHelpText("Enter=save", HELP_TEXT.CANCEL)
            : formatHelpText(HELP_TEXT.NAVIGATE, "Enter=edit/select", HELP_TEXT.CANCEL)}
        </Text>
      </Box>
    </Box>
  );
}
