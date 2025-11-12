import { useInput } from "ink";
import {
  analyzeExports,
  compareExports,
  findOrphanedPages,
} from "@/utils/analyzer";
import { getPageLinks, getAllPages } from "@/api";
import { readFileSync } from "fs";
import type {
  AnalysisResult,
  ExportDiffResult,
  OrphanAnalysisResult,
  Page,
  PageExportData,
  NavigationExportData,
} from "@/types";
import type { AnalysisTab } from "../AnalysisInterface";

interface UseAnalysisKeyboardProps {
  currentTab: AnalysisTab;
  setCurrentTab: (tab: AnalysisTab) => void;
  inAnalyzeContent: boolean;
  setInAnalyzeContent: (value: boolean) => void;
  inComparePagesContent: boolean;
  setInComparePagesContent: (value: boolean) => void;
  inCompareNavContent: boolean;
  setInCompareNavContent: (value: boolean) => void;
  inOrphanedContent: boolean;
  setInOrphanedContent: (value: boolean) => void;
  // Analyze tab state
  analyzePagesPath: string;
  setAnalyzePagesPath: (value: string) => void;
  analyzeNavPath: string;
  setAnalyzeNavPath: (value: string) => void;
  analyzeCurrentField: number;
  setAnalyzeCurrentField: (value: number) => void;
  analyzeFocusArea: "fields" | "buttons";
  setAnalyzeFocusArea: (value: "fields" | "buttons") => void;
  analyzeSelectedButton: "analyze" | "cancel";
  setAnalyzeSelectedButton: (value: "analyze" | "cancel") => void;
  analyzeShowFileBrowser: boolean;
  setAnalyzeShowFileBrowser: (value: boolean) => void;
  analyzeBrowserField: 0 | 1;
  setAnalyzeBrowserField: (value: 0 | 1) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
  analyzeError: string | null;
  setAnalyzeError: (value: string | null) => void;
  analyzeResultsIndex: number;
  setAnalyzeResultsIndex: (value: number) => void;
  analyzeSelectedPage: Page | undefined;
  setAnalyzeSelectedPage: (value: Page | undefined) => void;
  analysisResult: AnalysisResult | null;
  onAnalysisComplete: (result: AnalysisResult | null) => void;
  // Compare Pages tab state
  comparePagesOldPath: string;
  setComparePagesOldPath: (value: string) => void;
  comparePagesNewPath: string;
  setComparePagesNewPath: (value: string) => void;
  comparePagesCurrentField: number;
  setComparePagesCurrentField: (value: number) => void;
  comparePagesFocusArea: "fields" | "buttons";
  setComparePagesFocusArea: (value: "fields" | "buttons") => void;
  comparePagesSelectedButton: "compare" | "cancel";
  setComparePagesSelectedButton: (value: "compare" | "cancel") => void;
  comparePagesShowFileBrowser: boolean;
  setComparePagesShowFileBrowser: (value: boolean) => void;
  comparePagesBrowserField: 0 | 1;
  setComparePagesBrowserField: (value: 0 | 1) => void;
  isComparingPages: boolean;
  setIsComparingPages: (value: boolean) => void;
  comparePagesError: string | null;
  setComparePagesError: (value: string | null) => void;
  comparePagesResultsIndex: number;
  setComparePagesResultsIndex: (value: number) => void;
  comparePagesSelectedPage: Page | undefined;
  setComparePagesSelectedPage: (value: Page | undefined) => void;
  pagesComparisonResult: ExportDiffResult | null;
  onPagesComparisonComplete: (result: ExportDiffResult | null) => void;
  // Compare Nav tab state
  compareNavOldPath: string;
  setCompareNavOldPath: (value: string) => void;
  compareNavNewPath: string;
  setCompareNavNewPath: (value: string) => void;
  compareNavCurrentField: number;
  setCompareNavCurrentField: (value: number) => void;
  compareNavFocusArea: "fields" | "buttons";
  setCompareNavFocusArea: (value: "fields" | "buttons") => void;
  compareNavSelectedButton: "compare" | "cancel";
  setCompareNavSelectedButton: (value: "compare" | "cancel") => void;
  compareNavShowFileBrowser: boolean;
  setCompareNavShowFileBrowser: (value: boolean) => void;
  compareNavBrowserField: 0 | 1;
  setCompareNavBrowserField: (value: 0 | 1) => void;
  isComparingNav: boolean;
  setIsComparingNav: (value: boolean) => void;
  compareNavError: string | null;
  setCompareNavError: (value: string | null) => void;
  compareNavResultsIndex: number;
  setCompareNavResultsIndex: (value: number) => void;
  compareNavSelectedPage: Page | undefined;
  setCompareNavSelectedPage: (value: Page | undefined) => void;
  navComparisonResult: ExportDiffResult | null;
  onNavComparisonComplete: (result: ExportDiffResult | null) => void;
  // Orphaned tab state
  orphanedFocusArea: "button" | "results";
  setOrphanedFocusArea: (value: "button" | "results") => void;
  isFetchingOrphans: boolean;
  setIsFetchingOrphans: (value: boolean) => void;
  orphanedError: string | null;
  setOrphanedError: (value: string | null) => void;
  orphanedResultsIndex: number;
  setOrphanedResultsIndex: (value: number) => void;
  orphanedSelectedPage: Page | undefined;
  setOrphanedSelectedPage: (value: Page | undefined) => void;
  orphanResult: OrphanAnalysisResult | null;
  onOrphanComplete: (result: OrphanAnalysisResult | null) => void;
  // Shared callbacks
  onPageSelect?: (page: Page) => void;
  isPageDetailsOpen: boolean;
}

export function useAnalysisKeyboard(props: UseAnalysisKeyboardProps) {
  const {
    currentTab,
    setCurrentTab,
    inAnalyzeContent,
    setInAnalyzeContent,
    inComparePagesContent,
    setInComparePagesContent,
    inCompareNavContent,
    setInCompareNavContent,
    inOrphanedContent,
    setInOrphanedContent,
    // Analyze tab
    analyzePagesPath,
    setAnalyzePagesPath,
    analyzeNavPath,
    setAnalyzeNavPath,
    analyzeCurrentField,
    setAnalyzeCurrentField,
    analyzeFocusArea,
    setAnalyzeFocusArea,
    analyzeSelectedButton,
    setAnalyzeSelectedButton,
    analyzeShowFileBrowser,
    setAnalyzeShowFileBrowser,
    setAnalyzeBrowserField,
    isAnalyzing,
    setIsAnalyzing,
    setAnalyzeError,
    analyzeResultsIndex,
    setAnalyzeResultsIndex,
    analyzeSelectedPage,
    analysisResult,
    onAnalysisComplete,
    // Compare Pages tab
    comparePagesOldPath,
    setComparePagesOldPath,
    comparePagesNewPath,
    setComparePagesNewPath,
    comparePagesCurrentField,
    setComparePagesCurrentField,
    comparePagesFocusArea,
    setComparePagesFocusArea,
    comparePagesSelectedButton,
    setComparePagesSelectedButton,
    comparePagesShowFileBrowser,
    setComparePagesShowFileBrowser,
    setComparePagesBrowserField,
    isComparingPages,
    setIsComparingPages,
    setComparePagesError,
    comparePagesResultsIndex,
    setComparePagesResultsIndex,
    comparePagesSelectedPage,
    pagesComparisonResult,
    onPagesComparisonComplete,
    // Compare Nav tab
    compareNavOldPath,
    setCompareNavOldPath,
    compareNavNewPath,
    setCompareNavNewPath,
    compareNavCurrentField,
    setCompareNavCurrentField,
    compareNavFocusArea,
    setCompareNavFocusArea,
    compareNavSelectedButton,
    setCompareNavSelectedButton,
    compareNavShowFileBrowser,
    setCompareNavShowFileBrowser,
    setCompareNavBrowserField,
    isComparingNav,
    setIsComparingNav,
    setCompareNavError,
    compareNavResultsIndex,
    setCompareNavResultsIndex,
    compareNavSelectedPage,
    navComparisonResult,
    onNavComparisonComplete,
    // Orphaned tab
    isFetchingOrphans,
    setIsFetchingOrphans,
    setOrphanedError,
    orphanedResultsIndex,
    setOrphanedResultsIndex,
    orphanedSelectedPage,
    orphanResult,
    onOrphanComplete,
    // Shared
    onPageSelect,
    isPageDetailsOpen,
  } = props;

  // Action handlers for Analyze tab
  const handleAnalyze = async () => {
    if (!analyzePagesPath || !analyzeNavPath) {
      setAnalyzeError("Please select both export files");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const pagesData = JSON.parse(
        readFileSync(analyzePagesPath, "utf-8")
      ) as PageExportData;
      const navData = JSON.parse(
        readFileSync(analyzeNavPath, "utf-8")
      ) as NavigationExportData;

      const result = analyzeExports(pagesData, navData);
      onAnalysisComplete(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setAnalyzeError(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeCancel = () => {
    setAnalyzePagesPath("");
    setAnalyzeNavPath("");
    setAnalyzeCurrentField(0);
    setAnalyzeFocusArea("fields");
    setAnalyzeError(null);
  };

  // Action handlers for Compare Pages tab
  const handleComparePages = async () => {
    if (!comparePagesOldPath || !comparePagesNewPath) {
      setComparePagesError("Please select both old and new pages exports");
      return;
    }

    setIsComparingPages(true);
    setComparePagesError(null);

    try {
      const oldPages = JSON.parse(
        readFileSync(comparePagesOldPath, "utf-8")
      ) as PageExportData;
      const newPages = JSON.parse(
        readFileSync(comparePagesNewPath, "utf-8")
      ) as PageExportData;

      const result = compareExports(oldPages, newPages, undefined, undefined);
      onPagesComparisonComplete(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setComparePagesError(errorMsg);
    } finally {
      setIsComparingPages(false);
    }
  };

  const handleComparePagesCancel = () => {
    setComparePagesOldPath("");
    setComparePagesNewPath("");
    setComparePagesCurrentField(0);
    setComparePagesFocusArea("fields");
    setComparePagesError(null);
  };

  // Action handlers for Compare Nav tab
  const handleCompareNav = async () => {
    if (!compareNavOldPath || !compareNavNewPath) {
      setCompareNavError("Please select both old and new navigation exports");
      return;
    }

    setIsComparingNav(true);
    setCompareNavError(null);

    try {
      const oldNav = JSON.parse(
        readFileSync(compareNavOldPath, "utf-8")
      ) as NavigationExportData;
      const newNav = JSON.parse(
        readFileSync(compareNavNewPath, "utf-8")
      ) as NavigationExportData;

      const result = compareExports(undefined, undefined, oldNav, newNav);
      onNavComparisonComplete(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setCompareNavError(errorMsg);
    } finally {
      setIsComparingNav(false);
    }
  };

  const handleCompareNavCancel = () => {
    setCompareNavOldPath("");
    setCompareNavNewPath("");
    setCompareNavCurrentField(0);
    setCompareNavFocusArea("fields");
    setCompareNavError(null);
  };

  // Action handler for Orphaned tab
  const handleFetchOrphans = async () => {
    setIsFetchingOrphans(true);
    setOrphanedError(null);

    try {
      const [pages, pageLinks] = await Promise.all([
        getAllPages(),
        getPageLinks(),
      ]);

      const result = findOrphanedPages(pages, pageLinks);
      onOrphanComplete(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setOrphanedError(errorMsg);
    } finally {
      setIsFetchingOrphans(false);
    }
  };

  useInput((input, key) => {
    // Block input when PageDetails modal is open, file browser is open, or processing
    if (
      isPageDetailsOpen ||
      analyzeShowFileBrowser ||
      comparePagesShowFileBrowser ||
      compareNavShowFileBrowser ||
      isAnalyzing ||
      isComparingPages ||
      isComparingNav ||
      isFetchingOrphans
    ) {
      return;
    }

    // Tab key ALWAYS works - exits content modes and switches tabs
    if (key.tab) {
      setInAnalyzeContent(false);
      setInComparePagesContent(false);
      setInCompareNavContent(false);
      setInOrphanedContent(false);
      const nextTab =
        currentTab === "analyze"
          ? "comparePages"
          : currentTab === "comparePages"
          ? "compareNav"
          : currentTab === "compareNav"
          ? "orphaned"
          : "analyze";
      setCurrentTab(nextTab);
      return;
    }

    // Arrow keys for tab navigation - ONLY when NOT in content
    if (
      key.rightArrow &&
      !inAnalyzeContent &&
      !inComparePagesContent &&
      !inCompareNavContent &&
      !inOrphanedContent
    ) {
      const nextTab =
        currentTab === "analyze"
          ? "comparePages"
          : currentTab === "comparePages"
          ? "compareNav"
          : currentTab === "compareNav"
          ? "orphaned"
          : "analyze";
      setCurrentTab(nextTab);
      return;
    }
    if (
      key.leftArrow &&
      !inAnalyzeContent &&
      !inComparePagesContent &&
      !inCompareNavContent &&
      !inOrphanedContent
    ) {
      const prevTab =
        currentTab === "comparePages"
          ? "analyze"
          : currentTab === "compareNav"
          ? "comparePages"
          : currentTab === "orphaned"
          ? "compareNav"
          : "orphaned";
      setCurrentTab(prevTab);
      return;
    }

    // Quick tab keys ALWAYS work - exit content modes
    if (input === "1") {
      setCurrentTab("analyze");
      setInAnalyzeContent(false);
      setInComparePagesContent(false);
      setInCompareNavContent(false);
      setInOrphanedContent(false);
      return;
    }
    if (input === "2") {
      setCurrentTab("comparePages");
      setInAnalyzeContent(false);
      setInComparePagesContent(false);
      setInCompareNavContent(false);
      setInOrphanedContent(false);
      return;
    }
    if (input === "3") {
      setCurrentTab("compareNav");
      setInAnalyzeContent(false);
      setInComparePagesContent(false);
      setInCompareNavContent(false);
      setInOrphanedContent(false);
      return;
    }
    if (input === "4") {
      setCurrentTab("orphaned");
      setInAnalyzeContent(false);
      setInComparePagesContent(false);
      setInCompareNavContent(false);
      setInOrphanedContent(false);
      return;
    }

    // ANALYZE TAB: Enter content (down arrow when NOT in content)
    if (currentTab === "analyze" && !inAnalyzeContent && key.downArrow) {
      setInAnalyzeContent(true);
      return;
    }

    // COMPARE PAGES TAB: Enter content (down arrow when NOT in content)
    if (
      currentTab === "comparePages" &&
      !inComparePagesContent &&
      key.downArrow
    ) {
      setInComparePagesContent(true);
      return;
    }

    // COMPARE NAV TAB: Enter content (down arrow when NOT in content)
    if (currentTab === "compareNav" && !inCompareNavContent && key.downArrow) {
      setInCompareNavContent(true);
      return;
    }

    // ORPHANED TAB: Enter content (down arrow when NOT in content)
    if (currentTab === "orphaned" && !inOrphanedContent && key.downArrow) {
      setInOrphanedContent(true);
      return;
    }

    // ANALYZE TAB CONTENT NAVIGATION
    if (currentTab === "analyze" && inAnalyzeContent) {
      // Results mode
      if (analysisResult) {
        if (key.upArrow) {
          if (analyzeResultsIndex === 0) {
            setInAnalyzeContent(false); // Exit to tab bar
          } else {
            setAnalyzeResultsIndex(Math.max(0, analyzeResultsIndex - 1));
          }
          return;
        }
        if (key.downArrow) {
          setAnalyzeResultsIndex(Math.min(999, analyzeResultsIndex + 1)); // Large max, VirtualizedList will clamp
          return;
        }
        if (key.return && onPageSelect && analyzeSelectedPage) {
          onPageSelect(analyzeSelectedPage);
          return;
        }
        return;
      }

      // Form mode: Navigate fields
      if (analyzeFocusArea === "fields") {
        if (key.upArrow) {
          if (analyzeCurrentField === 0) {
            setInAnalyzeContent(false); // Exit to tab bar
          } else {
            setAnalyzeCurrentField(Math.max(0, analyzeCurrentField - 1));
          }
        } else if (key.downArrow) {
          if (analyzeCurrentField < 1) {
            setAnalyzeCurrentField(analyzeCurrentField + 1);
          } else {
            setAnalyzeFocusArea("buttons");
          }
        } else if (input === " " || key.return) {
          setAnalyzeBrowserField(analyzeCurrentField as 0 | 1);
          setAnalyzeShowFileBrowser(true);
        }
      } else {
        // Navigate buttons
        if (key.upArrow) {
          setAnalyzeFocusArea("fields");
          setAnalyzeCurrentField(1); // Go to last field
        } else if (key.leftArrow) {
          setAnalyzeSelectedButton("analyze");
        } else if (key.rightArrow) {
          setAnalyzeSelectedButton("cancel");
        } else if (key.return) {
          if (analyzeSelectedButton === "analyze") {
            void handleAnalyze();
          } else {
            handleAnalyzeCancel();
          }
        }
      }
      return;
    }

    // COMPARE PAGES TAB CONTENT NAVIGATION
    if (currentTab === "comparePages" && inComparePagesContent) {
      // Results mode
      if (pagesComparisonResult) {
        if (key.upArrow) {
          if (comparePagesResultsIndex === 0) {
            setInComparePagesContent(false); // Exit to tab bar
          } else {
            setComparePagesResultsIndex(
              Math.max(0, comparePagesResultsIndex - 1)
            );
          }
          return;
        }
        if (key.downArrow) {
          setComparePagesResultsIndex(
            Math.min(999, comparePagesResultsIndex + 1)
          ); // Large max, VirtualizedList will clamp
          return;
        }
        if (key.return && onPageSelect && comparePagesSelectedPage) {
          onPageSelect(comparePagesSelectedPage);
          return;
        }
        return;
      }

      // Form mode: Navigate fields
      if (comparePagesFocusArea === "fields") {
        if (key.upArrow) {
          if (comparePagesCurrentField === 0) {
            setInComparePagesContent(false); // Exit to tab bar
          } else {
            setComparePagesCurrentField(
              Math.max(0, comparePagesCurrentField - 1)
            );
          }
        } else if (key.downArrow) {
          if (comparePagesCurrentField < 1) {
            setComparePagesCurrentField(comparePagesCurrentField + 1);
          } else {
            setComparePagesFocusArea("buttons");
          }
        } else if (input === " " || key.return) {
          setComparePagesBrowserField(comparePagesCurrentField as 0 | 1);
          setComparePagesShowFileBrowser(true);
        }
      } else {
        // Navigate buttons
        if (key.upArrow) {
          setComparePagesFocusArea("fields");
          setComparePagesCurrentField(1); // Go to last field
        } else if (key.leftArrow) {
          setComparePagesSelectedButton("compare");
        } else if (key.rightArrow) {
          setComparePagesSelectedButton("cancel");
        } else if (key.return) {
          if (comparePagesSelectedButton === "compare") {
            void handleComparePages();
          } else {
            handleComparePagesCancel();
          }
        }
      }
      return;
    }

    // COMPARE NAV TAB CONTENT NAVIGATION
    if (currentTab === "compareNav" && inCompareNavContent) {
      // Results mode
      if (navComparisonResult) {
        if (key.upArrow) {
          if (compareNavResultsIndex === 0) {
            setInCompareNavContent(false); // Exit to tab bar
          } else {
            setCompareNavResultsIndex(Math.max(0, compareNavResultsIndex - 1));
          }
          return;
        }
        if (key.downArrow) {
          setCompareNavResultsIndex(Math.min(999, compareNavResultsIndex + 1)); // Large max, VirtualizedList will clamp
          return;
        }
        if (key.return && onPageSelect && compareNavSelectedPage) {
          onPageSelect(compareNavSelectedPage);
          return;
        }
        return;
      }

      // Form mode: Navigate fields
      if (compareNavFocusArea === "fields") {
        if (key.upArrow) {
          if (compareNavCurrentField === 0) {
            setInCompareNavContent(false); // Exit to tab bar
          } else {
            setCompareNavCurrentField(Math.max(0, compareNavCurrentField - 1));
          }
        } else if (key.downArrow) {
          if (compareNavCurrentField < 1) {
            setCompareNavCurrentField(compareNavCurrentField + 1);
          } else {
            setCompareNavFocusArea("buttons");
          }
        } else if (input === " " || key.return) {
          setCompareNavBrowserField(compareNavCurrentField as 0 | 1);
          setCompareNavShowFileBrowser(true);
        }
      } else {
        // Navigate buttons
        if (key.upArrow) {
          setCompareNavFocusArea("fields");
          setCompareNavCurrentField(1); // Go to last field
        } else if (key.leftArrow) {
          setCompareNavSelectedButton("compare");
        } else if (key.rightArrow) {
          setCompareNavSelectedButton("cancel");
        } else if (key.return) {
          if (compareNavSelectedButton === "compare") {
            void handleCompareNav();
          } else {
            handleCompareNavCancel();
          }
        }
      }
      return;
    }

    // ORPHANED TAB CONTENT NAVIGATION
    if (currentTab === "orphaned" && inOrphanedContent) {
      // Results mode
      if (orphanResult) {
        if (key.upArrow) {
          if (orphanedResultsIndex === 0) {
            setInOrphanedContent(false); // Exit to tab bar
          } else {
            setOrphanedResultsIndex(Math.max(0, orphanedResultsIndex - 1));
          }
          return;
        }
        if (key.downArrow) {
          setOrphanedResultsIndex(Math.min(999, orphanedResultsIndex + 1)); // Large max, VirtualizedList will clamp
          return;
        }
        if (key.return && onPageSelect && orphanedSelectedPage) {
          onPageSelect(orphanedSelectedPage);
          return;
        }
        return;
      }

      // Button mode: Just the fetch button
      if (key.upArrow) {
        setInOrphanedContent(false); // Exit to tab bar
      } else if (key.return) {
        void handleFetchOrphans();
      }
      return;
    }
  });
}
