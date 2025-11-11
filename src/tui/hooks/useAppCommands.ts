import { useCallback, useState } from "react";
import { getAvailableInstances } from "@/config/dynamicConfig";
import { themeNames, themes } from "@/tui/theme";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterStatus } from "@/tui/contexts/FooterContext";
import type { AppMode } from "@/tui/AppContent";

interface UseAppCommandsOptions {
  currentInstance: string | null;
  setCurrentMode: (mode: AppMode) => void;
  setCurrentInstance: (instance: string | null) => void;
}

export function useAppCommands({
  currentInstance,
  setCurrentMode,
  setCurrentInstance,
}: UseAppCommandsOptions) {
  const { toggleTheme, themeName } = useTheme();
  const [statusMsg, setStatusMsg] = useState("");
  useFooterStatus(statusMsg);

  const handleCommand = useCallback(
    (command: string) => {
      switch (command) {
        case "pages":
          setCurrentMode("pages" as AppMode);
          break;
        case "copypages":
          setCurrentMode("copypages" as AppMode);
          break;
        case "help":
          setCurrentMode("help" as AppMode);
          break;
        case "compare":
          setCurrentMode("compare" as AppMode);
          break;
        case "status":
          setCurrentMode("status" as AppMode);
          break;
        case "sync":
          setCurrentMode("sync" as AppMode);
          break;
        case "config":
          setCurrentMode("config" as AppMode);
          break;
        case "nav":
        case "navigation":
          setCurrentMode("navigation" as AppMode);
          break;
        case "users":
          setCurrentMode("users" as AppMode);
          break;
        case "groups":
          setCurrentMode("groups" as AppMode);
          break;
        case "analyze":
          setCurrentMode("exports" as AppMode); // Still using EXPORTS enum internally
          break;
        case "instance":
        case "i":
          // Cycle through available instances
          void (async () => {
            try {
              const availableInstances = await getAvailableInstances();
              if (availableInstances.length > 1) {
                const currentIndex = currentInstance
                  ? availableInstances.indexOf(currentInstance)
                  : -1;
                const nextIndex = (currentIndex + 1) % availableInstances.length;
                const nextInstance = availableInstances[nextIndex];
                setCurrentInstance(nextInstance ?? null);
                setStatusMsg(`Switched to ${nextInstance} instance`);
                setTimeout(() => setStatusMsg(""), 800);
              } else {
                setStatusMsg("Only one instance configured");
                setTimeout(() => setStatusMsg(""), 800);
              }
            } catch {
              setStatusMsg("Error switching instances");
              setTimeout(() => setStatusMsg(""), 2000);
            }
          })();
          break;
        case "theme":
          setCurrentMode("theme" as AppMode);
          break;
        case "t":
          toggleTheme();
          // Use setTimeout to get the updated theme name after state change
          setTimeout(() => {
            const currentIndex = themeNames.indexOf(themeName);
            const nextIndex = (currentIndex + 1) % themeNames.length;
            const nextThemeName = themeNames[nextIndex];
            if (nextThemeName) {
              const nextTheme = themes[nextThemeName];
              setStatusMsg(`Switched to ${nextTheme.name} theme`);
              setTimeout(() => setStatusMsg(""), 1000);
            }
          }, 0);
          break;
        case "exit":
        case "quit":
          process.exit(0);
          break;
        default:
          setStatusMsg(
            `Unknown command: /${command}. Type '/help' for available commands.`
          );
          setTimeout(() => setStatusMsg(""), 3000);
      }
    },
    [
      currentInstance,
      setCurrentMode,
      setCurrentInstance,
      toggleTheme,
      themeName,
    ]
  );

  return { handleCommand };
}
