import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { listGroups } from "@/api/groups";
import { logger } from "@/utils/logger";
import type { GroupMinimal } from "@/types";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface GroupSelectorProps {
  selectedGroupIds: number[];
  onConfirm: (groupIds: number[]) => void;
  onCancel: () => void;
}

export function GroupSelector({
  selectedGroupIds,
  onConfirm,
  onCancel,
}: GroupSelectorProps) {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<GroupMinimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [markedGroupIds, setMarkedGroupIds] = useState<Set<number>>(
    new Set(selectedGroupIds)
  );

  useFooterHelp(COMMON_HELP_PATTERNS.MULTI_SELECT);
  useFooterStatus(error ?? `${markedGroupIds.size} group(s) selected`);

  useEffect(() => {
    void loadGroups();
  }, []);

  const loadGroups = async () => {
    logger.info({ component: "GroupSelector" }, "Loading groups");
    setLoading(true);
    setError(null);
    try {
      const groupList = await listGroups();
      logger.info({ groupCount: groupList.length }, "Groups loaded successfully");
      setGroups(groupList);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error({ err }, "Failed to load groups in GroupSelector");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useInput((input, key) => {
    if (loading) return;

    if (key.escape) {
      onCancel();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(groups.length - 1, prev + 1));
    } else if (input === " ") {
      const currentGroup = groups[selectedIndex];
      if (currentGroup) {
        setMarkedGroupIds((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(currentGroup.id)) {
            newSet.delete(currentGroup.id);
          } else {
            newSet.add(currentGroup.id);
          }
          return newSet;
        });
      }
    } else if (key.return) {
      onConfirm(Array.from(markedGroupIds));
    }
  });

  if (loading) {
    return (
      <Box>
        <Text color={theme.colors.muted}>Loading groups...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Select Groups for User
        </Text>
      </Box>

      {groups.length === 0 ? (
        <Text color={theme.colors.muted}>No groups available</Text>
      ) : (
        <>
          <VirtualizedList
            items={groups}
            selectedIndex={selectedIndex}
            getItemKey={(group) => String(group.id)}
            itemHeight={1}
            renderItem={(group, index, isHighlighted) => {
              const isMarked = markedGroupIds.has(group.id);

              return (
                <Box height={1} flexShrink={0}>
                  <Text
                    color={isHighlighted ? theme.colors.accent : theme.colors.text}
                    bold={isHighlighted}
                    wrap="truncate"
                  >
                    {isHighlighted ? "▶ " : "  "}
                    {isMarked ? "[X] " : "[ ] "}
                    {group.name}
                    {group.isSystem && (
                      <Text color={theme.colors.muted}> [System]</Text>
                    )}
                    <Text color={theme.colors.muted}>
                      {" "}
                      ({group.userCount ?? 0} users)
                    </Text>
                  </Text>
                </Box>
              );
            }}
          />
        </>
      )}
    </Box>
  );
}
