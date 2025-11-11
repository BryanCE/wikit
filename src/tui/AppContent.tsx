import React, { useEffect, useState, useMemo } from "react";
import { render, Box, Text } from "ink";
import { useTerminalDimensions } from "@/tui/hooks/useTerminalDimensions";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooter, useFooterHelp } from "./contexts/FooterContext.js";
import { useHeader } from "./contexts/HeaderContext";
import { useAppCommands } from "@/tui/hooks/useAppCommands";
import { initializeApp } from "@/tui/utils/appInitializer";
import { ModeRenderer } from "@comps/app/ModeRenderer";
import { AppProviders } from "@comps/app/AppProviders";
import { Footer } from "@comps/ui/Footer.js";
import { Header } from "@comps/ui/Header";
import { COMMON_HELP_PATTERNS, formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import { InstanceContext } from "@/contexts/InstanceContext";

interface AppProps {
  instance?: string;
}

export enum AppMode {
  COMMAND = "command",
  PAGES = "pages",
  COPY_PAGES = "copypages",
  COMPARE = "compare",
  STATUS = "status",
  SYNC = "sync",
  CONFIG = "config",
  NAVIGATION = "navigation",
  USERS = "users",
  GROUPS = "groups",
  EXPORTS = "exports",
  SETUP = "setup",
  HELP = "help",
  THEME = "theme",
}

export function AppContent({ instance: initialInstance }: AppProps) {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.COMMAND);
  const [currentInstance, setCurrentInstance] = useState<string | null>(
    initialInstance ?? null
  );
  const [checkingSetup, setCheckingSetup] = useState(true);
  const { width, height } = useTerminalDimensions();
  const { theme } = useTheme();
  const { helpText, statusMessage } = useFooter();
  const headerData = useHeader();

  // Update global InstanceContext whenever currentInstance changes
  useEffect(() => {
    InstanceContext.setInstance(currentInstance);
  }, [currentInstance]);

  // Set mode-specific default help text (child components will override when they mount)
  const modeHelpText = useMemo(() => {
    switch (currentMode) {
      case AppMode.COMMAND:
        return "Type /command or → for quick menu • Ctrl+C to exit";
      case AppMode.PAGES:
        return COMMON_HELP_PATTERNS.LIST;
      case AppMode.COPY_PAGES:
        return formatHelpText(
          HELP_TEXT.NAVIGATE,
          HELP_TEXT.TOGGLE,
          "Enter=copy",
          HELP_TEXT.BACK
        );
      case AppMode.NAVIGATION:
        return COMMON_HELP_PATTERNS.LIST;
      case AppMode.USERS:
        return COMMON_HELP_PATTERNS.LIST;
      case AppMode.GROUPS:
        return COMMON_HELP_PATTERNS.LIST;
      case AppMode.HELP:
        return COMMON_HELP_PATTERNS.VIEW_ONLY;
      case AppMode.THEME:
        return COMMON_HELP_PATTERNS.MENU;
      default:
        return COMMON_HELP_PATTERNS.VIEW_ONLY;
    }
  }, [currentMode]);

  useFooterHelp(modeHelpText);

  const { handleCommand } = useAppCommands({
    currentInstance,
    setCurrentMode,
    setCurrentInstance,
  });

  // Check if setup is needed and initialize instance on component mount
  useEffect(() => {
    void initializeApp({
      currentInstance,
      setCurrentMode,
      setCurrentInstance,
      setCheckingSetup,
    });
  }, []);

  const handleEscape = () => {
    setCurrentMode(AppMode.COMMAND);
  };

  // Show loading while checking setup
  if (checkingSetup) {
    return (
      <Box
        flexDirection="column"
        width={width}
        height={height}
        justifyContent="center"
        alignItems="center"
      >
        <Text color={theme.colors.muted}>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Header */}
      <Header
        instance={currentInstance}
        headerData={headerData}
      />

      {/* Content based on current mode */}
      <Box flexDirection="column" flexGrow={1} minHeight={0}>
        <ModeRenderer
          currentMode={currentMode}
          currentInstance={currentInstance}
          handleCommand={handleCommand}
          handleEscape={handleEscape}
          setCurrentMode={setCurrentMode}
          setCurrentInstance={setCurrentInstance}
        />
      </Box>

      {/* Footer always at bottom */}
      <Box flexShrink={0}>
        <Footer
          helpText={helpText ?? undefined}
          statusMessage={statusMessage}
        />
      </Box>
    </Box>
  );
}

function App({ instance }: AppProps) {
  return (
    <AppProviders>
      <AppContent instance={instance} />
    </AppProviders>
  );
}

export function startTui(instance?: string) {
  // Clear the screen before starting TUI
  process.stdout.write("\x1Bc");

  render(<App instance={instance} />);
}
