import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import { VirtualizedList } from "@/tui/components/ui/VirtualizedList";
import { SearchBar } from "@/tui/components/ui/SearchBar";
import type { TeamMember } from "@/types";

interface ProfilesTabProps {
  instance: string;
  members: TeamMember[];
  selectedIndex: number;
  loading: boolean;
  error: string | null;
  inContent: boolean;
  searchQuery: string;
  isSearchActive: boolean;
}

export function ProfilesTab({
  instance: _instance,
  members,
  selectedIndex,
  loading,
  error,
  inContent,
  searchQuery,
  isSearchActive,
}: ProfilesTabProps) {
  const { theme } = useTheme();

  // Set footer help text
  const footerHelp = inContent
    ? formatHelpText("Tab/1-4=switch tabs", HELP_TEXT.NAVIGATE, HELP_TEXT.ENTER_SELECT, HELP_TEXT.BACK)
    : formatHelpText("Tab/←→ switch tabs", "1-4 quick jump", "type to search", "↓ enter list", HELP_TEXT.BACK);

  useFooterHelp(footerHelp);

  if (loading) {
    return (
      <Box>
        <Text color={theme.colors.warning}>Loading team members...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color={theme.colors.error}>Error: {error}</Text>
      </Box>
    );
  }

  const totalCount = members.length;
  const hasSearch = searchQuery.trim().length > 0;

  if (totalCount === 0 && !hasSearch) {
    return (
      <Box>
        <Text color={theme.colors.muted}>No team members found</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <SearchBar
        query={searchQuery}
        isActive={isSearchActive}
        placeholder="Press 's' to search profiles (name, email, team, role...)"
        resultCount={hasSearch ? members.length : undefined}
        totalCount={hasSearch ? totalCount : undefined}
      />

      {members.length === 0 && hasSearch ? (
        <Box padding={1}>
          <Text color={theme.colors.warning}>No profiles match your search</Text>
        </Box>
      ) : (
        <VirtualizedList
          items={members}
          selectedIndex={selectedIndex}
          getItemKey={(member) => String(member.id)}
          itemHeight={1}
          renderItem={(member, index, isHighlighted) => {
            const prefix = isHighlighted && inContent ? " ► " : "   ";

            // Muted when not in content, normal colors when in content
            const textColor = !inContent
              ? theme.colors.muted
              : isHighlighted
              ? theme.colors.background
              : theme.colors.text;

            // Format dates to YYYY-MM-DD
            const formatDate = (date?: string): string => {
              if (!date) return "";
              if (date.includes("T")) {
                return date.split("T")[0] ?? "";
              }
              return date;
            };

            const name = member.name.padEnd(25);
            const email = member.email.padEnd(30);
            const portfolio = (member.portfolio ?? "").padEnd(20);
            const team = (member.team ?? "").padEnd(20);
            const birthday = (formatDate(member.birthday) || "").padEnd(12);
            const hireDate = (formatDate(member.hire_date) || "").padEnd(12);
            const role = member.role ?? "";

            return (
              <Box height={1} flexShrink={0}>
                <Text
                  color={textColor}
                  backgroundColor={
                    isHighlighted && inContent ? theme.colors.primary : undefined
                  }
                  bold={isHighlighted && inContent}
                >
                  {prefix}{name}{email}{portfolio}{team}{birthday}{hireDate}{role}
                </Text>
              </Box>
            );
          }}
        />
      )}
    </Box>
  );
}
