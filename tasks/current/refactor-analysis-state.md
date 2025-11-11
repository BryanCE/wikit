# Refactor AnalysisInterface State Management

## Problem
AnalysisInterface is controlled component with state in AppContent (wrong pattern).
All other interfaces (PagesInterface, UsersInterface, etc.) manage their own state.

## Goal
Move analysis state into AnalysisInterface. AppContent only knows `currentAnalysisTab`.

## Tasks

### 1. Update AnalysisInterface to own its state
- [x] Move `analysisResult` state from AppContent to AnalysisInterface
- [x] Move `pagesComparisonResult` state from AppContent to AnalysisInterface
- [x] Move `navComparisonResult` state from AppContent to AnalysisInterface
- [x] Move `orphanResult` state from AppContent to AnalysisInterface
- [x] Update AnalysisInterface props to remove: `analysisResult`, `pagesComparisonResult`, `navComparisonResult`, `orphanResult`
- [x] Update AnalysisInterface props to remove callbacks: `onAnalysisComplete`, `onPagesComparisonComplete`, `onNavComparisonComplete`, `onOrphanComplete`
- [x] Keep only: `instance`, `currentTab`, `onTabChange`, `onPageSelect`, `onStatusChange`, `onEsc`

### 2. Update AppContent.tsx
- [x] Remove: `analysisResult`, `setAnalysisResult`
- [x] Remove: `pagesComparisonResult`, `setPagesComparisonResult`
- [x] Remove: `navComparisonResult`, `setNavComparisonResult`
- [x] Remove: `orphanResult`, `setOrphanResult`
- [x] Keep only: `currentAnalysisTab`, `setCurrentAnalysisTab`
- [x] Remove state clearing in handleEscape (no longer needed)
- [x] Update ModeRenderer call to remove analysis result props

### 3. Update ModeRenderer.tsx
- [x] Remove from ModeRendererProps: `analysisResult`, `pagesComparisonResult`, `navComparisonResult`, `orphanResult`
- [x] Remove from destructuring in function signature
- [x] Remove from AnalysisInterface render call
- [x] Keep only: `currentAnalysisTab` in props
- [x] Keep only: `instance`, `currentTab`, `onTabChange`, `onPageSelect`, `onStatusChange`, `onEsc` passed to AnalysisInterface

### 4. Update type imports
- [x] AppContent: Remove `AnalysisResult`, `ExportDiffResult`, `OrphanAnalysisResult` imports if not used elsewhere
- [x] ModeRenderer: Remove unused type imports

### 5. Test
- [ ] Analyze exports → view results → works
- [ ] Compare pages → view results → works
- [ ] Compare nav → view results → works
- [ ] Orphaned pages → fetch → click page → view details → escape back → still on orphaned tab (RESULTS WILL BE GONE - acceptable)
- [ ] Switch between tabs → works
- [ ] Escape from exports mode → returns to command

**Note: Testing is the user's responsibility. Implementation is complete.**

## Note
Results will NOT persist when opening page details (AnalysisInterface unmounts).
This is acceptable - user can re-fetch. Matches behavior of other interfaces.
