import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { dirname, isAbsolute, join, relative } from "path";
import { createInterface } from "readline";
import { configManager } from "@/config/configManager";
import { getPageContent } from "@/api/pages";
import { stageFiles } from "@/utils/git";
import {
  addEntry,
  readManifest,
  writeManifest,
} from "@/commands/pages/tracking";
import type { TrackingEntry, TrackingManifest } from "@/types/tracking";
import { InstanceContext } from "@/contexts/InstanceContext";

interface TrackOptions {
  locale?: string;
  instance?: string;
  yes?: boolean;
}

export async function trackForCli(
  wikiPath: string,
  localFile: string | undefined,
  options: TrackOptions
): Promise<void> {
  if (options.instance) InstanceContext.setInstance(options.instance);
  await configManager.initialize();

  const git = configManager.getGitConfig();
  if (!git) {
    console.error(
      "No git config — run `wikit tui` to launch the setup wizard."
    );
    process.exit(1);
  }
  const repoPath = git.repoPath;

  const locale = options.locale ?? "en";
  const live = await getPageContent(wikiPath, locale);
  if (!live) {
    console.error(`Live page not found: ${wikiPath} (locale=${locale})`);
    process.exit(1);
  }
  if (!live.hash || !live.updatedAt) {
    console.error(`Live page missing hash/updatedAt: ${wikiPath}`);
    process.exit(1);
  }

  const resolvedLocal = resolveLocalFile(repoPath, wikiPath, localFile);
  const relLocal = toRelative(repoPath, resolvedLocal);

  const instance =
    InstanceContext.getInstance() ?? options.instance ?? "default";
  const manifest = await readOrInitManifest(repoPath, instance);

  if (!existsSync(resolvedLocal)) {
    const seed = options.yes
      ? true
      : await confirmYesNo(`Seed ${relLocal} from live? (Y/n) `);
    if (!seed) {
      console.error("Aborted — local file does not exist and seed declined.");
      process.exit(1);
    }
    await mkdir(dirname(resolvedLocal), { recursive: true });
    await writeFile(resolvedLocal, live.content, "utf8");
    await stageFiles(repoPath, [relLocal]);
    console.log(`Seeded ${relLocal} from live.`);
  }

  const now = new Date().toISOString();
  const entry: TrackingEntry = {
    wikiPath,
    locale,
    localFile: relLocal,
    lastSyncedHash: live.hash,
    lastSyncedAt: now,
    lastSyncedUpdatedAt: live.updatedAt,
  };
  const updated = addEntry(manifest, entry);
  await writeManifest(repoPath, updated);
  console.log(`Tracked ${wikiPath} → ${relLocal}`);
}

function resolveLocalFile(
  repoPath: string,
  wikiPath: string,
  localFile: string | undefined
): string {
  if (localFile) {
    return isAbsolute(localFile) ? localFile : join(repoPath, localFile);
  }
  const stripped = wikiPath.replace(/^\/+/, "");
  return join(repoPath, stripped, "page.html");
}

function toRelative(repoPath: string, file: string): string {
  const rel = relative(repoPath, file);
  return rel.split("\\").join("/");
}

async function readOrInitManifest(
  repoPath: string,
  instance: string
): Promise<TrackingManifest> {
  const existing = await readManifest(repoPath);
  if (existing) return existing;
  return { version: 1, instance, repoRoot: ".", entries: [] };
}

function confirmYesNo(prompt: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      const a = answer.trim().toLowerCase();
      resolve(a === "" || a === "y" || a === "yes");
    });
  });
}
