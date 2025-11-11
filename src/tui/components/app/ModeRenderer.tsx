import React from "react";
import { Box } from "ink";
import { CommandInput } from "@comps/input/CommandInput/CommandInput.js";
import { HelpScreen } from "@comps/help/HelpScreen.js";
import { PageCopyInterface } from "@comps/interfaces/pagecopy/PageCopyInterface.js";
import { CompareInterface } from "@comps/interfaces/compare/CompareInterface.js";
import { StatusInterface } from "@comps/interfaces/status/StatusInterface.js";
import { SyncInterface } from "@comps/interfaces/sync/SyncInterface.js";
import { ConfigInterface } from "@comps/interfaces/config/ConfigInterface.js";
import { SetupWizard } from "@comps/interfaces/config/SetupWizard.js";
import { NavInterface } from "@comps/interfaces/navigation/NavInterface.js";
import { UsersInterface } from "@comps/interfaces/users/UsersInterface.js";
import { GroupsInterface } from "@comps/interfaces/groups/GroupsInterface.js";
import { PagesInterface } from "@comps/interfaces/pages/PagesInterface.js";
import { AnalysisInterface } from "@comps/interfaces/analysis/AnalysisInterface.js";
import { ThemeSelector } from "@comps/ui/ThemeSelector.js";
import { NoInstanceMessage } from "./NoInstanceMessage";
import { getAvailableInstances } from "@/config/dynamicConfig";
import { AppMode } from "@/tui/AppContent";

interface ModeRendererProps {
  currentMode: AppMode;
  currentInstance: string | null;
  handleCommand: (command: string, args?: string) => void;
  handleEscape: () => void;
  setCurrentMode: (mode: AppMode) => void;
  setCurrentInstance: (instance: string | null) => void;
}

export function ModeRenderer({
  currentMode,
  currentInstance,
  handleCommand,
  handleEscape,
  setCurrentMode,
  setCurrentInstance,
}: ModeRendererProps) {
  // Modes that don't require an instance
  const noInstanceModes = [
    AppMode.COMMAND,
    AppMode.HELP,
    AppMode.CONFIG,
    AppMode.THEME,
    AppMode.SETUP,
    AppMode.EXPORTS,
  ];

  // Early return if mode requires instance but none available
  if (!noInstanceModes.includes(currentMode) && !currentInstance) {
    return <NoInstanceMessage />;
  }

  switch (currentMode) {
    case AppMode.COMMAND:
      return (
        <Box flexDirection="column" flexGrow={1}>
          <CommandInput onCommand={handleCommand} />
        </Box>
      );

    case AppMode.PAGES:
      return (
        <PagesInterface
          onEsc={handleEscape}
        />
      );

    case AppMode.COPY_PAGES:
      return (
        <PageCopyInterface
          onEsc={handleEscape}
        />
      );

    case AppMode.HELP:
      return <HelpScreen onClose={handleEscape} />;

    case AppMode.COMPARE:
      return (
        <CompareInterface
          onEsc={handleEscape}
        />
      );

    case AppMode.STATUS:
      return (
        <StatusInterface
          onEsc={handleEscape}
        />
      );

    case AppMode.SYNC:
      return (
        <SyncInterface
          onEsc={handleEscape}
        />
      );

    case AppMode.CONFIG:
      return (
        <ConfigInterface
          onEsc={() => setCurrentMode(AppMode.COMMAND)}
        />
      );

    case AppMode.NAVIGATION:
      return (
        <NavInterface
          onEsc={() => setCurrentMode(AppMode.COMMAND)}
        />
      );

    case AppMode.USERS:
      return (
        <UsersInterface
          onEsc={handleEscape}
        />
      );

    case AppMode.GROUPS:
      return (
        <GroupsInterface
          onEsc={handleEscape}
        />
      );

    case AppMode.EXPORTS:
      // Always render AnalysisInterface - it handles everything internally
      return (
        <AnalysisInterface
          onEsc={handleEscape}
        />
      );

    case AppMode.THEME:
      return (
        <Box flexDirection="column" flexGrow={1}>
          <ThemeSelector
            onSelect={() => {
              setCurrentMode(AppMode.COMMAND);
            }}
            onCancel={() => {
              setCurrentMode(AppMode.COMMAND);
            }}
          />
        </Box>
      );

    case AppMode.SETUP:
      return (
        <SetupWizard
          onComplete={async (success, instanceId) => {
            if (success) {
              // Set the newly created instance as current
              if (instanceId) {
                setCurrentInstance(instanceId);
              } else {
                // Fallback: use first available instance
                const availableInstances = await getAvailableInstances();
                if (availableInstances.length > 0) {
                  setCurrentInstance(availableInstances[0] ?? null);
                }
              }
              setCurrentMode(AppMode.COMMAND);
            } else {
              // User declined setup - exit the application
              process.exit(0);
            }
          }}
        />
      );

    default:
      return null;
  }
}
