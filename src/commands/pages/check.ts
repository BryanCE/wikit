import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { isAbsolute, join } from "path";
import { configManager } from "@/config/configManager";
import { getPageContent } from "@/api/pages";
import { readManifest } from "@/commands/pages/tracking";
import {
  hasDifferences,
  renderUnifiedDiff,
  summarizeDiff,
} from "@/utils/htmlDiff";
import { InstanceContext } from "@/contexts/InstanceContext";
import type { SyncStatus, TrackingEntry } from "@/types/tracking";

interface CheckOptions {
  details?: boolean;
  json?: boolean;
  instance?: string;
}

interface LiveResult {
  content: string;
  hash: string;
  updatedAt: string;
}

export interface CheckResult {
  entry: TrackingEntry;
  status: SyncStatus;
  live: LiveResult | null;
  localContent: string | null;
  added?: number;
  removed?: number;
}

const CONCURRENCY = 5;

export async function checkForCli(options: CheckOptions): Promise<void> {
  if (options.instance) InstanceContext.setInstance(options.instance);
  await configManager.initialize();

  const git = configManager.getGitConfig();
  if (!git) {
    console.error("No git config — run `wikit tui` to launch the wizard.");
    process.exit(1);
  }

  const manifest = await readManifest(git.repoPath);
  if (!manifest || manifest.entries.length === 0) {
    if (options.json) {
      console.log(JSON.stringify({ entries: [] }));
    } else {
      console.log("No pages tracked.");
    }
    process.exit(0);
  }

  const results = await runCheck(git.repoPath, manifest.entries);

  if (options.json) {
    emitJson(results);
  } else {
    printCheckSummary(results);
    if (options.details) printDriftedDiff(results);
  }

  const anyDrift = results.some((r) => r.status !== "in-sync");
  process.exit(anyDrift ? 1 : 0);
}

export async function runCheck(
  repoPath: string,
  entries: TrackingEntry[]
): Promise<CheckResult[]> {
  const out: CheckResult[] = new Array<CheckResult>(entries.length);
  let idx = 0;
  const workers = Array.from(
    { length: Math.min(CONCURRENCY, entries.length) },
    async () => {
      while (true) {
        const i = idx++;
        if (i >= entries.length) return;
        out[i] = await classifyEntry(repoPath, entries[i]!);
      }
    }
  );
  await Promise.all(workers);
  return out;
}

async function classifyEntry(
  repoPath: string,
  entry: TrackingEntry
): Promise<CheckResult> {
  const live = await fetchLiveForEntry(entry);
  const absLocal = isAbsolute(entry.localFile)
    ? entry.localFile
    : join(repoPath, entry.localFile);
  const localOk = existsSync(absLocal);

  if (!live) {
    return {
      entry,
      status: localOk ? "live-missing" : "local-missing",
      live: null,
      localContent: null,
    };
  }
  if (!localOk) {
    return { entry, status: "local-missing", live, localContent: null };
  }
  if (live.hash === entry.lastSyncedHash) {
    return { entry, status: "in-sync", live, localContent: null };
  }
  const localContent = await readFile(absLocal, "utf8");
  if (!hasDifferences(localContent, live.content)) {
    return { entry, status: "in-sync", live, localContent };
  }
  const { added, removed } = summarizeDiff(localContent, live.content);
  return { entry, status: "drifted", live, localContent, added, removed };
}

async function fetchLiveForEntry(
  entry: TrackingEntry
): Promise<LiveResult | null> {
  try {
    const live = await getPageContent(entry.wikiPath, entry.locale);
    if (!live || !live.hash || !live.updatedAt) return null;
    return {
      content: live.content,
      hash: live.hash,
      updatedAt: live.updatedAt,
    };
  } catch {
    return null;
  }
}

function printCheckSummary(results: CheckResult[]): void {
  const groups = new Map<SyncStatus, CheckResult[]>();
  for (const r of results) {
    const arr = groups.get(r.status) ?? [];
    arr.push(r);
    groups.set(r.status, arr);
  }
  const order: SyncStatus[] = [
    "drifted",
    "local-missing",
    "live-missing",
    "in-sync",
    "unchecked",
  ];
  for (const status of order) {
    const arr = groups.get(status);
    if (!arr || arr.length === 0) continue;
    console.log(`${status}: ${arr.length}`);
    for (const r of arr) {
      const extra =
        r.status === "drifted" && r.added !== undefined
          ? ` (+${r.added}/-${r.removed})`
          : "";
      console.log(`  ${r.entry.wikiPath} → ${r.entry.localFile}${extra}`);
    }
  }
}

function printDriftedDiff(results: CheckResult[]): void {
  const drifted = results.filter((r) => r.status === "drifted");
  for (const r of drifted) {
    if (!r.live || r.localContent === null) continue;
    console.log("");
    console.log(
      renderUnifiedDiff(r.localContent, r.live.content, r.entry.wikiPath)
    );
  }
}

function emitJson(results: CheckResult[]): void {
  const payload = {
    entries: results.map((r) => ({
      wikiPath: r.entry.wikiPath,
      locale: r.entry.locale,
      localFile: r.entry.localFile,
      status: r.status,
      added: r.added,
      removed: r.removed,
    })),
  };
  console.log(JSON.stringify(payload));
}
