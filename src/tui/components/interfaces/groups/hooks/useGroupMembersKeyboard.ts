import { useInput } from "ink";
import type { UserMinimal } from "@/types";

type TabType = "members" | "add";

interface UseGroupMembersKeyboardProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  inMembersContent: boolean;
  setInMembersContent: (value: boolean) => void;
  inAddContent: boolean;
  setInAddContent: (value: boolean) => void;

  // Members tab state
  members: UserMinimal[];
  selectedMemberIndex: number;
  setSelectedMemberIndex: (value: number | ((prev: number) => number)) => void;
  markedForRemoval: Set<number>;
  setMarkedForRemoval: (value: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  onShowRemoveConfirm: () => void;

  // Add tab state
  nonMembers: UserMinimal[];
  selectedAddIndex: number;
  setSelectedAddIndex: (value: number | ((prev: number) => number)) => void;
  onAddUser: (userId: number) => void;
  isLoading: boolean;
}

export function useGroupMembersKeyboard({
  currentTab,
  setCurrentTab,
  inMembersContent,
  setInMembersContent,
  inAddContent,
  setInAddContent,
  members,
  selectedMemberIndex,
  setSelectedMemberIndex,
  markedForRemoval,
  setMarkedForRemoval,
  onShowRemoveConfirm,
  nonMembers,
  selectedAddIndex,
  setSelectedAddIndex,
  onAddUser,
  isLoading,
}: UseGroupMembersKeyboardProps) {
  useInput((input, key) => {
    // Block input when loading
    if (isLoading) {
      return;
    }

    // Tab key ALWAYS works - exits content modes and switches tabs
    if (key.tab) {
      setInMembersContent(false);
      setInAddContent(false);
      setCurrentTab(currentTab === "members" ? "add" : "members");
      return;
    }

    // Arrow keys for tab navigation - ONLY when NOT in content
    if (key.rightArrow && !inMembersContent && !inAddContent) {
      setCurrentTab("add");
      return;
    }
    if (key.leftArrow && !inMembersContent && !inAddContent) {
      setCurrentTab("members");
      return;
    }

    // Quick tab keys - ALWAYS work
    if (input === "1") {
      setCurrentTab("members");
      setInMembersContent(false);
      setInAddContent(false);
      return;
    }
    if (input === "2") {
      setCurrentTab("add");
      setInMembersContent(false);
      setInAddContent(false);
      return;
    }

    // MEMBERS TAB: Enter content (down arrow when NOT in content)
    if (currentTab === "members" && !inMembersContent && key.downArrow && members.length > 0) {
      setInMembersContent(true);
      return;
    }

    // MEMBERS TAB: Exit content (up arrow at position 0 when IN content)
    if (currentTab === "members" && inMembersContent && key.upArrow && selectedMemberIndex === 0) {
      setInMembersContent(false);
      return;
    }

    // MEMBERS TAB: Content navigation (when IN content)
    if (currentTab === "members" && inMembersContent) {
      if (key.upArrow) {
        setSelectedMemberIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setSelectedMemberIndex((prev) => Math.min(members.length - 1, prev + 1));
        return;
      }
      // Space toggles selection
      if (input === " ") {
        const selectedMember = members[selectedMemberIndex];
        if (selectedMember) {
          setMarkedForRemoval((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(selectedMember.id)) {
              newSet.delete(selectedMember.id);
            } else {
              newSet.add(selectedMember.id);
            }
            return newSet;
          });
        }
        return;
      }
      // Enter shows confirmation dialog (if any marked)
      if (key.return && markedForRemoval.size > 0) {
        onShowRemoveConfirm();
        return;
      }
    }

    // ADD TAB: Enter content (down arrow when NOT in content)
    if (currentTab === "add" && !inAddContent && key.downArrow && nonMembers.length > 0) {
      setInAddContent(true);
      return;
    }

    // ADD TAB: Exit content (up arrow at position 0 when IN content)
    if (currentTab === "add" && inAddContent && key.upArrow && selectedAddIndex === 0) {
      setInAddContent(false);
      return;
    }

    // ADD TAB: Content navigation (when IN content)
    if (currentTab === "add" && inAddContent) {
      if (key.upArrow) {
        setSelectedAddIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setSelectedAddIndex((prev) => Math.min(nonMembers.length - 1, prev + 1));
        return;
      }
      // Enter adds the selected user
      if (key.return) {
        const selectedUser = nonMembers[selectedAddIndex];
        if (selectedUser) {
          onAddUser(selectedUser.id);
        }
        return;
      }
    }
  });
}
