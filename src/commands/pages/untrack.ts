import { configManager } from "@/config/configManager";
import {
  findEntry,
  readManifest,
  removeEntry,
  writeManifest,
} from "@/commands/pages/tracking";
import { InstanceContext } from "@/contexts/InstanceContext";

interface UntrackOptions {
  locale?: string;
  instance?: string;
}

export async function untrackForCli(
  wikiPath: string,
  options: UntrackOptions
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
    console.error("No tracking manifest — nothing to untrack.");
    process.exit(1);
  }

  const entry = findEntry(manifest, wikiPath, locale);
  if (!entry) {
    console.error(`Not tracked: ${wikiPath} (locale=${locale})`);
    process.exit(1);
  }

  const updated = removeEntry(manifest, wikiPath, locale);
  await writeManifest(repoPath, updated);
  console.log(
    `Untracked ${wikiPath}. Local file '${entry.localFile}' left in place.`
  );
}
