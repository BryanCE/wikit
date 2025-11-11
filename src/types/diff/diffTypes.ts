export interface DiffResult {
  field: string;
  instance1Value: unknown;
  instance2Value: unknown;
  isDifferent: boolean;
}

export interface InstanceDiffResult {
  category: string;
  differences: DiffResult[];
  hasDifferences: boolean;
}

export interface PageComparisonResult {
  category: string;
  instance1Count: number;
  instance2Count: number;
  instance1Only: string[];
  instance2Only: string[];
  commonPages: string[];
  hasDifferences: boolean;
}
