import { existsSync } from "fs";
import { isAbsolute, join } from "path";
import { configManager } from "@/config/configManager";
import { getPageContent } from "@/api/pages";
import { readManifest } from "@/commands/pages/tracking";
import type { SyncStatus, TrackingEntry } from "@/types/tracking";
import { InstanceContext } from "@/contexts/InstanceContext";

interface ListTrackedOptions {
  instance?: string;
}

interface EntryStatus {
  entry: TrackingEntry;
  status: SyncStatus;
}

const CONCURRENCY = 5;

export async function listTrackedForCli(
  options: ListTrackedOptions
): Promise<void> {
  if (options.instance) InstanceContext.setInstance(options.instance);
  await configManager.initialize();

  const git = configManager.getGitConfig();
  if (!git) {
    console.error("No git config — run `wikit tui` to launch the wizard.");
    process.exit(1);
  }
  const repoPath = git.repoPath;

  const manifest = await readManifest(repoPath);
  if (!manifest || manifest.entries.length === 0) {
    console.log("No pages tracked.");
    return;
  }

  const results = await resolveStatuses(repoPath, manifest.entries);
  printTable(results);
}

async function resolveStatuses(
  repoPath: string,
  entries: TrackingEntry[]
): Promise<EntryStatus[]> {
  const results: EntryStatus[] = new Array(entries.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, entries.length) }, async () => {
    while (true) {
      const myIdx = idx++;
      if (myIdx >= entries.length) return;
      const entry = entries[myIdx]!;
      results[myIdx] = { entry, status: await checkEntry(repoPath, entry) };
    }
  });
  await Promise.all(workers);
  return results;
}

async function checkEntry(
  repoPath: string,
  entry: TrackingEntry
): Promise<SyncStatus> {
  const absLocal = isAbsolute(entry.localFile)
    ? entry.localFile
    : join(repoPath, entry.localFile);
  const localOk = existsSync(absLocal);

  let live;
  try {
    live = await getPageContent(entry.wikiPath, entry.locale);
  } catch {
    return localOk ? "unchecked" : "local-missing";
  }

  if (!live) return localOk ? "live-missing" : "local-missing";
  if (!localOk) return "local-missing";
  if (live.hash === entry.lastSyncedHash) return "in-sync";
  return "drifted";
}

function printTable(rows: EntryStatus[]): void {
  const headers = ["wikiPath", "localFile", "status", "lastSyncedAt"];
  const data = rows.map((r) => [
    r.entry.wikiPath,
    r.entry.localFile,
    r.status,
    r.entry.lastSyncedAt,
  ]);
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...data.map((row) => row[i]!.length))
  );
  const fmt = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i]!)).join("  ");
  console.log(fmt(headers));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of data) console.log(fmt(row));
}
