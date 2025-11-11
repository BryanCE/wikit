import React, { useMemo } from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { Page } from "@/types";

interface DetailedPage extends Page {
  content?: string;
  description?: string;
  tags?: { id: string; title: string }[];
  createdAt?: string;
  updatedAt?: string;
  editor?: string;
  isPrivate?: boolean;
  hash?: string;
  contentType?: string;
}

interface InfoTabProps {
  detailedPage: DetailedPage;
  selectedIndex: number;
}

interface InfoItem {
  label: string;
  value: string;
  color?: string;
}

export function InfoTab({ detailedPage, selectedIndex }: InfoTabProps) {
  const { theme } = useTheme();

  const items = useMemo<InfoItem[]>(() => {
    const result: InfoItem[] = [
      { label: "Title", value: detailedPage.title || "NO TITLE FOUND" },
      { label: "Path", value: detailedPage.path },
      { label: "ID", value: detailedPage.id.toString() },
      { label: "Locale", value: detailedPage.locale },
      {
        label: "Status",
        value: detailedPage.isPublished ? "[✓] Published" : "[X] Draft",
        color: detailedPage.isPublished ? "green" : "red",
      },
      {
        label: "Visibility",
        value: detailedPage.isPrivate ? "[PRIVATE]" : "[PUBLIC]",
        color: detailedPage.isPrivate ? "yellow" : "green",
      },
      { label: "Description", value: detailedPage.description ?? "No description" },
    ];

    if (detailedPage.tags && detailedPage.tags.length > 0) {
      result.push({
        label: "Tags",
        value: detailedPage.tags.map((tag) => tag.title).join(", "),
      });
    }

    return result;
  }, [detailedPage]);

  return (
    <Box flexDirection="column" paddingX={1} flexGrow={1}>
      <Box flexGrow={1}>
        <VirtualizedList
          items={items}
          selectedIndex={selectedIndex}
          itemHeight={1}
          getItemKey={(item, index) => index.toString()}
          renderItem={(item) => (
            <Box height={1} flexShrink={0}>
              <Text color={theme.colors.primary} bold>
                {item.label}:{" "}
              </Text>
              <Text color={item.color}>{item.value}</Text>
            </Box>
          )}
        />
      </Box>
    </Box>
  );
}
