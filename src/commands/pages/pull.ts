import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, isAbsolute, join, relative } from "path";
import { configManager } from "@/config/configManager";
import { getPageContent } from "@/api/pages";
import { hasUnstagedChanges, stageFiles } from "@/utils/git";
import {
  findEntry,
  getManifestPath,
  readManifest,
  updateEntrySync,
  writeManifest,
} from "@/commands/pages/tracking";
import { renderUnifiedDiff } from "@/utils/htmlDiff";
import { InstanceContext } from "@/contexts/InstanceContext";
import type { TrackingEntry, TrackingManifest } from "@/types/tracking";

interface PullOptions {
  locale?: string;
  dryRun?: boolean;
  force?: boolean;
  all?: boolean;
  instance?: string;
}

export type PullOutcome =
  | "updated"
  | "in-sync"
  | "refused-wip"
  | "live-missing"
  | "dry-run";

export interface PullResult {
  entry: TrackingEntry;
  outcome: PullOutcome;
}

export async function pullForCli(
  wikiPaths: string[],
  options: PullOptions
): Promise<void> {
  if (options.instance) InstanceContext.setInstance(options.instance);
  await configManager.initialize();

  const git = configManager.getGitConfig();
  if (!git) {
    console.error("No git config — run `wikit tui` to launch the wizard.");
    process.exit(1);
  }
  const repoPath = git.repoPath;
  const locale = options.locale ?? "en";

  const manifest = await readManifest(repoPath);
  if (!manifest || manifest.entries.length === 0) {
    console.error("No pages tracked.");
    process.exit(1);
  }

  const selected = selectEntries(manifest, wikiPaths, locale, options.all);
  if (selected.length === 0) {
    console.error(
      "Specify wiki paths or --all. Nothing matched the given paths."
    );
    process.exit(1);
  }

  const { results, finalManifest } = await pullMany(repoPath, manifest, selected, options);

  const changedFiles = results
    .filter((r) => r.outcome === "updated")
    .map((r) => r.entry.localFile);

  if (!options.dryRun && changedFiles.length > 0) {
    await writeManifest(repoPath, finalManifest);
    const manifestRel = toRelative(repoPath, getManifestPath(repoPath));
    await stageFiles(repoPath, [...changedFiles, manifestRel]);
  }

  printPullSummary(results);
  const anyRefused = results.some((r) => r.outcome === "refused-wip");
  process.exit(anyRefused ? 1 : 0);
}

function selectEntries(
  manifest: TrackingManifest,
  wikiPaths: string[],
  locale: string,
  all: boolean | undefined
): TrackingEntry[] {
  if (all || wikiPaths.length === 0) {
    return all ? manifest.entries : [];
  }
  const picks: TrackingEntry[] = [];
  for (const wp of wikiPaths) {
    const e = findEntry(manifest, wp, locale);
    if (e) picks.push(e);
    else console.error(`Not tracked: ${wp} (locale=${locale}) — skipping.`);
  }
  return picks;
}

export async function pullMany(
  repoPath: string,
  startManifest: TrackingManifest,
  entries: TrackingEntry[],
  opts: PullOptions
): Promise<{ results: PullResult[]; finalManifest: TrackingManifest }> {
  let manifest = startManifest;
  const results: PullResult[] = [];
  for (const entry of entries) {
    const r = await pullOne(repoPath, entry, opts);
    results.push(r);
    if (r.outcome === "updated") {
      const live = await getPageContent(entry.wikiPath, entry.locale);
      if (live?.hash && live?.updatedAt) {
        manifest = updateEntrySync(manifest, entry.wikiPath, entry.locale, {
          hash: live.hash,
          updatedAt: live.updatedAt,
        });
      }
    }
  }
  return { results, finalManifest: manifest };
}

async function pullOne(
  repoPath: string,
  entry: TrackingEntry,
  opts: PullOptions
): Promise<PullResult> {
  const live = await getPageContent(entry.wikiPath, entry.locale);
  if (!live || !live.hash) {
    return { entry, outcome: "live-missing" };
  }
  if (live.hash === entry.lastSyncedHash) {
    return { entry, outcome: "in-sync" };
  }

  const absLocal = isAbsolute(entry.localFile)
    ? entry.localFile
    : join(repoPath, entry.localFile);

  if (existsSync(absLocal) && !opts.force) {
    const wip = await hasUnstagedChanges(repoPath, entry.localFile);
    if (wip) return { entry, outcome: "refused-wip" };
  }

  if (opts.dryRun) {
    const oldContent = existsSync(absLocal)
      ? await readFile(absLocal, "utf8")
      : "";
    console.log("");
    console.log(renderUnifiedDiff(oldContent, live.content, entry.wikiPath));
    return { entry, outcome: "dry-run" };
  }

  await mkdir(dirname(absLocal), { recursive: true });
  await writeFile(absLocal, live.content, "utf8");
  return { entry, outcome: "updated" };
}

function toRelative(repoPath: string, file: string): string {
  const abs = isAbsolute(file) ? file : join(repoPath, file);
  return relative(repoPath, abs).split("\\").join("/");
}

function printPullSummary(results: PullResult[]): void {
  const counts = {
    updated: 0,
    "in-sync": 0,
    "refused-wip": 0,
    "live-missing": 0,
    "dry-run": 0,
  };
  for (const r of results) counts[r.outcome]++;
  console.log("");
  console.log(
    `updated: ${counts.updated} • in-sync: ${counts["in-sync"]} • refused: ${counts["refused-wip"]} • live-missing: ${counts["live-missing"]} • dry-run: ${counts["dry-run"]}`
  );
  for (const r of results) {
    if (r.outcome === "refused-wip") {
      console.log(
        `  refused (WIP): ${r.entry.localFile} — re-run with --force to clobber`
      );
    } else if (r.outcome === "live-missing") {
      console.log(`  live-missing: ${r.entry.wikiPath}`);
    }
  }
}
