import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import { VirtualizedList } from "@/tui/components/ui/VirtualizedList";
import { SearchBar } from "@/tui/components/ui/SearchBar";
import type { User } from "@/types";

interface ProfilesTabProps {
  users: User[];
  selectedIndex: number;
  loading: boolean;
  error: string | null;
  inContent: boolean;
  searchQuery: string;
  isSearchActive: boolean;
}

export function ProfilesTab({
  users,
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
    : formatHelpText("Tab/←→ switch tabs", "1-4 quick jump", "s=search", "↓ enter list", HELP_TEXT.BACK);

  useFooterHelp(footerHelp);

  if (loading) {
    return (
      <Box>
        <Text color={theme.colors.warning}>Loading user profiles...</Text>
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

  const totalCount = users.length;
  const hasSearch = searchQuery.trim().length > 0;

  if (totalCount === 0 && !hasSearch) {
    return (
      <Box>
        <Text color={theme.colors.muted}>No user profiles found</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <SearchBar
        query={searchQuery}
        isActive={isSearchActive}
        placeholder="Press 's' to search profiles (name, email, location, jobTitle...)"
        resultCount={hasSearch ? users.length : undefined}
        totalCount={hasSearch ? totalCount : undefined}
      />

      {users.length === 0 && hasSearch ? (
        <Box padding={1}>
          <Text color={theme.colors.warning}>No profiles match your search</Text>
        </Box>
      ) : (
        <VirtualizedList
          items={users}
          selectedIndex={selectedIndex}
          getItemKey={(user) => String(user.id)}
          itemHeight={1}
          renderItem={(user, index, isHighlighted) => {
            const prefix = isHighlighted && inContent ? " ► " : "   ";

            // Muted when not in content, normal colors when in content
            const textColor = !inContent
              ? theme.colors.muted
              : isHighlighted
              ? theme.colors.background
              : theme.colors.text;

            const bgColor = isHighlighted && inContent ? theme.colors.primary : undefined;

            // Build display: Name | Email | JobTitle | Location
            const parts = [user.name, user.email];
            if (user.jobTitle) parts.push(user.jobTitle);
            if (user.location) parts.push(user.location);

            return (
              <Box key={user.id}>
                <Text color={textColor} backgroundColor={bgColor}>
                  {prefix}{parts.join(" | ")}
                </Text>
              </Box>
            );
          }}
        />
      )}
    </Box>
  );
}
