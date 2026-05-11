import { configManager } from "@/config/configManager";
import { commit, getStatus } from "@/utils/git";
import { readManifest } from "@/commands/pages/tracking";
import type { TrackingManifest } from "@/types/tracking";

interface CommitOptions {
  message?: string;
}

const SUBJECT_LIMIT = 72;

export type CommitOutcome =
  | { kind: "nothing-staged" }
  | { kind: "committed"; sha: string; message: string }
  | { kind: "error"; error: string };

export async function runCommit(
  repoPath: string,
  options: CommitOptions
): Promise<CommitOutcome> {
  const status = await getStatus(repoPath);
  if (status.staged.length === 0) {
    return { kind: "nothing-staged" };
  }
  const message =
    options.message ?? (await buildAutoMessage(repoPath, status.staged));
  try {
    const { sha } = await commit(repoPath, message);
    return { kind: "committed", sha, message };
  } catch (e) {
    return { kind: "error", error: e instanceof Error ? e.message : "?" };
  }
}

export async function commitForCli(options: CommitOptions): Promise<void> {
  await configManager.initialize();

  const git = configManager.getGitConfig();
  if (!git) {
    console.error("No git config — run `wikit tui` to launch the wizard.");
    process.exit(1);
  }

  const outcome = await runCommit(git.repoPath, options);
  if (outcome.kind === "nothing-staged") {
    console.log("Nothing to commit.");
    return;
  }
  if (outcome.kind === "error") {
    console.error(`Commit failed: ${outcome.error}`);
    process.exit(1);
  }
  console.log(
    `Committed ${outcome.sha.slice(0, 12)} — ${firstLine(outcome.message)}`
  );
}

async function buildAutoMessage(
  repoPath: string,
  stagedFiles: string[]
): Promise<string> {
  const manifest = await readManifest(repoPath);
  const wikiPaths = matchStagedToWikiPaths(manifest, stagedFiles);
  const count = wikiPaths.length;
  if (count === 0) {
    return "wikit: tracking manifest update";
  }
  return formatSubjectAndBody(wikiPaths, count);
}

function matchStagedToWikiPaths(
  manifest: TrackingManifest | null,
  stagedFiles: string[]
): string[] {
  if (!manifest) return [];
  const staged = new Set(stagedFiles);
  const matched: string[] = [];
  for (const entry of manifest.entries) {
    if (staged.has(entry.localFile)) matched.push(entry.wikiPath);
  }
  return matched;
}

function formatSubjectAndBody(wikiPaths: string[], count: number): string {
  const joined = wikiPaths.join(", ");
  const subject = `wikit: pull drift for ${count} page(s) — ${joined}`;
  if (subject.length <= SUBJECT_LIMIT) return subject;
  const shortSubject = `wikit: pull drift for ${count} page(s)`;
  const body = wikiPaths.map((p) => `- ${p}`).join("\n");
  return `${shortSubject}\n\n${body}`;
}

function firstLine(msg: string): string {
  const nl = msg.indexOf("\n");
  return nl === -1 ? msg : msg.slice(0, nl);
}
