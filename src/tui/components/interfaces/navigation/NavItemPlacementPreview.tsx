import React from "react";
import { Box, Text } from "ink";
import type { NavigationItem } from "@/types";
import type { FormData } from "./navFormTypes";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useIcon } from "@/tui/contexts/IconContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";

interface NavItemPlacementPreviewProps {
  existingItems: NavigationItem[];
  formData: FormData;
  placementPreviewIndex: number;
}

type PreviewItem = { item: NavigationItem | null; isNew: boolean };

const isDivider = (item: NavigationItem): boolean => {
  return item.kind === "divider";
};

export function NavItemPlacementPreview({
  existingItems,
  formData,
  placementPreviewIndex,
}: NavItemPlacementPreviewProps) {
  const { theme } = useTheme();
  const { formatIcon } = useIcon();

  useFooterHelp("↑↓ move position • Enter confirm placement • Esc cancel");
  useHeaderData({ title: "Choose Placement", metadata: "Position new item" });

  const previewItems: PreviewItem[] = [];
  for (let i = 0; i <= existingItems.length; i++) {
    if (i === placementPreviewIndex) {
      previewItems.push({ item: null, isNew: true });
    }
    if (i < existingItems.length) {
      previewItems.push({ item: existingItems[i]!, isNew: false });
    }
  }

  return (
    <Box flexDirection="column" height="100%">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Placement Preview - Use ↑↓ to position new item
        </Text>
      </Box>

      <Box flexGrow={1}>
        <VirtualizedList
          items={previewItems}
          selectedIndex={placementPreviewIndex}
          itemHeight={1}
          getItemKey={(previewItem, index) =>
            previewItem.isNew ? "new" : previewItem.item?.id ?? `item-${index}`
          }
          renderItem={(previewItem, index, isHighlighted) => {
            const { item, isNew } = previewItem;

            if (item && isDivider(item)) {
              return (
                <Box
                  backgroundColor={isHighlighted ? theme.colors.primary : undefined}
                  paddingX={1}
                >
                  <Text color={isHighlighted ? theme.colors.background : theme.colors.muted}>
                    ─────────────────────────────────
                  </Text>
                </Box>
              );
            }

            const label = isNew
              ? formData.label || "(new item)"
              : item?.label ?? item?.id ?? "";
            const icon = isNew
              ? formatIcon(formData.icon)
              : formatIcon(item?.icon);
            const kindBadge = isNew
              ? ""
              : item?.kind === "header"
              ? " [HEADER]"
              : "";

            return (
              <Box
                backgroundColor={
                  isNew
                    ? theme.colors.success
                    : isHighlighted
                    ? theme.colors.primary
                    : undefined
                }
                paddingX={1}
              >
                <Text
                  color={
                    isNew
                      ? theme.colors.background
                      : isHighlighted
                      ? theme.colors.background
                      : theme.colors.text
                  }
                  bold={isNew || item?.kind === "header"}
                >
                  {isNew ? "➤ " : "  "}
                  {icon}
                  {label}
                  {kindBadge}
                  {isNew ? " [NEW]" : ""}
                </Text>
              </Box>
            );
          }}
        />
      </Box>

      <Box marginTop={1}>
        <Text color={theme.colors.muted}>
          ↑↓ move • Enter confirm • Esc cancel
        </Text>
      </Box>
    </Box>
  );
}
