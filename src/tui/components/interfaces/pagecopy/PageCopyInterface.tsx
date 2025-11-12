import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { ConfirmationDialog } from "@comps/modals/ConfirmationDialog";
import { getPages } from "@/commands/listPages";
import { type Page } from "@/types";
import { getPageContent, createPage } from "@/api/pages";
import { getAvailableInstances, getInstanceLabels } from "@/config/dynamicConfig";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterStatus } from "@/tui/contexts/FooterContext";
import { PageSelector } from "./PageSelector.js";
import { MarkedPagesSummary } from "./MarkedPagesSummary.js";

interface PageCopyInterfaceProps {
  onEsc?: () => void;
}

export function PageCopyInterface({
  onEsc,
}: PageCopyInterfaceProps) {
  // Setup escape handling
  useEscape("pagecopy", () => {
    onEsc?.();
  });
  const { theme } = useTheme();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [markedForCopy, setMarkedForCopy] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmMode, setConfirmMode] = useState(false);
  const [copying, setCopying] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [availableInstances, setAvailableInstances] = useState<string[]>([]);
  const [instanceLabels, setInstanceLabels] = useState<Record<string, string>>({});
  const [fromInstance, setFromInstance] = useState("");
  const [targetInstance, setTargetInstance] = useState("");
  const [selectionMode, setSelectionMode] = useState<"from" | "to" | "pages">("from");
  const [selectedInstanceIndex, setSelectedInstanceIndex] = useState(0);
  useFooterStatus(statusMsg);

  useHeaderData({
    title: "Copy Pages",
    metadata: fromInstance && targetInstance ? `${markedForCopy.size} marked • ${fromInstance} → ${targetInstance}` : "Loading..."
  });

  useEffect(() => {
    void Promise.all([
      getAvailableInstances(),
      getInstanceLabels()
    ]).then(([instances, labels]) => {
      setAvailableInstances(instances);
      setInstanceLabels(labels);
    });
  }, []);

  useEffect(() => {
    void loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);

      const pages = await getPages("", {
        recursive: true,
        limit: 500,
      });

      setPages(pages);
      setSelectedIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const executeCopies = async () => {
    if (markedForCopy.size === 0) return;

    setCopying(true);
    const pagesToCopy = pages.filter((p) => markedForCopy.has(p.id));
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    setStatusMsg(
      `Copying ${pagesToCopy.length} pages to ${instanceLabels[targetInstance]}...`
    );

    for (const page of pagesToCopy) {
      try {
        const fullPageData = await getPageContent(page.path);
        if (!fullPageData) {
          errors.push(`Failed to get content for ${page.path}`);
          errorCount++;
          continue;
        }

        const result = await createPage({
          path: fullPageData.path,
          title: fullPageData.title,
          content: fullPageData.content,
          description: fullPageData.description,
          editor: fullPageData.editor,
          locale: fullPageData.locale,
          isPublished: fullPageData.isPublished,
          isPrivate: fullPageData.isPrivate,
          tags: fullPageData.tags?.map((tag) => tag.title),
        });

        if (result.responseResult.succeeded) {
          successCount++;
        } else {
          errors.push(`${page.path}: ${result.responseResult.message}`);
          errorCount++;
        }
      } catch (error) {
        errors.push(
          `${page.path}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        errorCount++;
      }
    }

    setCopying(false);
    setConfirmMode(false);
    setMarkedForCopy(new Set());

    if (errorCount > 0) {
      setStatusMsg(
        `Copied ${successCount} pages, ${errorCount} failed: ${errors
          .slice(0, 2)
          .join("; ")}${errors.length > 2 ? "..." : ""}`
      );
    } else {
      setStatusMsg(
        `Successfully copied ${successCount} pages to ${instanceLabels[targetInstance]}`
      );
    }
  };

  useInput((input, key) => {
    if (loading || copying || confirmMode) return;

    if (selectionMode === "from") {
      if (key.upArrow) {
        setSelectedInstanceIndex((prev) => (prev > 0 ? prev - 1 : availableInstances.length - 1));
      } else if (key.downArrow) {
        setSelectedInstanceIndex((prev) => (prev < availableInstances.length - 1 ? prev + 1 : 0));
      } else if (key.return) {
        setFromInstance(availableInstances[selectedInstanceIndex] ?? "");
        setSelectionMode("to");
        setSelectedInstanceIndex(0);
      }
    } else if (selectionMode === "to") {
      if (key.upArrow) {
        setSelectedInstanceIndex((prev) => (prev > 0 ? prev - 1 : availableInstances.length - 1));
      } else if (key.downArrow) {
        setSelectedInstanceIndex((prev) => (prev < availableInstances.length - 1 ? prev + 1 : 0));
      } else if (key.return) {
        setTargetInstance(availableInstances[selectedInstanceIndex] ?? "");
        setSelectionMode("pages");
        void loadPages();
      }
    } else if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(pages.length - 1, prev + 1));
    } else if (input === " ") {
      const currentPage = pages[selectedIndex];
      if (currentPage) {
        setMarkedForCopy((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(currentPage.id)) {
            newSet.delete(currentPage.id);
          } else {
            newSet.add(currentPage.id);
          }
          return newSet;
        });
      }
    } else if (key.return && markedForCopy.size > 0) {
      setConfirmMode(true);
    }
  });

  if (availableInstances.length < 2) {
    return (
      <Box flexDirection="column">
        <Text color={theme.colors.error} bold>
          Error: Not Enough Instances
        </Text>
        <Text color={theme.colors.text}>
          Copy Pages requires at least 2 configured instances.
        </Text>
        <Text color={theme.colors.muted}>
          Press Esc to return
        </Text>
      </Box>
    );
  }

  if (selectionMode === "from" || selectionMode === "to") {
    return (
      <Box flexDirection="column">
        <Text color={theme.colors.primary} bold>
          Select {selectionMode === "from" ? "Source" : "Target"} Instance
        </Text>
        <Box marginY={1} flexDirection="column">
          {availableInstances.map((inst, index) => (
            <Text
              key={inst}
              color={index === selectedInstanceIndex ? theme.colors.background : theme.colors.text}
              backgroundColor={index === selectedInstanceIndex ? theme.colors.primary : undefined}
            >
              {index === selectedInstanceIndex ? " ► " : "   "}
              {instanceLabels[inst] ?? inst}
            </Text>
          ))}
        </Box>
        <Text color={theme.colors.muted}>↑↓=navigate • Enter=select</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box>
        <Text color={theme.colors.warning}>Loading pages...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color={theme.colors.error}>Error: {error}</Text>
      </Box>
    );
  }

  if (confirmMode) {
    const pagesToCopy = pages.filter((p) => markedForCopy.has(p.id));
    return (
      <ConfirmationDialog
        title="CONFIRM COPY"
        message={`Copy ${pagesToCopy.length} page(s) from ${instanceLabels[fromInstance]} to ${instanceLabels[targetInstance]}?`}
        confirmText="Yes, copy them"
        cancelText="No, cancel"
        items={pagesToCopy
          .slice(0, 5)
          .map((page) => `${page.path} - ${page.title}`)}
        onConfirm={() => void executeCopies()}
        onCancel={() => setConfirmMode(false)}
      />
    );
  }

  const markedPages = pages.filter((p) => markedForCopy.has(p.id));

  return (
    <Box>
      <PageSelector
        pages={pages}
        selectedIndex={selectedIndex}
        markedForCopy={markedForCopy}
        targetInstance={targetInstance}
      />

      <MarkedPagesSummary
        markedPages={markedPages}
        markedForCopySize={markedForCopy.size}
        targetInstance={targetInstance}
      />
    </Box>
  );
}
