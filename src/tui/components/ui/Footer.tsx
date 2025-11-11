import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";

interface FooterProps {
  helpText?: string;
  statusMessage?: string;
}

export function Footer({ helpText, statusMessage }: FooterProps) {
  const { theme } = useTheme();

  if (!helpText && !statusMessage) return null;

  return (
    <Box borderStyle="single" borderColor={theme.colors.muted} paddingX={1} width="100%" justifyContent="space-between">
      {helpText && <Text color={theme.colors.muted}>{helpText}</Text>}
      {!helpText && statusMessage && <Box />}
      {statusMessage && <Text color={theme.colors.secondary}>{statusMessage}</Text>}
    </Box>
  );
}
