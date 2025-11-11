import { useMemo } from "react";

/**
 * Generic search hook that filters items by query across multiple fields
 * @param items - Array of items to search
 * @param query - Search query string
 * @param searchFields - Fields to search (in priority order)
 * @returns Filtered items matching the query
 */
export function useSearch<T>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] {
  return useMemo(() => {
    if (!query.trim()) {
      return items;
    }

    const normalizedQuery = query.toLowerCase().trim();

    return items.filter((item) => {
      // Search across all specified fields
      for (const field of searchFields) {
        const value = item[field];

        if (value === null || value === undefined) {
          continue;
        }

        // Convert to string and normalize
        const stringValue = String(value).toLowerCase();

        // Check if field contains the query
        if (stringValue.includes(normalizedQuery)) {
          return true;
        }
      }

      return false;
    });
  }, [items, query, searchFields]);
}

/**
 * Search state manager for inline search functionality
 */
export function useSearchState() {
  return {
    // Search state would be managed by the component
    // This is a utility hook for filtering logic
  };
}
