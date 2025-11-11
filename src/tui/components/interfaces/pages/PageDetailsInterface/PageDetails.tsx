import { useState, useMemo } from "react";
import { Box, Text } from "ink";
import { AsyncActionDialog } from "@comps/modals/AsyncActionDialog";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useTerminalDimensions } from "@/tui/hooks/useTerminalDimensions";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import type { Page } from "@/types";
import { InfoTab } from "./InfoTab";
import { ContentTab } from "./ContentTab";
import { MetaTab } from "./MetaTab";
import { ActionsTab } from "./ActionsTab";
import { MovePageDialog } from "./MovePageDialog";
import { ConvertEditorDialog } from "./ConvertEditorDialog";
import { usePageDetails } from "./hooks/usePageDetails";
import { usePageActions } from "./hooks/usePageActions";
import { usePageDetailsKeyboard } from "./hooks/usePageDetailsKeyboard";

interface PageDetailsModalProps {
  page: Page;
  onClose: () => void;
  onRefresh?: () => Promise<void>;
  onSetStatus?: (message: string, duration?: number) => void;
}

export function PageDetails({
  page,
  onClose,
  onRefresh,
  onSetStatus,
}: PageDetailsModalProps) {
  const [currentTab, setCurrentTab] = useState<
    "info" | "content" | "meta" | "actions"
  >("info");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenderConfirm, setShowRenderConfirm] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<number>(0);
  const [contentScrollPosition, setContentScrollPosition] = useState(0);
  const [infoScrollPosition, setInfoScrollPosition] = useState(0);
  const [metaScrollPosition, setMetaScrollPosition] = useState(0);
  const [inActionsMenu, setInActionsMenu] = useState(false);
  const [showMovePrompt, setShowMovePrompt] = useState(false);
  const [showConvertPrompt, setShowConvertPrompt] = useState(false);
  const { theme } = useTheme();
  const { width, height } = useTerminalDimensions();

  // Use custom hooks
  const { detailedPage, loading, error, loadPageDetails } = usePageDetails(page);

  const {
    handleCopyPath,
    handleDelete,
    handleMove,
    handleConvert,
    handleRender,
  } = usePageActions({
    page,
    setCopyStatus,
    loadPageDetails,
  });

  // Setup escape handling
  useEscape("page-details", () => {
    if (showMovePrompt) {
      setShowMovePrompt(false);
    } else if (showConvertPrompt) {
      setShowConvertPrompt(false);
    } else if (showRenderConfirm) {
      setShowRenderConfirm(false);
    } else if (showDeleteConfirm) {
      setShowDeleteConfirm(false);
    } else {
      onClose();
    }
  });

  // Handle keyboard input
  usePageDetailsKeyboard({
    currentTab,
    setCurrentTab,
    selectedAction,
    setSelectedAction,
    inActionsMenu,
    setInActionsMenu,
    contentScrollPosition,
    setContentScrollPosition,
    infoScrollPosition,
    setInfoScrollPosition,
    metaScrollPosition,
    setMetaScrollPosition,
    showDeleteConfirm,
    showMovePrompt,
    showConvertPrompt,
    showRenderConfirm,
    setShowMovePrompt,
    setShowConvertPrompt,
    setShowRenderConfirm,
    setShowDeleteConfirm,
    detailedPage,
    height,
    onCopyPath: () => void handleCopyPath(detailedPage?.path),
  });

  // Dynamic footer help text based on current tab and state
  const footerHelpText = useMemo(() => {
    // When in actions menu, left/right arrows don't work - only Tab and number keys switch tabs
    const baseHelp = inActionsMenu
      ? "Tab/1-4 switch tabs • Esc close"
      : "Tab/←→ switch tabs • 1-4 quick jump • Esc close";

    if (currentTab === "info") {
      return `${baseHelp} • ↑↓ scroll`;
    } else if (currentTab === "content") {
      return `${baseHelp} • ↑↓ scroll • PgUp/PgDn fast scroll`;
    } else if (currentTab === "meta") {
      return `${baseHelp} • ↑↓ scroll`;
    } else if (currentTab === "actions") {
      if (inActionsMenu) {
        return `${baseHelp} • ↑↓ select • Enter confirm`;
      }
      return `${baseHelp} • ↓ enter actions`;
    }
    return baseHelp;
  }, [currentTab, inActionsMenu]);

  useFooterHelp(footerHelpText);

  const renderTabContent = () => {
    if (loading) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color={theme.colors.warning}>🔍 Loading page details...</Text>
          <Text color={theme.colors.info}>Path: {page.path}</Text>
          <Text color={theme.colors.info}>Locale: {page.locale}</Text>
          <Text color={theme.colors.info}>ID: {page.id}</Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color={theme.colors.error}>❌ Error: {error}</Text>
          <Text color={theme.colors.warning}>Attempted path: {page.path}</Text>
          <Text color={theme.colors.warning}>
            Attempted locale: {page.locale}
          </Text>
        </Box>
      );
    }

    if (!detailedPage) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color={theme.colors.muted}>No details available</Text>
          <Text color={theme.colors.warning}>Page ID: {page.id}</Text>
          <Text color={theme.colors.warning}>Page Path: {page.path}</Text>
          <Text color={theme.colors.warning}>Page Locale: {page.locale}</Text>
          <Text color={theme.colors.error}>DetailedPage is null/undefined</Text>
        </Box>
      );
    }

    switch (currentTab) {
      case "info":
        return (
          <InfoTab
            detailedPage={detailedPage}
            selectedIndex={infoScrollPosition}
          />
        );

      case "content":
        return (
          <ContentTab
            detailedPage={detailedPage}
            contentScrollPosition={contentScrollPosition}
          />
        );

      case "meta":
        return (
          <MetaTab
            detailedPage={detailedPage}
            selectedIndex={metaScrollPosition}
          />
        );

      case "actions":
        return (
          <ActionsTab
            detailedPage={detailedPage}
            page={page}
            inActionsMenu={inActionsMenu}
            selectedAction={selectedAction}
            copyStatus={copyStatus}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box flexDirection="column" width={width} flexGrow={1}>
      {/* Header */}
      <Box
        paddingX={1}
        borderStyle="single"
        borderColor={theme.colors.info}
        flexShrink={0}
      >
        <Text color={theme.colors.info} bold>
          📋 Page Details: {page.title}
        </Text>
      </Box>

      {/* Tab Navigation */}
      <Box
        paddingX={1}
        borderStyle="single"
        borderColor={
          currentTab === "info"
            ? theme.colors.info
            : currentTab === "content"
            ? theme.colors.warning
            : currentTab === "meta"
            ? theme.colors.accent
            : currentTab === "actions"
            ? theme.colors.success
            : theme.colors.muted
        }
        flexShrink={0}
      >
        <Text
          color={
            currentTab === "info" ? theme.colors.background : theme.colors.info
          }
          backgroundColor={
            currentTab === "info" ? theme.colors.info : undefined
          }
          bold={currentTab === "info"}
        >
          1. Info
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "content"
              ? theme.colors.background
              : theme.colors.warning
          }
          backgroundColor={
            currentTab === "content" ? theme.colors.warning : undefined
          }
          bold={currentTab === "content"}
        >
          2. Content
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "meta"
              ? theme.colors.background
              : theme.colors.accent
          }
          backgroundColor={
            currentTab === "meta" ? theme.colors.accent : undefined
          }
          bold={currentTab === "meta"}
        >
          3. Metadata
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "actions"
              ? theme.colors.background
              : theme.colors.success
          }
          backgroundColor={
            currentTab === "actions" ? theme.colors.success : undefined
          }
          bold={currentTab === "actions"}
        >
          4. Actions
        </Text>
      </Box>

      {/* Content Area - Conditional rendering based on dialogs */}
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        {showDeleteConfirm ? (
          <AsyncActionDialog
            title="CONFIRM DELETION???"
            message="Are you sure you want to delete this page?"
            confirmText="Yes, delete it"
            cancelText="No, cancel"
            items={[`• ${page.path} - ${page.title}`]}
            destructive={true}
            loadingMessage="Deleting page..."
            successMessage={`Successfully deleted: ${page.title}`}
            onConfirm={handleDelete}
            onSuccess={async () => {
              onClose();
              if (onRefresh) await onRefresh();
              onSetStatus?.(`Deleted page: ${page.title}`, 3000);
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        ) : showRenderConfirm ? (
          <AsyncActionDialog
            title="Confirm Render"
            message="Force re-render this page?"
            confirmText="Yes, render"
            cancelText="Cancel"
            items={[`• ${page.path} - ${page.title}`]}
            destructive={false}
            loadingMessage="Rendering page..."
            successMessage="Page rendered successfully!"
            onConfirm={handleRender}
            onSuccess={() => {
              setShowRenderConfirm(false);
              onSetStatus?.(`Rendered page: ${page.title}`, 3000);
            }}
            onCancel={() => setShowRenderConfirm(false)}
          />
        ) : showMovePrompt ? (
          <MovePageDialog
            currentPath={page.path}
            currentLocale={page.locale}
            onMove={handleMove}
            onSuccess={async (newPath) => {
              onClose();
              if (onRefresh) await onRefresh();
              onSetStatus?.(`Moved page: ${page.title} → ${newPath}`, 3000);
            }}
            onCancel={() => setShowMovePrompt(false)}
          />
        ) : showConvertPrompt ? (
          <ConvertEditorDialog
            currentEditor={detailedPage?.editor ?? "unknown"}
            onConvert={handleConvert}
            onSuccess={() => {
              setShowConvertPrompt(false);
              onSetStatus?.(`Converted editor for: ${page.title}`, 3000);
            }}
            onCancel={() => setShowConvertPrompt(false)}
          />
        ) : (
          renderTabContent()
        )}
      </Box>
    </Box>
  );
}
