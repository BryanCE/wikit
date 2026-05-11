import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { SyncStatus, TrackingEntry } from "@/types/tracking";

interface TrackedPagesListProps {
  entries: TrackingEntry[];
  statuses: Map<string, SyncStatus>;
  selectedIndex: number;
  selected: Set<string>;
  showTrackNewRow: boolean;
}

function statusBadge(status: SyncStatus | undefined): { label: string; colorKey: string } {
  switch (status) {
    case "in-sync":
      return { label: "in-sync     ", colorKey: "success" };
    case "drifted":
      return { label: "drifted     ", colorKey: "warning" };
    case "local-missing":
      return { label: "local-miss  ", colorKey: "error" };
    case "live-missing":
      return { label: "live-miss   ", colorKey: "error" };
    case "unchecked":
    case undefined:
    default:
      return { label: "unchecked   ", colorKey: "muted" };
  }
}

function entryKey(entry: TrackingEntry): string {
  return `${entry.wikiPath}::${entry.locale}`;
}

export function TrackedPagesList({
  entries,
  statuses,
  selectedIndex,
  selected,
  showTrackNewRow,
}: TrackedPagesListProps) {
  const { theme } = useTheme();

  type Row =
    | { kind: "track-new" }
    | { kind: "entry"; entry: TrackingEntry };

  const rows: Row[] = [
    ...(showTrackNewRow ? [{ kind: "track-new" as const }] : []),
    ...entries.map((entry) => ({ kind: "entry" as const, entry })),
  ];

  if (rows.length === 0) {
    return (
      <Box padding={1}>
        <Text color={theme.colors.muted}>No pages tracked. Add some.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <VirtualizedList
        items={rows}
        selectedIndex={selectedIndex}
        getItemKey={(row, i) =>
          row.kind === "track-new" ? "__track-new__" : `${entryKey(row.entry)}-${i}`
        }
        itemHeight={1}
        renderItem={(row, _index, isHighlighted) => {
          const prefix = isHighlighted ? " ► " : "   ";

          if (row.kind === "track-new") {
            return (
              <Box height={1} flexShrink={0}>
                <Text
                  color={
                    isHighlighted
                      ? theme.colors.background
                      : theme.colors.accent
                  }
                  backgroundColor={
                    isHighlighted ? theme.colors.primary : undefined
                  }
                  bold
                >
                  {prefix}+ Track new page
                </Text>
              </Box>
            );
          }

          const entry = row.entry;
          const status = statuses.get(entryKey(entry));
          const badge = statusBadge(status);
          const isMarked = selected.has(entryKey(entry));
          const marker = isMarked ? "[x]" : "[ ]";
          const statusColor =
            theme.colors[badge.colorKey as keyof typeof theme.colors] ??
            theme.colors.text;

          return (
            <Box height={1} flexShrink={0}>
              <Text
                color={
                  isHighlighted
                    ? theme.colors.background
                    : theme.colors.text
                }
                backgroundColor={
                  isHighlighted ? theme.colors.primary : undefined
                }
                wrap="truncate"
              >
                {prefix}
                {marker}{" "}
              </Text>
              <Text
                color={isHighlighted ? theme.colors.background : statusColor}
                backgroundColor={
                  isHighlighted ? theme.colors.primary : undefined
                }
              >
                {badge.label}
              </Text>
              <Text
                color={
                  isHighlighted
                    ? theme.colors.background
                    : theme.colors.text
                }
                backgroundColor={
                  isHighlighted ? theme.colors.primary : undefined
                }
                wrap="truncate"
              >
                {entry.wikiPath} → {entry.localFile}
              </Text>
            </Box>
          );
        }}
      />
    </Box>
  );
}
