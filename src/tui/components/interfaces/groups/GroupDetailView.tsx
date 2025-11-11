import { Box, Text, useInput } from "ink";
import { useState } from "react";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { Group } from "@/types";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface GroupDetailViewProps {
  group: Group;
  onNavigate?: (section: "members" | "permissions" | "pageRules") => void;
}

type MenuItem = {
  id: string;
  label: string;
  count: number;
  section: "info" | "members" | "permissions" | "pageRules";
};

export function GroupDetailView({ group, onNavigate }: GroupDetailViewProps) {
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const menuItems: MenuItem[] = [
    { id: "info", label: "Basic Information", count: 0, section: "info" },
    { id: "members", label: "Members", count: group.users?.length ?? 0, section: "members" },
    { id: "permissions", label: "Permissions", count: group.permissions.length, section: "permissions" },
    { id: "pageRules", label: "Page Rules", count: group.pageRules?.length ?? 0, section: "pageRules" },
  ];

  useFooterHelp(COMMON_HELP_PATTERNS.DETAIL_VIEW_SECTIONS);
  useFooterStatus(`Group: ${group.name} | ID: ${group.id}`);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(menuItems.length - 1, prev + 1));
    } else if (key.return) {
      const selected = menuItems[selectedIndex];
      if (!selected) return;
      if (selected.section === "info") {
        // Already viewing info in this component
        return;
      }
      onNavigate?.(selected.section);
    }
  });

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Group: {group.name}
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text color={theme.colors.secondary} bold>ID: </Text>
          <Text color={theme.colors.text}>{group.id}</Text>
        </Box>
        <Box>
          <Text color={theme.colors.secondary} bold>System Group: </Text>
          <Text color={theme.colors.text}>{group.isSystem ? "Yes" : "No"}</Text>
        </Box>
        <Box>
          <Text color={theme.colors.secondary} bold>Redirect on Login: </Text>
          <Text color={theme.colors.text}>{group.redirectOnLogin ?? "(not set)"}</Text>
        </Box>
        <Box>
          <Text color={theme.colors.secondary} bold>Created: </Text>
          <Text color={theme.colors.text}>{new Date(group.createdAt).toLocaleString()}</Text>
        </Box>
        <Box>
          <Text color={theme.colors.secondary} bold>Updated: </Text>
          <Text color={theme.colors.text}>{new Date(group.updatedAt).toLocaleString()}</Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text color={theme.colors.accent} bold>Sections</Text>
      </Box>

      <VirtualizedList
        items={menuItems}
        selectedIndex={selectedIndex}
        getItemKey={(item) => item.id}
        itemHeight={1}
        renderItem={(item, index, isHighlighted) => (
          <Box height={1} flexShrink={0}>
            <Text
              color={isHighlighted ? theme.colors.accent : theme.colors.text}
              bold={isHighlighted}
              wrap="truncate"
            >
              {isHighlighted ? "▶ " : "  "}
              {item.label} ({item.count})
            </Text>
          </Box>
        )}
      />
    </Box>
  );
}
