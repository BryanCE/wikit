import type { InstanceDiffResult, PageComparisonResult } from '../diff/diffTypes';

export interface CompareOptions {
  from?: string;
  to?: string;
  config?: boolean;
  pages?: boolean;
  users?: boolean;
  assets?: boolean;
  theme?: boolean;
  system?: boolean;
  localization?: boolean;
  navigation?: boolean;
  all?: boolean;
  details?: boolean;
  pagePrefix?: string;
}

export interface CompareResults {
  siteConfig?: InstanceDiffResult;
  themeConfig?: InstanceDiffResult;
  localizationConfig?: InstanceDiffResult;
  navigationConfig?: InstanceDiffResult;
  userSummary?: InstanceDiffResult;
  systemInfo?: InstanceDiffResult;
  pageSummary?: InstanceDiffResult;
  pageComparison?: PageComparisonResult;
  instance1Name: string;
  instance2Name: string;
}
