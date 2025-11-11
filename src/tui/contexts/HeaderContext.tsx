import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, type ReactNode } from "react";
import type { HeaderData } from "@/types";

interface HeaderStackItem {
  id: symbol;
  data: HeaderData;
}

interface HeaderContextType {
  headerData: HeaderData;
  pushHeaderData: (data: HeaderData) => () => void;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const stackRef = useRef<HeaderStackItem[]>([]);
  const [headerData, setHeaderData] = useState<HeaderData>({});

  const pushHeaderData = useCallback((data: HeaderData) => {
    const item: HeaderStackItem = { id: Symbol(), data };
    stackRef.current.push(item);

    // Update displayed header to top of stack
    setHeaderData(data);

    // Return cleanup function
    return () => {
      const index = stackRef.current.findIndex(h => h.id === item.id);
      if (index > -1) {
        stackRef.current.splice(index, 1);
        // Update to new top of stack (or empty if stack is empty)
        const newTop = stackRef.current[stackRef.current.length - 1];
        setHeaderData(newTop?.data ?? {});
      }
    };
  }, []);

  const value = useMemo(
    () => ({ headerData, pushHeaderData }),
    [headerData, pushHeaderData]
  );

  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
}

function useHeaderContext() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within HeaderProvider");
  }
  return context;
}

/**
 * Hook to get current header data (read-only access)
 */
export function useHeader() {
  const { headerData } = useHeaderContext();
  return headerData;
}

/**
 * Hook to set header data during component render.
 * Uses a stack - when component unmounts, previous header is restored.
 *
 * @param data - Object with title and/or metadata
 *
 * @example
 * function MyComponent() {
 *   useHeaderData({ title: "Home", metadata: "Type /help for commands" });
 *   return <div>...</div>;
 * }
 */
export function useHeaderData(data: HeaderData) {
  const { pushHeaderData } = useHeaderContext();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cleanupRef.current = pushHeaderData(data);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [data.title, data.metadata, pushHeaderData]);
}
