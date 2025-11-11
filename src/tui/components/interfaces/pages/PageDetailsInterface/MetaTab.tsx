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

interface MetaTabProps {
  detailedPage: DetailedPage;
  selectedIndex: number;
}

export function MetaTab({ detailedPage, selectedIndex }: MetaTabProps) {
  const { theme } = useTheme();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  const items = useMemo(() => {
    return [
      { type: "header", value: "Page Metadata" },
      { type: "field", value: `ID: ${detailedPage.id}` },
      { type: "field", value: `Path: ${detailedPage.path}` },
      { type: "field", value: `Locale: ${detailedPage.locale}` },
      { type: "field", value: `Title: ${detailedPage.title}` },
      { type: "field", value: `Description: ${detailedPage.description ?? "N/A"}` },
      { type: "field", value: `Published: ${detailedPage.isPublished ? "Yes" : "No"}` },
      { type: "field", value: `Private: ${detailedPage.isPrivate ? "Yes" : "No"}` },
      { type: "field", value: `Editor: ${detailedPage.editor ?? "Unknown"}` },
      { type: "field", value: `Content Type: ${detailedPage.contentType ?? "text/plain"}` },
      { type: "field", value: `Hash: ${detailedPage.hash ?? "N/A"}` },
      { type: "field", value: `Created: ${formatDate(detailedPage.createdAt)}` },
      { type: "field", value: `Updated: ${formatDate(detailedPage.updatedAt)}` },
      { type: "field", value: `Tags: ${detailedPage.tags?.map((tag) => tag.title).join(", ") ?? "None"}` },
      { type: "field", value: `Content Length: ${detailedPage.content?.length ?? 0} characters` },
    ];
  }, [detailedPage]);

  return (
    <Box flexDirection="column" paddingX={1} flexGrow={1}>
      <Box flexGrow={1}>
        <VirtualizedList
          items={items}
          selectedIndex={selectedIndex}
          itemHeight={1}
          getItemKey={(_, index) => index.toString()}
          renderItem={(item) => (
            <Box height={1} flexShrink={0}>
              <Text
                color={item.type === "header" ? theme.colors.primary : undefined}
                bold={item.type === "header"}
              >
                {item.value}
              </Text>
            </Box>
          )}
        />
      </Box>
    </Box>
  );
}
