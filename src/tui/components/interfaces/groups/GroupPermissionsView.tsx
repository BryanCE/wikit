import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { Group } from "@/types";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";

interface GroupPermissionsViewProps {
  group: Group;
}

export function GroupPermissionsView({ group }: GroupPermissionsViewProps) {
  const { theme } = useTheme();

  useFooterHelp(COMMON_HELP_PATTERNS.VIEW_ONLY);
  useFooterStatus(`Group: ${group.name} | Permissions: ${group.permissions.length}`);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Permissions: {group.name}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.secondary}>
          Total permissions: {group.permissions.length}
        </Text>
      </Box>

      {group.permissions.length === 0 ? (
        <Box flexDirection="column">
          <Text color={theme.colors.muted}>No permissions assigned to this group</Text>
        </Box>
      ) : (
        <VirtualizedList
          items={group.permissions}
          selectedIndex={-1}
          getItemKey={(permission, index) => `${permission}-${index}`}
          itemHeight={1}
          renderItem={(permission) => (
            <Box height={1} flexShrink={0}>
              <Text color={theme.colors.text} wrap="truncate">
                • {permission}
              </Text>
            </Box>
          )}
        />
      )}
    </Box>
  );
}
