import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { SearchBar } from "@comps/ui/SearchBar";
import type { UserMinimal } from "@/types";
import { getProviderName } from "@/utils/users";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface UsersListProps {
  users: UserMinimal[];
  selectedIndex: number;
  inUserList?: boolean;
  searchQuery?: string;
  isSearchActive?: boolean;
  totalCount?: number;
}

export function UsersList({
  users,
  selectedIndex,
  inUserList = false,
  searchQuery = "",
  isSearchActive = false,
  totalCount
}: UsersListProps) {
  const { theme } = useTheme();

  useFooterHelp(COMMON_HELP_PATTERNS.LIST);

  const hasSearch = searchQuery.trim().length > 0;
  const resultCount = hasSearch ? users.length : undefined;
  const total = totalCount ?? users.length;

  return (
    <Box flexDirection="column" flexGrow={1}>
      <SearchBar
        query={searchQuery}
        isActive={isSearchActive}
        placeholder="Press 's' to search users (name, email, provider...)"
        resultCount={resultCount}
        totalCount={hasSearch ? total : undefined}
      />

      {users.length === 0 && hasSearch ? (
        <Box padding={1}>
          <Text color={theme.colors.warning}>No users match your search</Text>
        </Box>
      ) : users.length === 0 ? (
        <Text color={theme.colors.muted}>No users found</Text>
      ) : (
        <>
          <VirtualizedList
            items={users}
            selectedIndex={selectedIndex}
            getItemKey={(user) => String(user.id)}
            itemHeight={1}
            renderItem={(user, index, isHighlighted) => (
              <Box height={1} flexShrink={0}>
                <Text
                  color={
                    inUserList
                      ? (isHighlighted ? theme.colors.primary : theme.colors.text)
                      : theme.colors.muted
                  }
                  bold={isHighlighted && inUserList}
                  wrap="truncate"
                  dimColor={!inUserList}
                >
                  {isHighlighted && inUserList ? " ► " : "   "}
                  {user.id.toString().padEnd(5)} {user.name.padEnd(25)}
                  {(user.email.length > 29 ? user.email.substring(0, 26) + "..." : user.email).padEnd(30)}
                  Provider: {getProviderName(user.providerKey).padEnd(10)}
                  Active: {user.isActive ? "[X]" : "[ ]"}
                  Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                </Text>
              </Box>
            )}
          />
        </>
      )}
    </Box>
  );
}
