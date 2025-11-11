export interface NavigationItem {
  id: string;
  kind: string;
  label?: string;
  icon?: string;
  targetType?: string;
  target?: string;
  visibilityMode?: string;
  visibilityGroups?: number[];
  expanded?: boolean;
  children?: NavigationItem[];
}

export interface NavigationTree {
  locale: string;
  items: NavigationItem[];
}

export type NavigationMode = "NONE" | "TREE" | "MIXED" | "STATIC";

export interface NavigationConfig {
  mode: NavigationMode;
  [key: string]: unknown;
}

export const NAVIGATION_MODES: {
  mode: NavigationMode;
  description: string;
}[] = [
  { mode: "NONE", description: "No navigation menu" },
  { mode: "TREE", description: "Tree-based navigation" },
  { mode: "MIXED", description: "Mixed navigation (tree + static)" },
  { mode: "STATIC", description: "Static navigation menu" },
];

export interface NavigationExportData {
  config: NavigationConfig;
  tree: NavigationTree[];
  exportedAt: string;
}
