import { mkdir, readFile, rename, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join } from "path";
import type { TrackingEntry, TrackingManifest } from "@/types/tracking";

export function getManifestPath(repoRoot: string): string {
  return join(repoRoot, ".wikit", "tracking.json");
}

export async function readManifest(
  repoRoot: string
): Promise<TrackingManifest | null> {
  const path = getManifestPath(repoRoot);
  if (!existsSync(path)) return null;

  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as TrackingManifest;
  return parsed;
}

export async function writeManifest(
  repoRoot: string,
  manifest: TrackingManifest
): Promise<void> {
  const path = getManifestPath(repoRoot);
  const dir = dirname(path);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  const tmp = `${path}.tmp`;
  await writeFile(tmp, JSON.stringify(manifest, null, 2), "utf8");
  await rename(tmp, path);
}

export function findEntry(
  manifest: TrackingManifest,
  wikiPath: string,
  locale: string
): TrackingEntry | undefined {
  return manifest.entries.find(
    (e) => e.wikiPath === wikiPath && e.locale === locale
  );
}

export function findEntryByLocalFile(
  manifest: TrackingManifest,
  localFile: string
): TrackingEntry | undefined {
  return manifest.entries.find((e) => e.localFile === localFile);
}

export function addEntry(
  manifest: TrackingManifest,
  entry: TrackingEntry
): TrackingManifest {
  if (findEntry(manifest, entry.wikiPath, entry.locale)) {
    throw new Error(
      `Entry already exists for ${entry.wikiPath} (${entry.locale})`
    );
  }
  if (findEntryByLocalFile(manifest, entry.localFile)) {
    throw new Error(`Local file '${entry.localFile}' already bound`);
  }
  return { ...manifest, entries: [...manifest.entries, entry] };
}

export function removeEntry(
  manifest: TrackingManifest,
  wikiPath: string,
  locale: string
): TrackingManifest {
  return {
    ...manifest,
    entries: manifest.entries.filter(
      (e) => !(e.wikiPath === wikiPath && e.locale === locale)
    ),
  };
}

export function replaceEntryLocalFile(
  manifest: TrackingManifest,
  wikiPath: string,
  locale: string,
  newLocalFile: string
): TrackingManifest {
  const existingBinding = findEntryByLocalFile(manifest, newLocalFile);
  if (
    existingBinding &&
    !(
      existingBinding.wikiPath === wikiPath && existingBinding.locale === locale
    )
  ) {
    throw new Error(`Local file '${newLocalFile}' already bound`);
  }
  return {
    ...manifest,
    entries: manifest.entries.map((e) =>
      e.wikiPath === wikiPath && e.locale === locale
        ? { ...e, localFile: newLocalFile }
        : e
    ),
  };
}

export function updateEntrySync(
  manifest: TrackingManifest,
  wikiPath: string,
  locale: string,
  sync: { hash: string; updatedAt: string }
): TrackingManifest {
  const now = new Date().toISOString();
  return {
    ...manifest,
    entries: manifest.entries.map((e) =>
      e.wikiPath === wikiPath && e.locale === locale
        ? {
            ...e,
            lastSyncedHash: sync.hash,
            lastSyncedUpdatedAt: sync.updatedAt,
            lastSyncedAt: now,
          }
        : e
    ),
  };
}
