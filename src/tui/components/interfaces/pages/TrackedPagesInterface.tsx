import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { isAbsolute, join, relative } from "path";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import { configManager } from "@/config/configManager";
import { readManifest, writeManifest, getManifestPath } from "@/commands/pages/tracking";
import { runCheck, type CheckResult } from "@/commands/pages/check";
import { pullMany } from "@/commands/pages/pull";
import { runCommit } from "@/commands/pages/commit";
import { runPush } from "@/commands/pages/push";
import { stageFiles } from "@/utils/git";
import type { SyncStatus, TrackingEntry, TrackingManifest } from "@/types/tracking";
import { TrackedPagesList } from "./TrackedPagesList";
import { DiffViewer } from "./DiffViewer";

interface TrackedPagesInterfaceProps {
  onEsc?: () => void;
  onTrackNew?: () => void;
}

type View = "list" | "diff" | "actions";

type ActionId = "diff" | "pull" | "commit" | "push" | "recheck";

interface ActionItem {
  id: ActionId;
  label: string;
}

const ROW_ACTIONS: ActionItem[] = [
  { id: "diff", label: "View diff" },
  { id: "pull", label: "Pull (current or selected)" },
  { id: "commit", label: "Commit staged" },
  { id: "push", label: "Push to remote" },
  { id: "recheck", label: "Recheck drift" },
];

function entryKey(entry: TrackingEntry): string {
  return `${entry.wikiPath}::${entry.locale}`;
}

export function TrackedPagesInterface({ onEsc, onTrackNew }: TrackedPagesInterfaceProps) {
  const { theme } = useTheme();
  const [manifest, setManifest] = useState<TrackingManifest | null>(null);
  const [repoPath, setRepoPath] = useState<string>("");
  const [statuses, setStatuses] = useState<Map<string, SyncStatus>>(new Map());
  const [checkResults, setCheckResults] = useState<Map<string, CheckResult>>(new Map());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>("list");
  const [actionIndex, setActionIndex] = useState(0);
  const [diffEntry, setDiffEntry] = useState<TrackingEntry | null>(null);
  const [diffLocal, setDiffLocal] = useState<string>("");
  const [diffLive, setDiffLive] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useFooterStatus(statusMsg);
  useHeaderData({
    title: "Tracked Pages",
    metadata: manifest ? `${manifest.entries.length} entries` : "loading…",
  });

  useEffect(() => {
    void loadManifest();
  }, []);

  const loadManifest = async () => {
    setLoading(true);
    await configManager.initialize();
    const git = configManager.getGitConfig();
    if (!git) {
      setStatusMsg("Git not configured. Run setup wizard first.");
      setLoading(false);
      return;
    }
    setRepoPath(git.repoPath);
    const m = await readManifest(git.repoPath);
    if (!m) {
      setManifest({ version: 1, instance: "", repoRoot: ".", entries: [] });
      setLoading(false);
      return;
    }
    setManifest(m);
    setLoading(false);
    void runDriftCheck(git.repoPath, m.entries);
  };

  const runDriftCheck = async (repo: string, entries: TrackingEntry[]) => {
    if (entries.length === 0) return;
    setStatusMsg(`Checking ${entries.length} entries…`);
    try {
      const results = await runCheck(repo, entries);
      const nextStatuses = new Map<string, SyncStatus>();
      const nextResults = new Map<string, CheckResult>();
      for (const r of results) {
        nextStatuses.set(entryKey(r.entry), r.status);
        nextResults.set(entryKey(r.entry), r);
      }
      setStatuses(nextStatuses);
      setCheckResults(nextResults);
      const drifted = results.filter((r) => r.status === "drifted").length;
      setStatusMsg(`${drifted} drifted, ${results.length - drifted} clean.`);
    } catch (e) {
      setStatusMsg(`Check failed: ${e instanceof Error ? e.message : "?"}`);
    }
  };

  const totalRows = (manifest?.entries.length ?? 0) + 1;

  const focusedEntry: TrackingEntry | null = (() => {
    if (!manifest) return null;
    if (selectedIndex === 0) return null;
    return manifest.entries[selectedIndex - 1] ?? null;
  })();

  const openDiffForFocused = async () => {
    if (!focusedEntry) return;
    const result = checkResults.get(entryKey(focusedEntry));
    if (!result || result.status !== "drifted" || !result.live) {
      setStatusMsg("No diff available — entry is not drifted.");
      return;
    }
    const absLocal = isAbsolute(focusedEntry.localFile)
      ? focusedEntry.localFile
      : join(repoPath, focusedEntry.localFile);
    const localContent = existsSync(absLocal)
      ? await readFile(absLocal, "utf8")
      : "";
    setDiffEntry(focusedEntry);
    setDiffLocal(localContent);
    setDiffLive(result.live.content);
    setView("diff");
  };

  const toggleSelection = () => {
    if (!focusedEntry) return;
    const key = entryKey(focusedEntry);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const pullCurrentOrSelected = async () => {
    if (!manifest || !focusedEntry) return;
    const targets: TrackingEntry[] =
      selected.size > 0
        ? manifest.entries.filter((e) => selected.has(entryKey(e)))
        : [focusedEntry];
    setStatusMsg(`Pulling ${targets.length}…`);
    try {
      const { results, finalManifest } = await pullMany(
        repoPath,
        manifest,
        targets,
        { dryRun: false, force: false }
      );
      const changed = results
        .filter((r) => r.outcome === "updated")
        .map((r) => r.entry.localFile);
      if (changed.length > 0) {
        await writeManifest(repoPath, finalManifest);
        const manifestRel = toRelative(repoPath, getManifestPath(repoPath));
        await stageFiles(repoPath, [...changed, manifestRel]);
        setManifest(finalManifest);
      }
      const refused = results.filter((r) => r.outcome === "refused-wip").length;
      setStatusMsg(
        `Pulled ${changed.length}, refused ${refused}.${refused > 0 ? " Local WIP — commit or stash first." : ""}`
      );
      setSelected(new Set());
      void runDriftCheck(repoPath, finalManifest.entries);
    } catch (e) {
      setStatusMsg(`Pull failed: ${e instanceof Error ? e.message : "?"}`);
    }
  };

  const commitStaged = async () => {
    setStatusMsg("Committing…");
    const outcome = await runCommit(repoPath, {});
    if (outcome.kind === "nothing-staged") {
      setStatusMsg("Nothing staged.");
      return;
    }
    if (outcome.kind === "error") {
      setStatusMsg(`Commit failed: ${outcome.error}`);
      return;
    }
    setStatusMsg(`Committed ${outcome.sha.slice(0, 12)}.`);
  };

  const pushRemote = async () => {
    setStatusMsg("Pushing…");
    const outcome = await runPush();
    if (outcome.kind === "manual") {
      setStatusMsg(`Manual mode: ${outcome.command}`);
      return;
    }
    if (outcome.kind === "missing-pat") {
      setStatusMsg("PAT not set — reconfigure via wizard.");
      return;
    }
    if (outcome.kind === "error") {
      setStatusMsg(`Push failed: ${outcome.error}`);
      return;
    }
    setStatusMsg(`Pushed ${outcome.remote}/${outcome.branch}.`);
  };

  const runAction = (id: ActionId) => {
    setView("list");
    switch (id) {
      case "diff":
        void openDiffForFocused();
        return;
      case "pull":
        void pullCurrentOrSelected();
        return;
      case "commit":
        void commitStaged();
        return;
      case "push":
        void pushRemote();
        return;
      case "recheck":
        if (manifest) void runDriftCheck(repoPath, manifest.entries);
        return;
    }
  };

  useEscape("tracked-pages", () => {
    if (view === "diff" || view === "actions") {
      setView("list");
      return;
    }
    onEsc?.();
  });

  useFooterHelp(
    view === "diff"
      ? formatHelpText(HELP_TEXT.NAVIGATE, "PgUp/PgDn=scroll", HELP_TEXT.BACK)
      : view === "actions"
        ? formatHelpText(HELP_TEXT.NAVIGATE, HELP_TEXT.ENTER_SELECT, HELP_TEXT.BACK)
        : formatHelpText(
            HELP_TEXT.NAVIGATE,
            HELP_TEXT.TOGGLE,
            HELP_TEXT.ENTER_SELECT,
            HELP_TEXT.BACK
          )
  );

  useInput((input, key) => {
    if (view === "diff") return;

    if (view === "actions") {
      if (key.upArrow) {
        setActionIndex((i) => Math.max(0, i - 1));
      } else if (key.downArrow) {
        setActionIndex((i) => Math.min(ROW_ACTIONS.length - 1, i + 1));
      } else if (key.return) {
        const action = ROW_ACTIONS[actionIndex];
        if (action) runAction(action.id);
      }
      return;
    }

    if (key.upArrow) setSelectedIndex((i) => Math.max(0, i - 1));
    else if (key.downArrow)
      setSelectedIndex((i) => Math.min(totalRows - 1, i + 1));
    else if (input === " ") toggleSelection();
    else if (key.return) {
      if (selectedIndex === 0) {
        onTrackNew?.();
        return;
      }
      setActionIndex(0);
      setView("actions");
    }
  });

  if (loading) {
    return (
      <Box>
        <Text color={theme.colors.muted}>Loading tracked pages…</Text>
      </Box>
    );
  }

  if (view === "diff" && diffEntry) {
    return (
      <DiffViewer
        fileLabel={diffEntry.wikiPath}
        localContent={diffLocal}
        liveContent={diffLive}
        onBack={() => setView("list")}
      />
    );
  }

  if (view === "actions") {
    const targetLabel = focusedEntry?.wikiPath ?? "selection";
    return (
      <Box flexDirection="column" paddingX={1}>
        <Box marginBottom={1}>
          <Text color={theme.colors.muted}>Actions for </Text>
          <Text color={theme.colors.primary}>{targetLabel}</Text>
        </Box>
        {ROW_ACTIONS.map((action, i) => {
          const focused = i === actionIndex;
          return (
            <Box key={action.id}>
              <Text color={focused ? theme.colors.accent : theme.colors.text}>
                {focused ? "› " : "  "}
                {action.label}
              </Text>
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <TrackedPagesList
      entries={manifest?.entries ?? []}
      statuses={statuses}
      selectedIndex={selectedIndex}
      selected={selected}
      showTrackNewRow={true}
    />
  );
}

function toRelative(repoPath: string, file: string): string {
  const abs = isAbsolute(file) ? file : join(repoPath, file);
  return relative(repoPath, abs).split("\\").join("/");
}
