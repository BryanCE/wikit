import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { InstanceContext } from "@/contexts/InstanceContext";
import type { HeaderData } from "@/types";

interface HeaderProps {
  headerData: HeaderData;
}

export function Header({ headerData }: HeaderProps) {
  const { theme } = useTheme();
  let instance: string | null = null;
  try {
    instance = InstanceContext.getInstance();
  } catch {
    // No instance set (during setup)
    instance = null;
  }

  const getInstanceBgColor = (inst: string | null) => {
    if (!inst) return theme.colors.muted;
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.info,
      theme.colors.accent,
    ];
    const hash = inst
      .split("")
      .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Box borderStyle="single" borderColor={theme.colors.muted} paddingX={1} width="100%" justifyContent="space-between">
      {headerData.title && (
        <Text color={theme.colors.primary}>
          {headerData.title}{headerData.metadata ? `: ${headerData.metadata}` : ""}
        </Text>
      )}
      {!headerData.title && <Box />}
      <Text
        color={theme.colors.background}
        backgroundColor={getInstanceBgColor(instance)}
        bold
      >
        [{instance ?? "No Instance"}]
      </Text>
    </Box>
  );
}
