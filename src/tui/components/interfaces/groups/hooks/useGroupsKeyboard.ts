import { useInput } from "ink";
import type { GroupMinimal } from "@/types";
import type { OrphanedUser } from "@/utils/userAnalyzer";

type TabType = "groups" | "orphaned";

interface UseGroupsKeyboardProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  inGroupsContent: boolean;
  setInGroupsContent: (value: boolean) => void;
  inOrphanedContent: boolean;
  setInOrphanedContent: (value: boolean) => void;

  // Groups tab state
  groups: GroupMinimal[];
  selectedGroupIndex: number;
  setSelectedGroupIndex: (value: number | ((prev: number) => number)) => void;
  onSelectGroup: (group: GroupMinimal) => void;

  // Orphaned tab state
  orphanedUsers: OrphanedUser[];
  selectedOrphanedIndex: number;
  setSelectedOrphanedIndex: (value: number | ((prev: number) => number)) => void;

  // Shared
  loading: boolean;
}

export function useGroupsKeyboard({
  currentTab,
  setCurrentTab,
  inGroupsContent,
  setInGroupsContent,
  inOrphanedContent,
  setInOrphanedContent,
  groups,
  selectedGroupIndex,
  setSelectedGroupIndex,
  onSelectGroup,
  orphanedUsers,
  selectedOrphanedIndex,
  setSelectedOrphanedIndex,
  loading,
}: UseGroupsKeyboardProps) {
  useInput((input, key) => {
    // Block input when loading
    if (loading) {
      return;
    }

    // Tab key ALWAYS works - exits content modes and switches tabs
    if (key.tab) {
      setInGroupsContent(false);
      setInOrphanedContent(false);
      setCurrentTab(currentTab === "groups" ? "orphaned" : "groups");
      return;
    }

    // Arrow keys for tab navigation - ONLY when NOT in content
    if (key.rightArrow && !inGroupsContent && !inOrphanedContent) {
      setCurrentTab("orphaned");
      return;
    }
    if (key.leftArrow && !inGroupsContent && !inOrphanedContent) {
      setCurrentTab("groups");
      return;
    }

    // Quick tab keys - ALWAYS work
    if (input === "1") {
      setCurrentTab("groups");
      setInGroupsContent(false);
      setInOrphanedContent(false);
      return;
    }
    if (input === "2") {
      setCurrentTab("orphaned");
      setInGroupsContent(false);
      setInOrphanedContent(false);
      return;
    }

    // GROUPS TAB: Enter content (down arrow when NOT in content)
    if (currentTab === "groups" && !inGroupsContent && key.downArrow) {
      setInGroupsContent(true);
      return;
    }

    // GROUPS TAB: Exit content (up arrow at position 0 when IN content)
    if (currentTab === "groups" && inGroupsContent && key.upArrow && selectedGroupIndex === 0) {
      setInGroupsContent(false);
      return;
    }

    // GROUPS TAB: Content navigation (when IN content)
    if (currentTab === "groups" && inGroupsContent) {
      if (key.upArrow) {
        setSelectedGroupIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setSelectedGroupIndex((prev) => Math.min(groups.length - 1, prev + 1));
        return;
      }
      if (key.return) {
        const selectedGroup = groups[selectedGroupIndex];
        if (selectedGroup) {
          onSelectGroup(selectedGroup);
        }
        return;
      }
    }

    // ORPHANED TAB: Enter content (down arrow when NOT in content)
    if (currentTab === "orphaned" && !inOrphanedContent && key.downArrow) {
      setInOrphanedContent(true);
      return;
    }

    // ORPHANED TAB: Exit content (up arrow at position 0 when IN content)
    if (currentTab === "orphaned" && inOrphanedContent && key.upArrow && selectedOrphanedIndex === 0) {
      setInOrphanedContent(false);
      return;
    }

    // ORPHANED TAB: Content navigation (when IN content)
    if (currentTab === "orphaned" && inOrphanedContent) {
      if (key.upArrow) {
        setSelectedOrphanedIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setSelectedOrphanedIndex((prev) => Math.min(orphanedUsers.length - 1, prev + 1));
        return;
      }
      // No Enter action needed for orphaned users - just viewing
    }
  });
}
