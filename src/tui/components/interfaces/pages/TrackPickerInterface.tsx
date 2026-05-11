import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { dirname, isAbsolute, join, relative } from "path";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { useSearch } from "@/tui/hooks/useSearch";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import { SearchBar } from "@comps/ui/SearchBar";
import { FileBrowserModal } from "@comps/modals/FileBrowserModal/FileBrowserModal";
import { COMMON_HELP_PATTERNS, formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import { configManager } from "@/config/configManager";
import { getAllPages, getPageContent } from "@/api/pages";
import { stageFiles } from "@/utils/git";
import {
  addEntry,
  findEntry,
  findEntryByLocalFile,
  readManifest,
  replaceEntryLocalFile,
  updateEntrySync,
  writeManifest,
} from "@/commands/pages/tracking";
import type { Page } from "@/types";
import type { TrackingEntry, TrackingManifest } from "@/types/tracking";

interface TrackPickerInterfaceProps {
  onEsc?: () => void;
  onDone?: () => void;
}

type Phase = "pick-live" | "resolve-local" | "browse-file";

interface ResolveOption {
  kind: "default" | "create" | "browse";
  label: string;
  localFile?: string;
}

export function TrackPickerInterface({ onEsc, onDone }: TrackPickerInterfaceProps) {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<Phase>("pick-live");
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [livePickerIndex, setLivePickerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [inSearchMode, setInSearchMode] = useState(false);
  const [pickedPage, setPickedPage] = useState<Page | null>(null);
  const [resolveOptions, setResolveOptions] = useState<ResolveOption[]>([]);
  const [resolveIndex, setResolveIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [manifest, setManifest] = useState<TrackingManifest | null>(null);

  useFooterStatus(statusMsg);
  useHeaderData({
    title: "Track New Page",
    metadata:
      phase === "pick-live"
        ? "Pick a live wiki page"
        : phase === "resolve-local"
          ? `Pick local file for ${pickedPage?.path ?? ""}`
          : "Browse files",
  });

  const filteredPages = useSearch(pages, searchQuery, ["title", "path"]);

  useEffect(() => {
    void loadInitial();
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    await configManager.initialize();
    const git = configManager.getGitConfig();
    if (!git) {
      setStatusMsg("Git not configured. Run setup wizard first.");
      setLoading(false);
      return;
    }
    setRepoPath(git.repoPath);
    try {
      const [livePages, m] = await Promise.all([
        getAllPages(),
        readManifest(git.repoPath),
      ]);
      setPages(livePages);
      setManifest(
        m ?? { version: 1, instance: "", repoRoot: ".", entries: [] }
      );
      setStatusMsg(`${livePages.length} live pages loaded.`);
    } catch (e) {
      setStatusMsg(`Load failed: ${e instanceof Error ? e.message : "?"}`);
    } finally {
      setLoading(false);
    }
  };

  const advanceToResolve = (page: Page) => {
    setPickedPage(page);
    const stripped = page.path.replace(/^\/+/, "");
    const defaultLocal = `${stripped}/page.html`;
    const options: ResolveOption[] = [
      {
        kind: "default",
        label: `Use default: ${defaultLocal}`,
        localFile: defaultLocal,
      },
      {
        kind: "create",
        label: `Create + seed file at ${defaultLocal}`,
        localFile: defaultLocal,
      },
      { kind: "browse", label: "Browse for existing file…" },
    ];
    setResolveOptions(options);
    setResolveIndex(0);
    setPhase("resolve-local");
    setStatusMsg("");
  };

  const confirmResolution = async (option: ResolveOption) => {
    if (!pickedPage || !manifest) return;
    if (option.kind === "browse") {
      setPhase("browse-file");
      return;
    }
    await applyTracking(option.localFile!, option.kind === "create");
  };

  const applyTracking = async (localFile: string, seedIfMissing: boolean) => {
    if (!pickedPage || !manifest) return;
    setStatusMsg("Fetching live page…");
    try {
      const live = await getPageContent(pickedPage.path, pickedPage.locale);
      if (!live || !live.hash || !live.updatedAt) {
        setStatusMsg("Live page missing content/hash.");
        return;
      }

      const relLocal = toRelative(repoPath, localFile);
      const absLocal = isAbsolute(localFile)
        ? localFile
        : join(repoPath, localFile);

      const existingByPath = findEntry(
        manifest,
        pickedPage.path,
        pickedPage.locale
      );
      if (existingByPath) {
        await retrackExisting(existingByPath, relLocal, live.hash, live.updatedAt);
        return;
      }

      const existingByFile = findEntryByLocalFile(manifest, relLocal);
      if (existingByFile) {
        setStatusMsg(
          `Local file already bound to ${existingByFile.wikiPath}.`
        );
        return;
      }

      if (!existsSync(absLocal)) {
        if (!seedIfMissing) {
          setStatusMsg(`File ${relLocal} does not exist. Use the seed option.`);
          return;
        }
        await mkdir(dirname(absLocal), { recursive: true });
        await writeFile(absLocal, live.content, "utf8");
        await stageFiles(repoPath, [relLocal]);
      }

      const now = new Date().toISOString();
      const entry: TrackingEntry = {
        wikiPath: pickedPage.path,
        locale: pickedPage.locale,
        localFile: relLocal,
        lastSyncedHash: live.hash,
        lastSyncedAt: now,
        lastSyncedUpdatedAt: live.updatedAt,
      };
      const next = addEntry(manifest, entry);
      await writeManifest(repoPath, next);
      setManifest(next);
      setStatusMsg(`Tracked ${pickedPage.path} → ${relLocal}`);
      onDone?.();
    } catch (e) {
      setStatusMsg(`Track failed: ${e instanceof Error ? e.message : "?"}`);
    }
  };

  const retrackExisting = async (
    existing: TrackingEntry,
    newRelLocal: string,
    hash: string,
    updatedAt: string
  ) => {
    if (!manifest) return;
    setStatusMsg(`Already tracked — rebinding to ${newRelLocal}.`);
    const rebound = replaceEntryLocalFile(
      manifest,
      existing.wikiPath,
      existing.locale,
      newRelLocal
    );
    const synced = updateEntrySync(rebound, existing.wikiPath, existing.locale, {
      hash,
      updatedAt,
    });
    await writeManifest(repoPath, synced);
    setManifest(synced);
    setStatusMsg(`Retracked ${existing.wikiPath} → ${newRelLocal}`);
    onDone?.();
  };

  useEscape("track-picker", () => {
    if (inSearchMode) {
      setInSearchMode(false);
      return;
    }
    if (searchQuery) {
      setSearchQuery("");
      return;
    }
    if (phase === "browse-file") {
      setPhase("resolve-local");
      return;
    }
    if (phase === "resolve-local") {
      setPhase("pick-live");
      return;
    }
    onEsc?.();
  });

  useFooterHelp(
    phase === "pick-live"
      ? inSearchMode
        ? "Type to search • Esc exit search"
        : formatHelpText(
            HELP_TEXT.NAVIGATE,
            "s=search",
            HELP_TEXT.ENTER_SELECT,
            HELP_TEXT.BACK
          )
      : phase === "resolve-local"
        ? COMMON_HELP_PATTERNS.MENU
        : formatHelpText(HELP_TEXT.NAVIGATE, HELP_TEXT.ENTER_SELECT, HELP_TEXT.BACK)
  );

  useInput((input, key) => {
    if (phase === "browse-file") return;
    if (inSearchMode) {
      if (key.return || key.downArrow) {
        setInSearchMode(false);
      }
      return;
    }
    if (phase === "pick-live") {
      if (input === "s") {
        setInSearchMode(true);
        return;
      }
      if (key.upArrow) setLivePickerIndex((i) => Math.max(0, i - 1));
      else if (key.downArrow)
        setLivePickerIndex((i) =>
          Math.min(Math.max(0, filteredPages.length - 1), i + 1)
        );
      else if (key.return) {
        const page = filteredPages[livePickerIndex];
        if (page) advanceToResolve(page);
      }
    } else if (phase === "resolve-local") {
      if (key.upArrow) setResolveIndex((i) => Math.max(0, i - 1));
      else if (key.downArrow)
        setResolveIndex((i) =>
          Math.min(resolveOptions.length - 1, i + 1)
        );
      else if (key.return) {
        const opt = resolveOptions[resolveIndex];
        if (opt) void confirmResolution(opt);
      }
    }
  });

  if (phase === "browse-file") {
    return (
      <FileBrowserModal
        title="Pick local file"
        initialPath={repoPath || "."}
        mode="file"
        allowedExtensions={[".html", ".htm", ".md"]}
        onSelect={(selected) => {
          setPhase("resolve-local");
          void applyTracking(selected, false);
        }}
        onCancel={() => setPhase("resolve-local")}
      />
    );
  }

  if (loading) {
    return (
      <Box>
        <Text color={theme.colors.muted}>Loading live pages…</Text>
      </Box>
    );
  }

  if (phase === "pick-live") {
    return (
      <Box flexDirection="column" flexGrow={1}>
        <SearchBar
          query={searchQuery}
          isActive={inSearchMode}
          placeholder="Press 's' to search live pages"
          resultCount={searchQuery ? filteredPages.length : undefined}
          totalCount={pages.length}
        />
        {inSearchMode && (
          <Box paddingX={1}>
            <SearchInputControl
              query={searchQuery}
              onChange={setSearchQuery}
            />
          </Box>
        )}
        <VirtualizedList
          items={filteredPages}
          selectedIndex={livePickerIndex}
          getItemKey={(p) => p.id}
          itemHeight={1}
          renderItem={(p, _i, isHighlighted) => (
            <Box height={1} flexShrink={0}>
              <Text
                color={
                  isHighlighted ? theme.colors.background : theme.colors.text
                }
                backgroundColor={
                  isHighlighted ? theme.colors.primary : undefined
                }
                wrap="truncate"
              >
                {isHighlighted ? " ► " : "   "}
                {p.path} — {p.title} [{p.locale}]
              </Text>
            </Box>
          )}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1} padding={1}>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Pick local file for {pickedPage?.path}
        </Text>
      </Box>
      {resolveOptions.map((opt, i) => (
        <Box key={`${opt.kind}-${i}`}>
          <Text
            color={i === resolveIndex ? theme.colors.accent : theme.colors.text}
            bold={i === resolveIndex}
          >
            {i === resolveIndex ? "▶ " : "  "}
            {opt.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

function SearchInputControl({
  query,
  onChange,
}: {
  query: string;
  onChange: (q: string) => void;
}) {
  useInput((input, key) => {
    if (key.backspace || key.delete) {
      onChange(query.slice(0, -1));
      return;
    }
    if (key.escape || key.return || key.downArrow || key.upArrow) return;
    if (input && input.length === 1) onChange(query + input);
  });
  return null;
}

function toRelative(repoPath: string, file: string): string {
  const abs = isAbsolute(file) ? file : join(repoPath, file);
  return relative(repoPath, abs).split("\\").join("/");
}
