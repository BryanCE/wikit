import { createInterface } from "readline";
import { configManager } from "@/config/configManager";
import { getManifestPath, readManifest } from "@/commands/pages/tracking";
import { stageFiles } from "@/utils/git";
import { runCheck, type CheckResult } from "@/commands/pages/check";
import { pullMany } from "@/commands/pages/pull";
import { runCommit } from "@/commands/pages/commit";
import { runPush } from "@/commands/pages/push";
import { renderUnifiedDiff } from "@/utils/htmlDiff";
import { InstanceContext } from "@/contexts/InstanceContext";
import { isAbsolute, join, relative } from "path";

interface SyncAllOptions {
  yes?: boolean;
  dryRun?: boolean;
  skipPush?: boolean;
  instance?: string;
}

export async function syncAllForCli(options: SyncAllOptions): Promise<void> {
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

  console.log("Checking for drift…");
  const results = await runCheck(repoPath, manifest.entries);
  const drifted = results.filter((r) => r.status === "drifted");

  if (drifted.length === 0) {
    console.log("Everything in sync.");
    return;
  }

  printDriftSummary(drifted);

  if (options.dryRun) {
    printDryRunDiffs(drifted);
    console.log("\nDry run — no changes written.");
    return;
  }

  if (!options.yes) {
    const ok = await confirm(`Pull these ${drifted.length} page(s)? [Y/n] `);
    if (!ok) {
      console.log("Aborted.");
      return;
    }
  }

  const driftedEntries = drifted.map((r) => r.entry);
  const { results: pullResults, finalManifest } = await pullMany(
    repoPath,
    manifest,
    driftedEntries,
    { dryRun: false, force: false }
  );

  const changedFiles = pullResults
    .filter((r) => r.outcome === "updated")
    .map((r) => r.entry.localFile);

  if (changedFiles.length === 0) {
    console.log("No files updated (all entries refused or live-missing).");
    return;
  }

  const { writeManifest } = await import("@/commands/pages/tracking");
  await writeManifest(repoPath, finalManifest);
  const manifestRel = toRelative(repoPath, getManifestPath(repoPath));
  await stageFiles(repoPath, [...changedFiles, manifestRel]);
  console.log(`Pulled ${changedFiles.length} file(s), staged.`);

  const commitOutcome = await runCommit(repoPath, {});
  if (commitOutcome.kind === "error") {
    console.error(`Commit failed: ${commitOutcome.error}`);
    process.exit(1);
  }
  if (commitOutcome.kind === "nothing-staged") {
    console.log("Nothing was staged — skipping commit.");
    return;
  }
  console.log(
    `Committed ${commitOutcome.sha.slice(0, 12)} — ${firstLine(commitOutcome.message)}`
  );

  if (options.skipPush) {
    console.log("--skip-push set; stopped before push.");
    return;
  }

  const pushOutcome = await runPush();
  if (pushOutcome.kind === "manual") {
    console.log(`Manual mode — run: ${pushOutcome.command}`);
    return;
  }
  if (pushOutcome.kind === "missing-pat") {
    console.error("PAT not set — reconfigure via wizard.");
    process.exit(1);
  }
  if (pushOutcome.kind === "error") {
    console.error(`Push failed: ${pushOutcome.error}`);
    process.exit(1);
  }
  const short = pushOutcome.sha?.slice(0, 12);
  console.log(
    `Pushed ${pushOutcome.remote}/${pushOutcome.branch}${short ? ` at ${short}` : ""}`
  );
}

function printDriftSummary(drifted: CheckResult[]): void {
  console.log(`\n${drifted.length} drifted page(s):`);
  for (const r of drifted) {
    const delta =
      r.added !== undefined ? ` (+${r.added}/-${r.removed})` : "";
    console.log(`  ${r.entry.wikiPath} → ${r.entry.localFile}${delta}`);
  }
}

function printDryRunDiffs(drifted: CheckResult[]): void {
  for (const r of drifted) {
    if (!r.live || r.localContent === null) continue;
    console.log("");
    console.log(
      renderUnifiedDiff(r.localContent, r.live.content, r.entry.wikiPath)
    );
  }
}

function confirm(prompt: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      const a = answer.trim().toLowerCase();
      resolve(a === "" || a === "y" || a === "yes");
    });
  });
}

function toRelative(repoPath: string, file: string): string {
  const abs = isAbsolute(file) ? file : join(repoPath, file);
  return relative(repoPath, abs).split("\\").join("/");
}

function firstLine(msg: string): string {
  const nl = msg.indexOf("\n");
  return nl === -1 ? msg : msg.slice(0, nl);
}
