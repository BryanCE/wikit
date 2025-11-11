import React from "react";
import { Box } from "ink";
import { ContentScroller } from "@comps/ui/ContentScroller";
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

interface ContentTabProps {
  detailedPage: DetailedPage;
  contentScrollPosition: number;
}

export function ContentTab({ detailedPage, contentScrollPosition }: ContentTabProps) {
  return (
    <Box
      flexDirection="column"
      paddingX={1}
      flexGrow={1}
    >
      <Box flexGrow={1} overflow="hidden">
        <ContentScroller
          content={detailedPage.content ?? ""}
          scrollPosition={contentScrollPosition}
        />
      </Box>
    </Box>
  );
}