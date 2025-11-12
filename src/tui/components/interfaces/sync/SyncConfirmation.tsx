import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { InstanceContext } from "@/contexts/InstanceContext";
import { instanceLabels } from "@/config";

interface SyncOption {
  key: string;
  label: string;
  desc: string;
}

interface SyncConfirmationProps {
  otherInstance: string;
  selectedOption: number;
  options: SyncOption[];
}

export function SyncConfirmation({
  otherInstance,
  selectedOption,
  options,
}: SyncConfirmationProps) {
  const { theme } = useTheme();
  const instance = InstanceContext.getInstance();

  useFooterHelp("Y=Yes • N/Esc=Cancel");

  return (
    <Box flexDirection="column">
      <Text color={theme.colors.warning} bold>
        ⚠️ Sync Confirmation
      </Text>
      <Box marginY={1}>
        <Text color={theme.colors.text}>
          This will overwrite configurations in {instanceLabels[otherInstance]}{" "}
          with settings from {instanceLabels[instance]}.
        </Text>
      </Box>
      <Text color={theme.colors.text}>
        Selected option: {options[selectedOption]?.label ?? "Unknown"}
      </Text>
      <Box marginY={1}>
        <Text color={theme.colors.text}>
          Are you sure you want to continue?
        </Text>
      </Box>
    </Box>
  );
}
