import React, { createContext, useContext, useCallback, useRef, useEffect } from "react";
import { useInput } from "ink";

interface EscapeHandler {
  id: string;
  handler: () => void;
}

interface EscapeContextType {
  pushHandler: (id: string, handler: () => void) => () => void;
  useEscape: (id: string, handler: () => void) => () => void;
}

const EscapeContext = createContext<EscapeContextType | null>(null);

export function EscapeProvider({ children }: { children: React.ReactNode }) {
  const handlersRef = useRef<EscapeHandler[]>([]);

  const pushHandler = useCallback((id: string, handler: () => void) => {
    const escapeHandler: EscapeHandler = { id, handler };
    handlersRef.current.push(escapeHandler);

    // Return cleanup function
    return () => {
      const index = handlersRef.current.findIndex(h => h === escapeHandler);
      if (index > -1) {
        handlersRef.current.splice(index, 1);
      }
    };
  }, []);

  const useEscapeHook = useCallback((id: string, handler: () => void) => {
    return handler;
  }, []);

  // Global escape key listener
  useInput((input, key) => {
    if (key.escape) {
      const handlers = handlersRef.current;
      if (handlers.length > 0) {
        // Call the most recently added handler (top of stack)
        const topHandler = handlers[handlers.length - 1];
        if (topHandler) {
          topHandler.handler();
        }
      }
    }
  });

  const contextValue: EscapeContextType = {
    pushHandler,
    useEscape: useEscapeHook,
  };

  return (
    <EscapeContext.Provider value={contextValue}>
      {children}
    </EscapeContext.Provider>
  );
}

export function useEscape(id: string, handler: () => void): () => void {
  const context = useContext(EscapeContext);
  if (!context) {
    throw new Error("useEscape must be used within an EscapeProvider");
  }

  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cleanupRef.current = context.pushHandler(id, handler);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [context, id, handler]);

  return handler;
}