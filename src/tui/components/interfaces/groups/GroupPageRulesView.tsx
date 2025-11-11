import { Box, Text, useInput } from "ink";
import { useState } from "react";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { Group, PageRule } from "@/types";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface GroupPageRulesViewProps {
  group: Group;
}

export function GroupPageRulesView({ group }: GroupPageRulesViewProps) {
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const pageRules = group.pageRules ?? [];

  useFooterHelp(COMMON_HELP_PATTERNS.LIST);
  useFooterStatus(`Group: ${group.name} | Page Rules: ${pageRules.length}`);

  useInput((input, key) => {
    if (pageRules.length === 0) return;

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(pageRules.length - 1, prev + 1));
    }
  });

  const formatPageRule = (rule: PageRule): string => {
    const action = rule.deny ? "[DENY]" : "[ALLOW]";
    const matchType = `[${rule.match}]`;
    const rolesStr = rule.roles.length > 0 ? ` Roles: ${rule.roles.join(", ")}` : "";
    const localesStr = rule.locales.length > 0 ? ` Locales: ${rule.locales.join(", ")}` : "";
    return `${action} ${matchType} ${rule.path}${rolesStr}${localesStr}`;
  };

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Page Rules: {group.name}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.secondary}>
          Total rules: {pageRules.length}
        </Text>
      </Box>

      {pageRules.length === 0 ? (
        <Box flexDirection="column">
          <Text color={theme.colors.muted}>No page rules defined for this group</Text>
        </Box>
      ) : (
        <VirtualizedList
          items={pageRules}
          selectedIndex={selectedIndex}
          getItemKey={(rule) => rule.id}
          itemHeight={1}
          renderItem={(rule, index, isHighlighted) => (
            <Box height={1} flexShrink={0}>
              <Text
                color={isHighlighted ? theme.colors.accent : theme.colors.text}
                bold={isHighlighted}
                wrap="truncate"
              >
                {isHighlighted ? "▶ " : "  "}
                {formatPageRule(rule)}
              </Text>
            </Box>
          )}
        />
      )}
    </Box>
  );
}
