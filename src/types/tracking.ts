export interface TrackingEntry {
  wikiPath: string;
  locale: string;
  localFile: string;
  lastSyncedHash: string;
  lastSyncedAt: string;
  lastSyncedUpdatedAt: string;
}

export interface TrackingManifest {
  version: 1;
  instance: string;
  repoRoot: string;
  entries: TrackingEntry[];
}

export type SyncStatus =
  | "in-sync"
  | "drifted"
  | "local-missing"
  | "live-missing"
  | "unchecked";
