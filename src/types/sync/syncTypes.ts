export interface SyncOptions {
  from: string;
  to: string;
  config?: boolean;
  theme?: boolean;
  assets?: boolean;
  pages?: boolean;
  pagePrefix?: string;
  all?: boolean;
  dryRun?: boolean;
  force?: boolean;
}

export interface SyncResult {
  category: string;
  success: boolean;
  message: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
}

export interface SyncSummary {
  fromInstance: string;
  toInstance: string;
  results: SyncResult[];
  totalChanges: number;
  totalErrors: number;
  dryRun: boolean;
}

export interface SyncCommandOptions {
  from?: string;
  to?: string;
  config?: boolean;
  theme?: boolean;
  assets?: boolean;
  pages?: boolean;
  pagePrefix?: string;
  all?: boolean;
  dryRun?: boolean;
}
