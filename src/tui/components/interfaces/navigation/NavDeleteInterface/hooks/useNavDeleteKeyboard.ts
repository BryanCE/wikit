import { useInput } from "ink";
import type { NavigationItem } from "@/types";

interface FlatNavigationItem extends NavigationItem {
  depth: number;
  isExpanded?: boolean;
}

interface UseNavDeleteKeyboardProps {
  selectedIndex: number;
  setSelectedIndex: (index: number | ((prev: number) => number)) => void;
  markedForDeletion: Set<string>;
  setMarkedForDeletion: (marked: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  expandedItems: Set<string>;
  setExpandedItems: (expanded: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  flatItems: FlatNavigationItem[];
  markedItems: NavigationItem[];
  showDeleteConfirm: boolean;
  inSelectMode: boolean;
  setInSelectMode: (value: boolean) => void;
  onProceedToConfirm: () => void;
}

export function useNavDeleteKeyboard({
  selectedIndex,
  setSelectedIndex,
  markedForDeletion: _markedForDeletion,
  setMarkedForDeletion,
  expandedItems,
  setExpandedItems,
  flatItems,
  markedItems,
  showDeleteConfirm,
  inSelectMode,
  setInSelectMode,
  onProceedToConfirm,
}: UseNavDeleteKeyboardProps) {
  useInput((input, key) => {
    // Block input when dialogs are open
    if (showDeleteConfirm) {
      return;
    }

    // Enter mode (down arrow when NOT in mode)
    if (!inSelectMode && key.downArrow) {
      setInSelectMode(true);
      return;
    }

    // Exit mode (up arrow at index 0 when IN mode)
    if (inSelectMode && key.upArrow && selectedIndex === 0) {
      setInSelectMode(false);
      return;
    }

    // In-mode navigation
    if (inSelectMode) {
      // Up/Down navigation
      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setSelectedIndex((prev) => Math.min(flatItems.length - 1, prev + 1));
        return;
      }

      // Right arrow: Expand
      if (key.rightArrow) {
        const currentItem = flatItems[selectedIndex];
        if (currentItem?.children && currentItem.children.length > 0) {
          if (!expandedItems.has(currentItem.id)) {
            setExpandedItems((prev) => new Set([...prev, currentItem.id]));
          }
        }
        return;
      }

      // Left arrow: Collapse
      if (key.leftArrow) {
        const currentItem = flatItems[selectedIndex];
        if (currentItem?.children && currentItem.children.length > 0) {
          if (expandedItems.has(currentItem.id)) {
            setExpandedItems((prev) => {
              const newSet = new Set(prev);
              newSet.delete(currentItem.id);
              return newSet;
            });
          }
        }
        return;
      }

      // Space: Toggle marking
      if (input === " ") {
        const currentItem = flatItems[selectedIndex];
        if (currentItem) {
          setMarkedForDeletion((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(currentItem.id)) {
              newSet.delete(currentItem.id);
            } else {
              newSet.add(currentItem.id);
            }
            return newSet;
          });
        }
        return;
      }

      // c: Clear all marks
      if (input === "c") {
        setMarkedForDeletion(new Set());
        return;
      }

      // Enter: Proceed to delete (if items are marked)
      if (key.return && markedItems.length > 0) {
        onProceedToConfirm();
        return;
      }
    }
  });
}
