import { useInput } from "ink";
import type { DetailedPage } from "./usePageDetails";
import { calculateContentViewportHeight } from "../layout";

type TabType = "info" | "content" | "meta" | "actions";

interface UsePageDetailsKeyboardProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType | ((prev: TabType) => TabType)) => void;
  selectedAction: number;
  setSelectedAction: (action: number | ((prev: number) => number)) => void;
  inActionsMenu: boolean;
  setInActionsMenu: (value: boolean) => void;
  contentScrollPosition: number;
  setContentScrollPosition: (position: number | ((prev: number) => number)) => void;
  infoScrollPosition: number;
  setInfoScrollPosition: (position: number | ((prev: number) => number)) => void;
  metaScrollPosition: number;
  setMetaScrollPosition: (position: number | ((prev: number) => number)) => void;
  showDeleteConfirm: boolean;
  showMovePrompt: boolean;
  showConvertPrompt: boolean;
  showRenderConfirm: boolean;
  setShowMovePrompt: (value: boolean) => void;
  setShowConvertPrompt: (value: boolean) => void;
  setShowRenderConfirm: (value: boolean) => void;
  setShowDeleteConfirm: (value: boolean) => void;
  detailedPage: DetailedPage | null;
  height: number;
  onCopyPath: () => void;
}

export function usePageDetailsKeyboard({
  currentTab,
  setCurrentTab,
  selectedAction,
  setSelectedAction,
  inActionsMenu,
  setInActionsMenu,
  contentScrollPosition: _contentScrollPosition,
  setContentScrollPosition,
  infoScrollPosition: _infoScrollPosition,
  setInfoScrollPosition,
  metaScrollPosition: _metaScrollPosition,
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
  onCopyPath,
}: UsePageDetailsKeyboardProps) {
  useInput((input, key) => {
    // Block input when dialogs are open
    if (showMovePrompt || showConvertPrompt || showDeleteConfirm || showRenderConfirm) {
      return;
    }

    // Tab navigation
    if (key.tab) {
      setSelectedAction(0);
      setInActionsMenu(false);
      setCurrentTab((prev) => {
        switch (prev) {
          case "info":
            return "content";
          case "content":
            return "meta";
          case "meta":
            return "actions";
          case "actions":
            return "info";
          default:
            return "info";
        }
      });
      return;
    }

    // Arrow navigation for tabs (only when not in actions menu context)
    if (key.rightArrow && !inActionsMenu) {
      setSelectedAction(0);
      setInActionsMenu(false);
      setCurrentTab((prev) => {
        switch (prev) {
          case "info":
            return "content";
          case "content":
            return "meta";
          case "meta":
            return "actions";
          case "actions":
            return "info";
          default:
            return "info";
        }
      });
    } else if (key.leftArrow && !inActionsMenu) {
      setSelectedAction(0);
      setInActionsMenu(false);
      setCurrentTab((prev) => {
        switch (prev) {
          case "info":
            return "actions";
          case "content":
            return "info";
          case "meta":
            return "content";
          case "actions":
            return "meta";
          default:
            return "info";
        }
      });
    }

    // Actions tab: down arrow enters menu, up arrow exits menu
    if (currentTab === "actions" && !inActionsMenu && key.downArrow) {
      setInActionsMenu(true);
      return;
    }
    if (currentTab === "actions" && inActionsMenu && key.upArrow && selectedAction === 0) {
      setInActionsMenu(false);
      return;
    }

    // Info tab scrolling
    if (
      currentTab === "info" &&
      !key.tab &&
      !key.leftArrow &&
      !key.rightArrow &&
      input !== "1" &&
      input !== "2" &&
      input !== "3" &&
      input !== "4"
    ) {
      // Info tab has ~8-9 items
      const maxScroll = 8;

      if (key.upArrow) {
        setInfoScrollPosition((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setInfoScrollPosition((prev) => Math.min(maxScroll, prev + 1));
        return;
      }
    }

    // Meta tab scrolling
    if (
      currentTab === "meta" &&
      !key.tab &&
      !key.leftArrow &&
      !key.rightArrow &&
      input !== "1" &&
      input !== "2" &&
      input !== "3" &&
      input !== "4"
    ) {
      // Meta tab has ~15 items
      const maxScroll = 14;

      if (key.upArrow) {
        setMetaScrollPosition((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setMetaScrollPosition((prev) => Math.min(maxScroll, prev + 1));
        return;
      }
    }

    // Content scrolling when in content tab - but allow tab switching to work
    if (
      currentTab === "content" &&
      detailedPage?.content &&
      !key.tab &&
      !key.leftArrow &&
      !key.rightArrow &&
      input !== "1" &&
      input !== "2" &&
      input !== "3" &&
      input !== "4"
    ) {
      const lines = detailedPage.content.split("\n");
      const viewportHeight = calculateContentViewportHeight(height);
      const maxScroll = Math.max(0, lines.length - viewportHeight);

      if (key.upArrow) {
        setContentScrollPosition((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setContentScrollPosition((prev) => Math.min(maxScroll, prev + 1));
        return;
      }
      if (key.pageUp) {
        setContentScrollPosition((prev) => Math.max(0, prev - 10));
        return;
      }
      if (key.pageDown) {
        setContentScrollPosition((prev) => Math.min(maxScroll, prev + 10));
        return;
      }
    }

    // Quick tab keys
    if (input === "1") {
      setCurrentTab("info");
      setContentScrollPosition(0);
      setInfoScrollPosition(0);
      setMetaScrollPosition(0);
      setSelectedAction(0);
      setInActionsMenu(false);
    }
    if (input === "2") {
      setCurrentTab("content");
      setContentScrollPosition(0);
      setInfoScrollPosition(0);
      setMetaScrollPosition(0);
      setSelectedAction(0);
      setInActionsMenu(false);
    }
    if (input === "3") {
      setCurrentTab("meta");
      setContentScrollPosition(0);
      setInfoScrollPosition(0);
      setMetaScrollPosition(0);
      setSelectedAction(0);
      setInActionsMenu(false);
    }
    if (input === "4") {
      setCurrentTab("actions");
      setContentScrollPosition(0);
      setInfoScrollPosition(0);
      setMetaScrollPosition(0);
      setSelectedAction(0);
      setInActionsMenu(false);
    }

    // Actions menu navigation
    if (currentTab === "actions" && inActionsMenu) {
      if (key.upArrow) {
        setSelectedAction((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedAction((prev) => Math.min(4, prev + 1));
      } else if (key.return) {
        if (selectedAction === 0) {
          void onCopyPath();
        } else if (selectedAction === 1) {
          setShowMovePrompt(true);
        } else if (selectedAction === 2) {
          setShowConvertPrompt(true);
        } else if (selectedAction === 3) {
          setShowRenderConfirm(true);
        } else if (selectedAction === 4) {
          setShowDeleteConfirm(true);
        }
      }
    }
  });
}
