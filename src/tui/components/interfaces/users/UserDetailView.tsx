import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { User, GroupMinimal } from "@/types";

interface UserDetailViewProps {
  user: User;
}

export function UserDetailView({ user }: UserDetailViewProps) {
  const { theme } = useTheme();

  useFooterHelp("Esc=back");

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          User Details
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>ID:</Text>
          </Box>
          <Text color={theme.colors.text}>{user.id}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Name:</Text>
          </Box>
          <Text color={theme.colors.text}>{user.name}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Email:</Text>
          </Box>
          <Text color={theme.colors.text}>{user.email}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Provider:</Text>
          </Box>
          <Text color={theme.colors.text}>
            {user.providerKey}
            {user.providerName ? ` (${user.providerName})` : ""}
          </Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Active:</Text>
          </Box>
          <Text
            color={user.isActive ? theme.colors.success : theme.colors.error}
          >
            {user.isActive ? "Yes" : "No"}
          </Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Verified:</Text>
          </Box>
          <Text
            color={user.isVerified ? theme.colors.success : theme.colors.error}
          >
            {user.isVerified ? "Yes" : "No"}
          </Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>System User:</Text>
          </Box>
          <Text color={theme.colors.text}>{user.isSystem ? "Yes" : "No"}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>2FA Active:</Text>
          </Box>
          <Text
            color={user.tfaIsActive ? theme.colors.success : theme.colors.muted}
          >
            {user.tfaIsActive ? "Yes" : "No"}
          </Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Location:</Text>
          </Box>
          <Text color={theme.colors.text}>{user.location ?? "(not set)"}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Job Title:</Text>
          </Box>
          <Text color={theme.colors.text}>{user.jobTitle ?? "(not set)"}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Timezone:</Text>
          </Box>
          <Text color={theme.colors.text}>{user.timezone}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Date Format:</Text>
          </Box>
          <Text color={theme.colors.text}>{user.dateFormat}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Appearance:</Text>
          </Box>
          <Text color={theme.colors.text}>{user.appearance}</Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Created:</Text>
          </Box>
          <Text color={theme.colors.text}>
            {new Date(user.createdAt).toLocaleString()}
          </Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text color={theme.colors.accent}>Updated:</Text>
          </Box>
          <Text color={theme.colors.text}>
            {new Date(user.updatedAt).toLocaleString()}
          </Text>
        </Box>

        {user.lastLoginAt && (
          <Box>
            <Box width={20}>
              <Text color={theme.colors.accent}>Last Login:</Text>
            </Box>
            <Text color={theme.colors.text}>
              {new Date(user.lastLoginAt).toLocaleString()}
            </Text>
          </Box>
        )}
      </Box>

      <Box flexDirection="column">
        <Text color={theme.colors.accent} bold>
          Groups:
        </Text>
        {user.groups.length === 0 ? (
          <Text color={theme.colors.muted}>No groups assigned</Text>
        ) : (
          <Box marginLeft={2}>
            <VirtualizedList
              items={user.groups}
              selectedIndex={-1}
              getItemKey={(group) => String(group.id)}
              itemHeight={1}
              renderItem={(group: GroupMinimal) => (
                <Box height={1} flexShrink={0}>
                  <Text color={theme.colors.text} wrap="truncate">
                    • {group.name} (ID: {group.id})
                    {group.isSystem && (
                      <Text color={theme.colors.muted}> [System]</Text>
                    )}
                  </Text>
                </Box>
              )}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
