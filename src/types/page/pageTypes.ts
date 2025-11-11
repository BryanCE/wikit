export interface Page {
  id: string;
  path: string;
  title: string;
  locale: string;
  isPublished: boolean;
}

export interface PageWithContent extends Page {
  content: string;
  contentType: string;
  description?: string;
  isPrivate: boolean;
  tags?: { id: string; title: string }[];
  editor: string;
  createdAt?: string;
  updatedAt?: string;
  hash?: string;
}

export interface PageSummary {
  totalPages: number;
  publishedPages: number;
  pagesByLocale: Record<string, number>;
  topLevelPaths: string[];
  [key: string]: unknown;
}

export interface PageExportData {
  pages: Page[] | PageWithContent[];
  exportedAt: string;
  instanceId?: string;
  includeContent: boolean;
  summary: {
    totalPages: number;
    publishedPages: number;
    unpublishedPages: number;
  };
}
