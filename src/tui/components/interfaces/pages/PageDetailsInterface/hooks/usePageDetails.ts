import { useState, useEffect } from "react";
import { getPageContent } from "@/api/pages";
import type { Page } from "@/types";

export interface DetailedPage extends Page {
  content?: string;
  description?: string;
  tags?: { id: string; title: string }[];
  createdAt?: string;
  updatedAt?: string;
  editor?: string;
  isPrivate?: boolean;
  hash?: string;
  contentType?: string;
}

export function usePageDetails(page: Page) {
  const [detailedPage, setDetailedPage] = useState<DetailedPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPageDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getPageContent(page.path, page.locale);

      if (!result) {
        setError(
          `No page found with path: ${page.path} locale: ${page.locale}`
        );
        return;
      }
      setDetailedPage(result as DetailedPage);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load page details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPageDetails();
  }, [page.id]);

  return {
    detailedPage,
    loading,
    error,
    loadPageDetails,
  };
}
