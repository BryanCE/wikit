import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, type ReactNode } from "react";

interface HelpTextStackItem {
  id: symbol;
  text: string | null;
}

interface StatusMessageStackItem {
  id: symbol;
  message: string;
}

interface FooterContextType {
  helpText: string | null;
  statusMessage: string;
  pushHelpText: (text: string | null) => { id: symbol; cleanup: () => void };
  updateHelpText: (id: symbol, text: string | null) => void;
  pushStatusMessage: (message: string) => { id: symbol; cleanup: () => void };
  updateStatusMessage: (id: symbol, message: string) => void;
  setStatusMessage: (message: string) => void;
}

const FooterContext = createContext<FooterContextType | null>(null);

export function FooterProvider({ children }: { children: ReactNode }) {
  const helpTextStackRef = useRef<HelpTextStackItem[]>([]);
  const statusMessageStackRef = useRef<StatusMessageStackItem[]>([]);
  const [helpText, setHelpText] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const pushHelpText = useCallback((text: string | null) => {
    const item: HelpTextStackItem = { id: Symbol(), text };
    helpTextStackRef.current.push(item);

    // Update displayed help text to top of stack
    setHelpText(text);

    // Return ID and cleanup function
    const cleanup = () => {
      const index = helpTextStackRef.current.findIndex(h => h.id === item.id);
      if (index > -1) {
        helpTextStackRef.current.splice(index, 1);
        // Update to new top of stack (or null if stack is empty)
        const newTop = helpTextStackRef.current[helpTextStackRef.current.length - 1];
        setHelpText(newTop?.text ?? null);
      }
    };

    return { id: item.id, cleanup };
  }, []);

  const updateHelpText = useCallback((id: symbol, text: string | null) => {
    const item = helpTextStackRef.current.find(h => h.id === id);
    if (item) {
      item.text = text;
      // Only update display if this is the top of stack
      const topItem = helpTextStackRef.current[helpTextStackRef.current.length - 1];
      if (topItem?.id === id) {
        setHelpText(text);
      }
    }
  }, []);

  const pushStatusMessage = useCallback((message: string) => {
    const item: StatusMessageStackItem = { id: Symbol(), message };

    // Only push if message has content
    if (message) {
      statusMessageStackRef.current.push(item);
      setStatusMessage(message);
    }

    // Return ID and cleanup function
    const cleanup = () => {
      const index = statusMessageStackRef.current.findIndex(h => h.id === item.id);
      if (index > -1) {
        statusMessageStackRef.current.splice(index, 1);
        // Update to new top of stack (or empty if stack is empty)
        const newTop = statusMessageStackRef.current[statusMessageStackRef.current.length - 1];
        setStatusMessage(newTop?.message ?? "");
      }
    };

    return { id: item.id, cleanup };
  }, []);

  const updateStatusMessage = useCallback((id: symbol, message: string) => {
    const index = statusMessageStackRef.current.findIndex(h => h.id === id);

    if (message) {
      // Has content - add or update in stack
      if (index > -1) {
        // Update existing
        statusMessageStackRef.current[index]!.message = message;
      } else {
        // Add to stack (wasn't there before because it was empty on mount)
        statusMessageStackRef.current.push({ id, message });
      }

      // Update display if on top
      const topItem = statusMessageStackRef.current[statusMessageStackRef.current.length - 1];
      if (topItem?.id === id) {
        setStatusMessage(message);
      }
    } else {
      // Empty - remove from stack if present
      if (index > -1) {
        statusMessageStackRef.current.splice(index, 1);
        // Update display to new top
        const newTop = statusMessageStackRef.current[statusMessageStackRef.current.length - 1];
        setStatusMessage(newTop?.message ?? "");
      }
    }
  }, []);

  // Imperative API for app-level status messages (not tied to component lifecycle)
  const setStatusMessageImperative = useCallback((message: string) => {
    // Clear the stack and set the message directly at app level
    statusMessageStackRef.current = [];
    setStatusMessage(message);
  }, []);

  const value = useMemo(
    () => ({
      helpText,
      statusMessage,
      pushHelpText,
      updateHelpText,
      pushStatusMessage,
      updateStatusMessage,
      setStatusMessage: setStatusMessageImperative
    }),
    [helpText, statusMessage, pushHelpText, updateHelpText, pushStatusMessage, updateStatusMessage, setStatusMessageImperative]
  );

  return (
    <FooterContext.Provider value={value}>
      {children}
    </FooterContext.Provider>
  );
}

function useFooterContext() {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error("useFooter must be used within FooterProvider");
  }
  return context;
}

/**
 * Hook to get current footer data and imperative status setter
 */
export function useFooter() {
  const { helpText, statusMessage, setStatusMessage } = useFooterContext();
  return { helpText, statusMessage, setStatusMessage };
}

/**
 * Hook to set footer help text during component render.
 * Uses a stack - when component unmounts, previous help text is restored.
 *
 * @param helpText - The help text to display in the footer
 *
 * @example
 * function MyComponent() {
 *   const [mode, setMode] = useState('list');
 *   useFooterHelp(mode === 'list' ? '↑↓=navigate' : '→=next');
 *   return <div>...</div>;
 * }
 */
export function useFooterHelp(helpText: string | null) {
  const { pushHelpText, updateHelpText } = useFooterContext();
  const idRef = useRef<symbol | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Mount: push to stack once
  useEffect(() => {
    const { id, cleanup } = pushHelpText(helpText);
    idRef.current = id;
    cleanupRef.current = cleanup;

    // Unmount: pop from stack
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      idRef.current = null;
    };
  }, [pushHelpText]); // Only on mount/unmount

  // Update: when helpText changes, update value in place
  useEffect(() => {
    if (idRef.current) {
      updateHelpText(idRef.current, helpText);
    }
  }, [helpText, updateHelpText]);
}

/**
 * Hook to set footer status message.
 * Uses a stack - when component unmounts, previous status message is restored.
 *
 * @param message - The status message to display in the footer
 */
export function useFooterStatus(message: string) {
  const { pushStatusMessage, updateStatusMessage } = useFooterContext();
  const idRef = useRef<symbol | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Mount: push to stack once
  useEffect(() => {
    const { id, cleanup } = pushStatusMessage(message);
    idRef.current = id;
    cleanupRef.current = cleanup;

    // Unmount: pop from stack
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      idRef.current = null;
    };
  }, [pushStatusMessage]); // Only on mount/unmount

  // Update: when message changes, update value in place
  useEffect(() => {
    if (idRef.current) {
      updateStatusMessage(idRef.current, message);
    }
  }, [message, updateStatusMessage]);
}
