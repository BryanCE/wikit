import React, { useState } from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { AnalyzeTab } from "./AnalyzeTab";
import { ComparePagesTab } from "./ComparePagesTab";
import { CompareNavTab } from "./CompareNavTab";
import { OrphanedTab } from "./OrphanedTab";
import { useAnalysisKeyboard } from "./hooks/useAnalysisKeyboard";
import { PageDetails } from "@/tui/components/interfaces/pages/PageDetailsInterface/PageDetails";
import type {
  AnalysisResult,
  ExportDiffResult,
  OrphanAnalysisResult,
  Page,
} from "@/types";

export type AnalysisTab =
  | "analyze"
  | "comparePages"
  | "compareNav"
  | "orphaned";

interface AnalysisInterfaceProps {
  onEsc?: () => void;
}

export function AnalysisInterface({
  onEsc,
}: AnalysisInterfaceProps) {
  const { theme } = useTheme();
  const [statusMsg, setStatusMsg] = useState("");

  // Tab state (owned by this component)
  const [currentTab, setCurrentTab] = useState<AnalysisTab>("analyze");

  // Page details state (owned by this component)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  // Analysis results state (owned by this component)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [pagesComparisonResult, setPagesComparisonResult] =
    useState<ExportDiffResult | null>(null);
  const [navComparisonResult, setNavComparisonResult] =
    useState<ExportDiffResult | null>(null);
  const [orphanResult, setOrphanResult] = useState<OrphanAnalysisResult | null>(
    null
  );

  // Mode flags for content areas (like PagesInterface)
  const [inAnalyzeContent, setInAnalyzeContent] = useState(false);
  const [inComparePagesContent, setInComparePagesContent] = useState(false);
  const [inCompareNavContent, setInCompareNavContent] = useState(false);
  const [inOrphanedContent, setInOrphanedContent] = useState(false);

  // ALL state for Analyze tab (moved from AnalyzeTab)
  const [analyzePagesPath, setAnalyzePagesPath] = useState("");
  const [analyzeNavPath, setAnalyzeNavPath] = useState("");
  const [analyzeCurrentField, setAnalyzeCurrentField] = useState(0);
  const [analyzeFocusArea, setAnalyzeFocusArea] = useState<
    "fields" | "buttons"
  >("fields");
  const [analyzeSelectedButton, setAnalyzeSelectedButton] = useState<
    "analyze" | "cancel"
  >("analyze");
  const [analyzeShowFileBrowser, setAnalyzeShowFileBrowser] = useState(false);
  const [analyzeBrowserField, setAnalyzeBrowserField] = useState<0 | 1>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeResultsIndex, setAnalyzeResultsIndex] = useState(0);
  const [analyzeSelectedPage, setAnalyzeSelectedPage] = useState<
    Page | undefined
  >(undefined);

  // ALL state for Compare Pages tab
  const [comparePagesOldPath, setComparePagesOldPath] = useState("");
  const [comparePagesNewPath, setComparePagesNewPath] = useState("");
  const [comparePagesCurrentField, setComparePagesCurrentField] = useState(0);
  const [comparePagesFocusArea, setComparePagesFocusArea] = useState<
    "fields" | "buttons"
  >("fields");
  const [comparePagesSelectedButton, setComparePagesSelectedButton] = useState<
    "compare" | "cancel"
  >("compare");
  const [comparePagesShowFileBrowser, setComparePagesShowFileBrowser] =
    useState(false);
  const [comparePagesBrowserField, setComparePagesBrowserField] = useState<
    0 | 1
  >(0);
  const [isComparingPages, setIsComparingPages] = useState(false);
  const [comparePagesError, setComparePagesError] = useState<string | null>(
    null
  );
  const [comparePagesResultsIndex, setComparePagesResultsIndex] = useState(0);
  const [comparePagesSelectedPage, setComparePagesSelectedPage] = useState<
    Page | undefined
  >(undefined);

  // ALL state for Compare Nav tab
  const [compareNavOldPath, setCompareNavOldPath] = useState("");
  const [compareNavNewPath, setCompareNavNewPath] = useState("");
  const [compareNavCurrentField, setCompareNavCurrentField] = useState(0);
  const [compareNavFocusArea, setCompareNavFocusArea] = useState<
    "fields" | "buttons"
  >("fields");
  const [compareNavSelectedButton, setCompareNavSelectedButton] = useState<
    "compare" | "cancel"
  >("compare");
  const [compareNavShowFileBrowser, setCompareNavShowFileBrowser] =
    useState(false);
  const [compareNavBrowserField, setCompareNavBrowserField] = useState<0 | 1>(
    0
  );
  const [isComparingNav, setIsComparingNav] = useState(false);
  const [compareNavError, setCompareNavError] = useState<string | null>(null);
  const [compareNavResultsIndex, setCompareNavResultsIndex] = useState(0);
  const [compareNavSelectedPage, setCompareNavSelectedPage] = useState<
    Page | undefined
  >(undefined);

  // ALL state for Orphaned tab
  const [orphanedFocusArea, setOrphanedFocusArea] = useState<
    "button" | "results"
  >("button");
  const [isFetchingOrphans, setIsFetchingOrphans] = useState(false);
  const [orphanedError, setOrphanedError] = useState<string | null>(null);
  const [orphanedResultsIndex, setOrphanedResultsIndex] = useState(0);
  const [orphanedSelectedPage, setOrphanedSelectedPage] = useState<
    Page | undefined
  >(undefined);

  useFooterStatus(statusMsg);
  useHeaderData({
    title: "Export Analysis",
    metadata: "Analyze & Compare Wiki.js Exports",
  });

  // Footer help text
  useFooterHelp(
    "Tab/←→ switch tabs • 1-2-3-4 quick jump • ↓ enter content • Esc back"
  );

  // ONE escape handler for ALL states (following PagesInterface pattern)
  useEscape("exports", () => {
    // Check for page details modal first (highest priority)
    if (selectedPage) {
      setSelectedPage(null);
      return;
    }

    // Check for file browser (second highest priority)
    if (analyzeShowFileBrowser) {
      setAnalyzeShowFileBrowser(false);
      return;
    }
    if (comparePagesShowFileBrowser) {
      setComparePagesShowFileBrowser(false);
      return;
    }
    if (compareNavShowFileBrowser) {
      setCompareNavShowFileBrowser(false);
      return;
    }

    if (currentTab === "analyze") {
      // Handle different modes within analyze tab
      if (analysisResult && inAnalyzeContent) {
        // First escape: exit content mode to tab bar
        setInAnalyzeContent(false);
      } else if (analysisResult) {
        // Second escape: clear results, back to form
        setAnalysisResult(null);
      } else if (inAnalyzeContent) {
        // No results: just exit content mode
        setInAnalyzeContent(false);
      } else {
        // Exit interface
        onEsc?.();
      }
    } else if (currentTab === "comparePages") {
      // Handle different modes within comparePages tab
      if (pagesComparisonResult && inComparePagesContent) {
        // First escape: exit content mode to tab bar
        setInComparePagesContent(false);
      } else if (pagesComparisonResult) {
        // Second escape: clear results, back to form
        setPagesComparisonResult(null);
      } else if (inComparePagesContent) {
        // No results: just exit content mode
        setInComparePagesContent(false);
      } else {
        // Exit interface
        onEsc?.();
      }
    } else if (currentTab === "compareNav") {
      // Handle different modes within compareNav tab
      if (navComparisonResult && inCompareNavContent) {
        // First escape: exit content mode to tab bar
        setInCompareNavContent(false);
      } else if (navComparisonResult) {
        // Second escape: clear results, back to form
        setNavComparisonResult(null);
      } else if (inCompareNavContent) {
        // No results: just exit content mode
        setInCompareNavContent(false);
      } else {
        // Exit interface
        onEsc?.();
      }
    } else if (currentTab === "orphaned") {
      // Handle different modes within orphaned tab
      if (orphanResult && inOrphanedContent) {
        // First escape: exit content mode to tab bar
        setInOrphanedContent(false);
      } else if (orphanResult) {
        // Second escape: clear results, back to form
        setOrphanResult(null);
      } else if (inOrphanedContent) {
        // No results: just exit content mode
        setInOrphanedContent(false);
      } else {
        // Exit interface
        onEsc?.();
      }
    } else {
      // Fallback: exit interface
      onEsc?.();
    }
  });

  // Keyboard navigation hook - passes ALL state/setters (like usePagesKeyboard)
  useAnalysisKeyboard({
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
    isPageDetailsOpen: !!selectedPage,
    // Analyze tab state
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
    analyzeBrowserField,
    setAnalyzeBrowserField,
    isAnalyzing,
    setIsAnalyzing,
    analyzeError,
    setAnalyzeError,
    analyzeResultsIndex,
    setAnalyzeResultsIndex,
    analyzeSelectedPage,
    setAnalyzeSelectedPage,
    analysisResult,
    onAnalysisComplete: setAnalysisResult,
    // Compare Pages tab state
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
    comparePagesBrowserField,
    setComparePagesBrowserField,
    isComparingPages,
    setIsComparingPages,
    comparePagesError,
    setComparePagesError,
    comparePagesResultsIndex,
    setComparePagesResultsIndex,
    comparePagesSelectedPage,
    setComparePagesSelectedPage,
    pagesComparisonResult,
    onPagesComparisonComplete: setPagesComparisonResult,
    // Compare Nav tab state
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
    compareNavBrowserField,
    setCompareNavBrowserField,
    isComparingNav,
    setIsComparingNav,
    compareNavError,
    setCompareNavError,
    compareNavResultsIndex,
    setCompareNavResultsIndex,
    compareNavSelectedPage,
    setCompareNavSelectedPage,
    navComparisonResult,
    onNavComparisonComplete: setNavComparisonResult,
    // Orphaned tab state
    orphanedFocusArea,
    setOrphanedFocusArea,
    isFetchingOrphans,
    setIsFetchingOrphans,
    orphanedError,
    setOrphanedError,
    orphanedResultsIndex,
    setOrphanedResultsIndex,
    orphanedSelectedPage,
    setOrphanedSelectedPage,
    orphanResult,
    onOrphanComplete: setOrphanResult,
    // Shared callbacks
    onPageSelect: setSelectedPage,
  });

  // If viewing page details, render ONLY the modal (component stays mounted, preserves state)
  if (selectedPage) {
    return (
      <PageDetails
        page={selectedPage}
        onClose={() => setSelectedPage(null)}
        onSetStatus={(message, duration) => {
          setStatusMsg(message);
          if (duration) {
            setTimeout(() => setStatusMsg(""), duration);
          }
        }}
      />
    );
  }

  // Otherwise render the analysis tabs
  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Tab Navigation */}
      <Box
        paddingX={1}
        borderStyle="single"
        borderColor={
          currentTab === "analyze"
            ? theme.colors.primary
            : currentTab === "comparePages"
            ? theme.colors.success
            : currentTab === "compareNav"
            ? theme.colors.info
            : theme.colors.accent
        }
        flexShrink={0}
      >
        <Text
          color={
            currentTab === "analyze"
              ? theme.colors.background
              : theme.colors.primary
          }
          backgroundColor={
            currentTab === "analyze" ? theme.colors.primary : undefined
          }
          bold={currentTab === "analyze"}
        >
          1. Analyze Export
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "comparePages"
              ? theme.colors.background
              : theme.colors.success
          }
          backgroundColor={
            currentTab === "comparePages" ? theme.colors.success : undefined
          }
          bold={currentTab === "comparePages"}
        >
          2. Compare Pages
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "compareNav"
              ? theme.colors.background
              : theme.colors.info
          }
          backgroundColor={
            currentTab === "compareNav" ? theme.colors.info : undefined
          }
          bold={currentTab === "compareNav"}
        >
          3. Compare Nav
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "orphaned"
              ? theme.colors.background
              : theme.colors.accent
          }
          backgroundColor={
            currentTab === "orphaned" ? theme.colors.accent : undefined
          }
          bold={currentTab === "orphaned"}
        >
          4. Orphaned Pages
        </Text>
      </Box>

      {/* Tab Content */}
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        {currentTab === "analyze" && (
          <AnalyzeTab
            inContent={inAnalyzeContent}
            pagesExportPath={analyzePagesPath}
            navExportPath={analyzeNavPath}
            currentField={analyzeCurrentField}
            focusArea={analyzeFocusArea}
            selectedButton={analyzeSelectedButton}
            showFileBrowser={analyzeShowFileBrowser}
            browserField={analyzeBrowserField}
            isAnalyzing={isAnalyzing}
            error={analyzeError}
            analysisResult={analysisResult}
            resultsSelectedIndex={analyzeResultsIndex}
            selectedPage={analyzeSelectedPage}
            setPagesExportPath={setAnalyzePagesPath}
            setNavExportPath={setAnalyzeNavPath}
            setBrowserField={setAnalyzeBrowserField}
            setShowFileBrowser={setAnalyzeShowFileBrowser}
            setSelectedPage={setAnalyzeSelectedPage}
            onPageSelect={setSelectedPage}
          />
        )}

        {currentTab === "comparePages" && (
          <ComparePagesTab
            inContent={inComparePagesContent}
            oldPagesPath={comparePagesOldPath}
            newPagesPath={comparePagesNewPath}
            currentField={comparePagesCurrentField}
            focusArea={comparePagesFocusArea}
            selectedButton={comparePagesSelectedButton}
            showFileBrowser={comparePagesShowFileBrowser}
            browserField={comparePagesBrowserField}
            isComparing={isComparingPages}
            error={comparePagesError}
            comparisonResult={pagesComparisonResult}
            resultsSelectedIndex={comparePagesResultsIndex}
            selectedPage={comparePagesSelectedPage}
            setOldPagesPath={setComparePagesOldPath}
            setNewPagesPath={setComparePagesNewPath}
            setBrowserField={setComparePagesBrowserField}
            setShowFileBrowser={setComparePagesShowFileBrowser}
            setSelectedPage={setComparePagesSelectedPage}
            onPageSelect={setSelectedPage}
          />
        )}

        {currentTab === "compareNav" && (
          <CompareNavTab
            inContent={inCompareNavContent}
            oldNavPath={compareNavOldPath}
            newNavPath={compareNavNewPath}
            currentField={compareNavCurrentField}
            focusArea={compareNavFocusArea}
            selectedButton={compareNavSelectedButton}
            showFileBrowser={compareNavShowFileBrowser}
            browserField={compareNavBrowserField}
            isComparing={isComparingNav}
            error={compareNavError}
            comparisonResult={navComparisonResult}
            resultsSelectedIndex={compareNavResultsIndex}
            selectedPage={compareNavSelectedPage}
            setOldNavPath={setCompareNavOldPath}
            setNewNavPath={setCompareNavNewPath}
            setBrowserField={setCompareNavBrowserField}
            setShowFileBrowser={setCompareNavShowFileBrowser}
            setSelectedPage={setCompareNavSelectedPage}
            onPageSelect={setSelectedPage}
          />
        )}

        {currentTab === "orphaned" && (
          <OrphanedTab
            inContent={inOrphanedContent}
            focusArea={orphanedFocusArea}
            isFetching={isFetchingOrphans}
            error={orphanedError}
            orphanResult={orphanResult}
            resultsSelectedIndex={orphanedResultsIndex}
            selectedPage={orphanedSelectedPage}
            setSelectedPage={setOrphanedSelectedPage}
            onPageSelect={setSelectedPage}
          />
        )}
      </Box>
    </Box>
  );
}
