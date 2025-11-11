import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { Page } from "@/types";

interface DetailedPage extends Page {
  content?: string;
  description?: string;
  tags?: { id: string; title: string }[];
  createdAt?: string;
  updatedAt?: string;
  editor?: string;
  isPrivate?: boolean;
  hash?: string;
  contentType?: string;
}

interface ActionsTabProps {
  detailedPage: DetailedPage;
  page: Page;
  inActionsMenu: boolean;
  selectedAction: number;
  copyStatus: string;
}

export function ActionsTab({
  detailedPage,
  page,
  inActionsMenu,
  selectedAction,
  copyStatus,
}: ActionsTabProps) {
  const { theme } = useTheme();

  const pathToShow = detailedPage?.path || page.path;

  const actions = [
    {
      title: "Copy Path",
      description: `Copy "${pathToShow}" to clipboard`,
      color: theme.colors.primary,
    },
    {
      title: "Move Page",
      description: "Move page to different path/locale",
      color: theme.colors.warning,
    },
    {
      title: "Convert Editor",
      description: `Change editor (current: ${detailedPage?.editor ?? "unknown"})`,
      color: theme.colors.secondary,
    },
    {
      title: "Render Page",
      description: "Force re-render of page",
      color: theme.colors.success,
    },
    {
      title: "Delete Page",
      description: "Permanently delete this page",
      color: theme.colors.error,
    },
  ];

  return (
    <Box flexDirection="column" paddingX={1} flexGrow={1}>
      <Box
        flexGrow={1}
        borderStyle={inActionsMenu ? "round" : undefined}
        borderColor={inActionsMenu ? theme.colors.primary : undefined}
        paddingX={inActionsMenu ? 1 : 2}
        paddingY={inActionsMenu ? 0 : 1}
      >
        <VirtualizedList
        items={actions}
        selectedIndex={inActionsMenu ? selectedAction : -1}
        itemHeight={4}
        getItemKey={(_, index) => index.toString()}
        renderItem={(action, index, isHighlighted) => (
          <Box
            height={4}
            flexShrink={0}
            paddingX={1}
            borderStyle="round"
            borderColor={
              isHighlighted && inActionsMenu
                ? action.color
                : theme.colors.muted
            }
            backgroundColor={
              isHighlighted && inActionsMenu
                ? action.color
                : undefined
            }
          >
            <Box flexDirection="column">
              <Text
                color={
                  isHighlighted && inActionsMenu
                    ? "black"
                    : inActionsMenu
                    ? action.color
                    : theme.colors.muted
                }
                bold={isHighlighted && inActionsMenu}
              >
                {action.title}
              </Text>
              <Text
                color={
                  isHighlighted && inActionsMenu
                    ? "black"
                    : theme.colors.muted
                }
              >
                {action.description}
              </Text>
            </Box>
          </Box>
        )}
      />
      </Box>

      {copyStatus && (
        <Box marginTop={1} flexShrink={0}>
          <Text color={theme.colors.success}>{copyStatus}</Text>
        </Box>
      )}
    </Box>
  );
}
