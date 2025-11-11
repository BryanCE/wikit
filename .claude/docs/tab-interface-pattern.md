# Tab Interface Pattern

Tab interfaces (PagesInterface, UsersInterface, NavDeleteModal, AnalysisInterface) use centralized state management in the parent component.

## Core Rules

1. **Parent owns ALL state** - tabs have zero internal state (no useState)
2. **NO useInput/useEscape in tabs** - parent's keyboard hook handles everything
3. **Tabs are purely presentational** - render props only, no state/navigation
4. **Pass setters directly** - no wrapper callbacks like onComplete
5. **Results views just render** - parent's keyboard hook handles scrolling

## Pattern

```typescript
export function XxxInterface({ onEsc }: Props) {
  // Parent owns ALL state from all tabs
  const [currentTab, setCurrentTab] = useState<"tab1" | "tab2">("tab1");
  const [inTab1Content, setInTab1Content] = useState(false);
  const [tab1Data, setTab1Data] = useState(null);
  const [resultsData, setResultsData] = useState(null);

  useEscape("xxx", () => {
    if (resultsData) setResultsData(null);
    else if (inTab1Content) setInTab1Content(false);
    else onEsc?.();
  });

  // Keyboard hook receives ALL state/setters
  useXxxKeyboard({ currentTab, setCurrentTab, inTab1Content, setInTab1Content, /* ... */ });

  return (
    <Box>
      {currentTab === "tab1" && (resultsData ? <ResultsView data={resultsData} /> : <Tab1 {...allStateAsProps} />)}
    </Box>
  );
}
```

## Anti-Patterns

```typescript
// ❌ Tab has internal state
export function Tab1() {
  const [result, setResult] = useState(null); // NO!
}

// ❌ Tab has useInput/useEscape
export function Tab1() {
  useInput((input, key) => { /* NO! */ });
}

// ❌ Results view has navigation
export function ResultsView({ result, onClose }) {
  useInput((input, key) => { /* NO! */ });
}

// ❌ Using callbacks instead of direct setters
<Tab1 onComplete={setResult} /> // NO! Pass setResult directly
```

## Rendering Approaches

**Approach 1: Parent conditionally renders**
```typescript
{currentTab === "analyze" && (analyzeResult ? <ResultsView result={analyzeResult} /> : <AnalyzeTab {...props} />)}
```

**Approach 2: Tab conditionally renders**
```typescript
// Parent passes ALL state
<AnalyzeTab analysisResult={analysisResult} showFileBrowser={showFileBrowser} {...allStateAsProps} />

// Tab decides what to render
export function AnalyzeTab({ showFileBrowser, analysisResult, ...props }: Props) {
  if (showFileBrowser) return <FileBrowserModal />;
  if (analysisResult) return <ResultsView result={analysisResult} />;
  return <Form {...props} />;
}
```

Choose based on preference: Approach 1 = clearer flow, Approach 2 = cleaner parent.

## Examples

- **PagesInterface**: Parent owns state for "pages" and "export" tabs, `usePagesKeyboard` handles navigation
- **AnalysisInterface**: Parent owns state for "analyze" and "compare" tabs with results, `useAnalysisKeyboard` handles all navigation
