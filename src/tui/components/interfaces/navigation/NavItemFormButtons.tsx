import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";

interface NavItemFormButtonsProps {
  focusArea: "fields" | "buttons";
  selectedButton: "save" | "cancel";
}

export function NavItemFormButtons({
  focusArea,
  selectedButton,
}: NavItemFormButtonsProps) {
  const { theme } = useTheme();

  return (
    <Box marginTop={2} flexDirection="column">
      <Box>
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
                ? theme.colors.background
                : theme.colors.success
            }
            bold={focusArea === "buttons" && selectedButton === "save"}
          >
            Save
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
                ? theme.colors.background
                : theme.colors.muted
            }
            bold={focusArea === "buttons" && selectedButton === "cancel"}
          >
            Cancel
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
