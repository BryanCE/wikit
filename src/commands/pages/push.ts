import { configManager } from "@/config/configManager";
import { getCurrentBranch, push, pushWithToken } from "@/utils/git";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type PushOutcome =
  | { kind: "manual"; command: string }
  | { kind: "pushed"; remote: string; branch: string; sha?: string }
  | { kind: "missing-pat" }
  | { kind: "error"; error: string };

export async function runPush(): Promise<PushOutcome> {
  const git = configManager.getGitConfig();
  if (!git) {
    return { kind: "error", error: "No git config — run wizard." };
  }
  const { repoPath, remote, branch, authMode } = git;

  if (authMode === "manual") {
    return {
      kind: "manual",
      command: `git -C ${repoPath} push ${remote} ${branch}`,
    };
  }

  if (authMode === "pat") {
    const token = await configManager.getGitPat();
    if (!token) return { kind: "missing-pat" };
    try {
      await pushWithToken(repoPath, remote, branch, token);
      return { kind: "pushed", remote, branch, sha: await readHead(repoPath) };
    } catch (e) {
      return { kind: "error", error: e instanceof Error ? e.message : "?" };
    }
  }

  try {
    await push(repoPath, remote, branch);
    return { kind: "pushed", remote, branch, sha: await readHead(repoPath) };
  } catch (e) {
    return { kind: "error", error: e instanceof Error ? e.message : "?" };
  }
}

export async function pushForCli(): Promise<void> {
  await configManager.initialize();
  const outcome = await runPush();

  if (outcome.kind === "manual") {
    console.log(`Run manually: ${outcome.command}`);
    return;
  }
  if (outcome.kind === "missing-pat") {
    console.error(
      "PAT not set. Reconfigure via wizard or run with a different auth mode."
    );
    process.exit(1);
  }
  if (outcome.kind === "error") {
    console.error(`Push failed: ${outcome.error}`);
    if (/auth|denied|403|401/i.test(outcome.error)) {
      console.error("Hint: run `gh auth status` to confirm credentials.");
    }
    process.exit(1);
  }
  const short = outcome.sha?.slice(0, 12);
  const head = await getCurrentBranch(
    configManager.getGitConfig()!.repoPath
  ).catch(() => outcome.branch);
  console.log(`Pushed ${outcome.remote}/${head}${short ? ` at ${short}` : ""}`);
}

async function readHead(repoPath: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync("git", [
      "-C",
      repoPath,
      "rev-parse",
      "HEAD",
    ]);
    return stdout.trim();
  } catch {
    return undefined;
  }
}

