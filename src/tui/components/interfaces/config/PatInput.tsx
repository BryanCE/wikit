import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { HELP_TEXT, formatHelpText } from "@/tui/constants/keyboard";

interface PatInputProps {
  onSubmit: (token: string) => void;
  onCancel: () => void;
}

export function PatInput({ onSubmit, onCancel }: PatInputProps) {
  const { theme } = useTheme();
  const [value, setValue] = useState("");
  useHeaderData({ title: "GitHub PAT", metadata: "Paste personal access token" });
  useFooterHelp(formatHelpText(HELP_TEXT.TYPE_TO_EDIT, HELP_TEXT.ENTER_SUBMIT, HELP_TEXT.BACK));
  useEscape("git-pat-input", onCancel);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          GitHub Personal Access Token
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text color={theme.colors.muted}>
          Token validated via GET https://api.github.com/user, then encrypted.
        </Text>
      </Box>
      <Box>
        <Text color={theme.colors.text}>Token: </Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={() => onSubmit(value.trim())}
          mask="•"
          focus
          showCursor
        />
      </Box>
    </Box>
  );
}
