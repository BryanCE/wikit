import type { UserMinimal } from "../user/userTypes";

export interface GroupMinimal {
  id: number;
  name: string;
  isSystem: boolean;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Group extends GroupMinimal {
  redirectOnLogin?: string;
  permissions: string[];
  pageRules?: PageRule[];
  users?: UserMinimal[];
}

export interface PageRule {
  id: string;
  deny: boolean;
  match: PageRuleMatch;
  roles: string[];
  path: string;
  locales: string[];
}

export type PageRuleMatch = "START" | "EXACT" | "END" | "REGEX" | "TAG";

export interface GroupCommandOptions {
  instance?: string;
}
