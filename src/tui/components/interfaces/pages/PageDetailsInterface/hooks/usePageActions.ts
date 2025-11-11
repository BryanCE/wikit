import { copyToClipboard } from "@/utils/clipboard";
import { deletePage } from "@/api/pages";
import type { Page } from "@/types";

interface UsePageActionsProps {
  page: Page;
  setCopyStatus: (status: string) => void;
  loadPageDetails: () => Promise<void>;
}

export function usePageActions({
  page,
  setCopyStatus,
  loadPageDetails,
}: UsePageActionsProps) {
  const handleCopyPath = async (pathOverride?: string) => {
    try {
      const pathToCopy = pathOverride ?? page.path;
      copyToClipboard(pathToCopy);
      setCopyStatus(`Copied to clipboard: ${pathToCopy}`);
      setTimeout(() => setCopyStatus(""), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setCopyStatus(`Failed to copy: ${errorMsg}`);
      setTimeout(() => setCopyStatus(""), 3000);
    }
  };

  const handleDelete = async () => {
    const result = await deletePage(page.id);

    if (!result.succeeded) {
      throw new Error(result.message ?? "Failed to delete page");
    }
  };

  const handleMove = async (destinationPath: string, locale: string) => {
    const { movePage } = await import("@/api/pages");
    const result = await movePage(parseInt(page.id), destinationPath, locale);

    if (!result.succeeded) {
      throw new Error(result.message ?? "Failed to move page");
    }
  };

  const handleConvert = async (editor: string) => {
    const { convertPage } = await import("@/api/pages");
    const result = await convertPage(parseInt(page.id), editor);

    if (!result.succeeded) {
      throw new Error(result.message ?? "Failed to convert page");
    }

    await loadPageDetails();
  };

  const handleRender = async () => {
    const { renderPage } = await import("@/api/pages");
    const result = await renderPage(parseInt(page.id));

    if (!result.succeeded) {
      throw new Error(result.message ?? "Failed to render page");
    }

    await loadPageDetails();
  };

  return {
    handleCopyPath,
    handleDelete,
    handleMove,
    handleConvert,
    handleRender,
  };
}
