import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { logger } from "@/utils/logger";

const execFileAsync = promisify(execFile);

interface ExecResult {
  stdout: string;
  stderr: string;
}

interface ExecError extends Error {
  stdout?: string;
  stderr?: string;
  code?: number;
}

async function runGit(repoPath: string, args: string[]): Promise<ExecResult> {
  const fullArgs = ["-C", repoPath, ...args];
  logger.debug({ cmd: "git", args: fullArgs, cwd: repoPath }, "git invocation");
  try {
    const { stdout, stderr } = await execFileAsync("git", fullArgs);
    return { stdout, stderr };
  } catch (err) {
    const e = err as ExecError;
    throw new Error(
      `git ${args.join(" ")} failed (exit ${e.code ?? "?"}): ${e.stderr?.trim() ?? e.message}`
    );
  }
}

async function runGh(args: string[]): Promise<ExecResult> {
  logger.debug({ cmd: "gh", args }, "gh invocation");
  try {
    const { stdout, stderr } = await execFileAsync("gh", args);
    return { stdout, stderr };
  } catch (err) {
    const e = err as ExecError;
    throw new Error(
      `gh ${args.join(" ")} failed (exit ${e.code ?? "?"}): ${e.stderr?.trim() ?? e.message}`
    );
  }
}

export async function getRepoRoot(repoPath: string): Promise<string> {
  const { stdout } = await runGit(repoPath, ["rev-parse", "--show-toplevel"]);
  return stdout.trim();
}

export async function isGitRepo(repoPath: string): Promise<boolean> {
  try {
    await runGit(repoPath, ["rev-parse", "--is-inside-work-tree"]);
    return true;
  } catch {
    return false;
  }
}

export async function getCurrentBranch(repoPath: string): Promise<string> {
  const { stdout } = await runGit(repoPath, [
    "rev-parse",
    "--abbrev-ref",
    "HEAD",
  ]);
  return stdout.trim();
}

export async function getRemoteUrl(
  repoPath: string,
  remote: string
): Promise<string> {
  const { stdout } = await runGit(repoPath, ["remote", "get-url", remote]);
  return stdout.trim();
}

export interface RemoteInfo {
  name: string;
  fetchUrl: string;
  pushUrl: string;
}

export async function listRemotes(repoPath: string): Promise<RemoteInfo[]> {
  const { stdout } = await runGit(repoPath, ["remote", "-v"]);
  const byName = new Map<string, RemoteInfo>();
  for (const line of stdout.split("\n")) {
    if (!line.trim()) continue;
    const match = /^(\S+)\s+(\S+)\s+\((fetch|push)\)$/.exec(line);
    if (!match) continue;
    const [, name, url, kind] = match;
    if (!name || !url) continue;
    const existing = byName.get(name) ?? { name, fetchUrl: "", pushUrl: "" };
    if (kind === "fetch") existing.fetchUrl = url;
    else existing.pushUrl = url;
    byName.set(name, existing);
  }
  return [...byName.values()];
}

export interface GitStatus {
  staged: string[];
  unstaged: string[];
  untracked: string[];
}

export async function getStatus(repoPath: string): Promise<GitStatus> {
  const { stdout } = await runGit(repoPath, ["status", "--porcelain=v1"]);
  const staged: string[] = [];
  const unstaged: string[] = [];
  const untracked: string[] = [];
  for (const line of stdout.split("\n")) {
    if (!line) continue;
    const x = line[0];
    const y = line[1];
    const file = line.slice(3);
    if (x === "?" && y === "?") {
      untracked.push(file);
      continue;
    }
    if (x && x !== " ") staged.push(file);
    if (y && y !== " ") unstaged.push(file);
  }
  return { staged, unstaged, untracked };
}

export async function hasUnstagedChanges(
  repoPath: string,
  file: string
): Promise<boolean> {
  const status = await getStatus(repoPath);
  return status.unstaged.includes(file) || status.untracked.includes(file);
}

export async function stageFiles(
  repoPath: string,
  files: string[]
): Promise<void> {
  if (files.length === 0) return;
  await runGit(repoPath, ["add", "--", ...files]);
}

export async function commit(
  repoPath: string,
  message: string
): Promise<{ sha: string }> {
  await runGit(repoPath, ["commit", "-m", message]);
  const { stdout } = await runGit(repoPath, ["rev-parse", "HEAD"]);
  return { sha: stdout.trim() };
}

export async function push(
  repoPath: string,
  remote: string,
  branch: string
): Promise<void> {
  await runGit(repoPath, ["push", remote, branch]);
}

export async function pushWithToken(
  repoPath: string,
  remote: string,
  branch: string,
  token: string
): Promise<void> {
  const originalUrl = await getRemoteUrl(repoPath, remote);
  const tokenUrl = buildTokenUrl(originalUrl, token);
  try {
    await runGit(repoPath, ["remote", "set-url", "--push", remote, tokenUrl]);
    await runGit(repoPath, ["push", remote, branch]);
  } finally {
    await runGit(repoPath, [
      "remote",
      "set-url",
      "--push",
      remote,
      originalUrl,
    ]);
  }
}

function buildTokenUrl(remoteUrl: string, token: string): string {
  const https = /^https:\/\/(?:[^@/]+@)?([^/]+)\/(.+)$/.exec(remoteUrl);
  if (https) {
    const [, host, path] = https;
    return `https://${token}@${host}/${path}`;
  }
  const ssh = /^git@([^:]+):(.+)$/.exec(remoteUrl);
  if (ssh) {
    const [, host, path] = ssh;
    return `https://${token}@${host}/${path}`;
  }
  throw new Error(`Unsupported remote URL for token push: ${remoteUrl}`);
}

export interface GhAuthStatus {
  loggedIn: boolean;
  user?: string;
}

export async function ghAuthStatus(): Promise<GhAuthStatus> {
  try {
    const { stdout, stderr } = await runGh([
      "auth",
      "status",
      "--hostname",
      "github.com",
    ]);
    const out = `${stdout}\n${stderr}`;
    const userMatch = /account ([A-Za-z0-9._-]+)/i.exec(out);
    return { loggedIn: true, user: userMatch?.[1] };
  } catch {
    return { loggedIn: false };
  }
}

export async function cloneRepo(url: string, target: string): Promise<void> {
  logger.debug({ cmd: "git", args: ["clone", url, target] }, "git clone");
  try {
    await execFileAsync("git", ["clone", url, target]);
  } catch (err) {
    const e = err as ExecError;
    throw new Error(
      `git clone failed (exit ${e.code ?? "?"}): ${e.stderr?.trim() ?? e.message}`
    );
  }
}

export async function initRepo(path: string): Promise<void> {
  logger.debug({ cmd: "git", args: ["init", path] }, "git init");
  try {
    await execFileAsync("git", ["init", path]);
  } catch (err) {
    const e = err as ExecError;
    throw new Error(
      `git init failed (exit ${e.code ?? "?"}): ${e.stderr?.trim() ?? e.message}`
    );
  }
}

export async function addRemote(
  repoPath: string,
  name: string,
  url: string
): Promise<void> {
  await runGit(repoPath, ["remote", "add", name, url]);
}

export async function ghIsInstalled(): Promise<boolean> {
  try {
    await runGh(["--version"]);
    return true;
  } catch {
    return false;
  }
}
