import React, { useMemo, useState } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useTerminalDimensions } from "@/tui/hooks/useTerminalDimensions";
import { renderUnifiedDiff } from "@/utils/htmlDiff";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";

interface DiffViewerProps {
  fileLabel: string;
  localContent: string;
  liveContent: string;
  onBack: () => void;
}

export function DiffViewer({
  fileLabel,
  localContent,
  liveContent,
  onBack,
}: DiffViewerProps) {
  const { theme } = useTheme();
  const { height } = useTerminalDimensions();
  const [offset, setOffset] = useState(0);

  useHeaderData({ title: "Diff Viewer", metadata: fileLabel });
  useFooterHelp(
    formatHelpText(HELP_TEXT.NAVIGATE, "PgUp/PgDn=scroll", HELP_TEXT.BACK)
  );
  useEscape("diff-viewer", onBack);

  const lines = useMemo(
    () => renderUnifiedDiff(localContent, liveContent, fileLabel).split("\n"),
    [localContent, liveContent, fileLabel]
  );

  const viewportHeight = Math.max(5, height - 6);
  const maxOffset = Math.max(0, lines.length - viewportHeight);

  useInput((_input, key) => {
    if (key.upArrow) setOffset((o) => Math.max(0, o - 1));
    else if (key.downArrow) setOffset((o) => Math.min(maxOffset, o + 1));
    else if (key.pageUp)
      setOffset((o) => Math.max(0, o - viewportHeight));
    else if (key.pageDown)
      setOffset((o) => Math.min(maxOffset, o + viewportHeight));
  });

  const slice = lines.slice(offset, offset + viewportHeight);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box flexDirection="column" flexGrow={1}>
        {slice.map((line, i) => (
          <Text key={`${offset}-${i}`} wrap="truncate">
            {line}
          </Text>
        ))}
      </Box>
      <Box>
        <Text color={theme.colors.muted}>
          Lines {offset + 1}–{Math.min(lines.length, offset + viewportHeight)} / {lines.length}
        </Text>
      </Box>
    </Box>
  );
}
