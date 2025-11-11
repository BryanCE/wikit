export type HelpTab = "commands" | "navigation" | "ui";

export interface CommandInfo {
  command: string;
  description: string;
  details: string;
  examples: string[];
  category: string;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
}

export interface UIComponent {
  name: string;
  description: string;
  whereAppears: string;
  relatedShortcuts?: string[];
}

export interface HelpKeyboardHookProps {
  currentTab: HelpTab;
  setCurrentTab: (tab: HelpTab) => void;
  inCommandsContent: boolean;
  setInCommandsContent: (value: boolean) => void;
  inNavigationContent: boolean;
  setInNavigationContent: (value: boolean) => void;
  inUIComponentsContent: boolean;
  setInUIComponentsContent: (value: boolean) => void;
  commandSelectedIndex: number;
  setCommandSelectedIndex: (value: number) => void;
  navigationSelectedIndex: number;
  setNavigationSelectedIndex: (value: number) => void;
  uiComponentsSelectedIndex: number;
  setUIComponentsSelectedIndex: (value: number) => void;
  commandsCount: number;
  navigationCount: number;
  uiComponentsCount: number;
  onClose: () => void;
}
