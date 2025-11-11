import { useInput } from "ink";
import type { HelpKeyboardHookProps, HelpTab } from "../types";

export function useHelpKeyboard({
  currentTab,
  setCurrentTab,
  inCommandsContent,
  setInCommandsContent,
  inNavigationContent,
  setInNavigationContent,
  inUIComponentsContent,
  setInUIComponentsContent,
  commandSelectedIndex,
  setCommandSelectedIndex,
  navigationSelectedIndex,
  setNavigationSelectedIndex,
  uiComponentsSelectedIndex,
  setUIComponentsSelectedIndex,
  commandsCount,
  navigationCount,
  uiComponentsCount,
}: HelpKeyboardHookProps) {
  useInput((input, key) => {
    // Helper: Get current state for active tab
    const isInContent =
      (currentTab === "commands" && inCommandsContent) ||
      (currentTab === "navigation" && inNavigationContent) ||
      (currentTab === "ui" && inUIComponentsContent);

    const exitAllContentModes = () => {
      setInCommandsContent(false);
      setInNavigationContent(false);
      setInUIComponentsContent(false);
    };

    const switchToTab = (tab: HelpTab) => {
      exitAllContentModes();
      setCurrentTab(tab);
    };

    // Tab key - ALWAYS works - exits content modes and switches tabs
    if (key.tab) {
      exitAllContentModes();
      if (currentTab === "commands") {
        setCurrentTab("navigation");
      } else if (currentTab === "navigation") {
        setCurrentTab("ui");
      } else {
        setCurrentTab("commands");
      }
      return;
    }

    // Arrow keys for tab navigation - ONLY when NOT in content
    if (!isInContent) {
      if (key.rightArrow) {
        if (currentTab === "commands") {
          setCurrentTab("navigation");
        } else if (currentTab === "navigation") {
          setCurrentTab("ui");
        } else {
          setCurrentTab("commands");
        }
        return;
      }
      if (key.leftArrow) {
        if (currentTab === "commands") {
          setCurrentTab("ui");
        } else if (currentTab === "navigation") {
          setCurrentTab("commands");
        } else {
          setCurrentTab("navigation");
        }
        return;
      }
    }

    // Quick tab keys - ALWAYS work
    if (input === "1") {
      switchToTab("commands");
      return;
    }
    if (input === "2") {
      switchToTab("navigation");
      return;
    }
    if (input === "3") {
      switchToTab("ui");
      return;
    }

    // COMMANDS TAB
    if (currentTab === "commands") {
      // Enter content
      if (!inCommandsContent && key.downArrow) {
        setInCommandsContent(true);
        return;
      }

      // Exit content (up arrow at position 0)
      if (inCommandsContent && key.upArrow && commandSelectedIndex === 0) {
        setInCommandsContent(false);
        return;
      }

      // Content navigation
      if (inCommandsContent) {
        if (key.upArrow) {
          setCommandSelectedIndex(Math.max(0, commandSelectedIndex - 1));
          return;
        }
        if (key.downArrow) {
          setCommandSelectedIndex(Math.min(commandsCount - 1, commandSelectedIndex + 1));
          return;
        }
      }
    }

    // NAVIGATION TAB
    if (currentTab === "navigation") {
      // Enter content
      if (!inNavigationContent && key.downArrow) {
        setInNavigationContent(true);
        return;
      }

      // Exit content (up arrow at position 0)
      if (inNavigationContent && key.upArrow && navigationSelectedIndex === 0) {
        setInNavigationContent(false);
        return;
      }

      // Content navigation
      if (inNavigationContent) {
        if (key.upArrow) {
          setNavigationSelectedIndex(Math.max(0, navigationSelectedIndex - 1));
          return;
        }
        if (key.downArrow) {
          setNavigationSelectedIndex(Math.min(navigationCount - 1, navigationSelectedIndex + 1));
          return;
        }
      }
    }

    // UI TAB
    if (currentTab === "ui") {
      // Enter content
      if (!inUIComponentsContent && key.downArrow) {
        setInUIComponentsContent(true);
        return;
      }

      // Exit content (up arrow at position 0)
      if (inUIComponentsContent && key.upArrow && uiComponentsSelectedIndex === 0) {
        setInUIComponentsContent(false);
        return;
      }

      // Content navigation
      if (inUIComponentsContent) {
        if (key.upArrow) {
          setUIComponentsSelectedIndex(Math.max(0, uiComponentsSelectedIndex - 1));
          return;
        }
        if (key.downArrow) {
          setUIComponentsSelectedIndex(Math.min(uiComponentsCount - 1, uiComponentsSelectedIndex + 1));
          return;
        }
      }
    }
  });
}
