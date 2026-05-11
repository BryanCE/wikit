import { isAbsolute, join, relative } from "path";
import { configManager } from "@/config/configManager";
import { getPageContent } from "@/api/pages";
import {
  findEntry,
  findEntryByLocalFile,
  readManifest,
  replaceEntryLocalFile,
  updateEntrySync,
  writeManifest,
} from "@/commands/pages/tracking";
import { InstanceContext } from "@/contexts/InstanceContext";

interface RetrackOptions {
  locale?: string;
  instance?: string;
}

export async function retrackForCli(
  wikiPath: string,
  newLocalFile: string,
  options: RetrackOptions
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
  if (!manifest) {
    console.error("No tracking manifest — nothing to retrack.");
    process.exit(1);
  }

  const entry = findEntry(manifest, wikiPath, locale);
  if (!entry) {
    console.error(`Not tracked: ${wikiPath} (locale=${locale})`);
    process.exit(1);
  }

  const relNew = toRelative(repoPath, newLocalFile);
  const conflicting = findEntryByLocalFile(manifest, relNew);
  if (
    conflicting &&
    !(conflicting.wikiPath === wikiPath && conflicting.locale === locale)
  ) {
    console.error(
      `Local file '${relNew}' already bound to ${conflicting.wikiPath}.`
    );
    process.exit(1);
  }

  const live = await getPageContent(wikiPath, locale);
  if (!live || !live.hash || !live.updatedAt) {
    console.error(`Cannot fetch live page for ${wikiPath}.`);
    process.exit(1);
  }

  const rebound = replaceEntryLocalFile(manifest, wikiPath, locale, relNew);
  const synced = updateEntrySync(rebound, wikiPath, locale, {
    hash: live.hash,
    updatedAt: live.updatedAt,
  });
  await writeManifest(repoPath, synced);
  console.log(`Retracked ${wikiPath} → ${relNew} (old file untouched).`);
}

function toRelative(repoPath: string, file: string): string {
  const abs = isAbsolute(file) ? file : join(repoPath, file);
  return relative(repoPath, abs).split("\\").join("/");
}
