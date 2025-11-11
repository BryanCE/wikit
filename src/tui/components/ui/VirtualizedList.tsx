import { Box, measureElement, type DOMElement } from "ink";
import { useMemo, useRef, useState, useEffect } from "react";

interface VirtualizedListProps<T> {
  items: T[];
  selectedIndex: number;
  height?: number;
  itemHeight?: number;
  renderItem: (item: T, index: number, isHighlighted: boolean) => React.ReactElement;
  getItemKey: (item: T, index: number) => string;
}

export function VirtualizedList<T>({
  items,
  selectedIndex,
  height,
  itemHeight = 1,
  renderItem,
  getItemKey,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<DOMElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const { height: h } = measureElement(containerRef.current);
      if (h > 0) {
        setMeasuredHeight(h);
      }
    }
  });

  const { startIndex, visibleItems } = useMemo(() => {
    // Use explicit height prop, or measured height, or fallback to 10
    const listHeight = height ?? measuredHeight ?? 10;

    // Calculate how many items fit in the viewport
    const itemsPerViewport = Math.max(1, Math.floor(listHeight / itemHeight));
    const halfViewport = Math.floor(itemsPerViewport / 2);

    // Clamp selectedIndex to valid range
    const validSelectedIndex = Math.max(-1, Math.min(selectedIndex, items.length - 1));

    // If no selection or all items fit, start at 0
    if (validSelectedIndex < 0 || items.length <= itemsPerViewport) {
      return {
        startIndex: 0,
        endIndex: Math.min(items.length, itemsPerViewport),
        visibleItems: items.slice(0, Math.min(items.length, itemsPerViewport)),
      };
    }

    // Calculate start index to keep selected item centered when possible
    const calculatedStart = Math.max(
      0,
      Math.min(
        validSelectedIndex - halfViewport,
        items.length - itemsPerViewport
      )
    );

    const calculatedEnd = Math.min(items.length, calculatedStart + itemsPerViewport);

    return {
      startIndex: calculatedStart,
      endIndex: calculatedEnd,
      visibleItems: items.slice(calculatedStart, calculatedEnd),
    };
  }, [items, selectedIndex, height, itemHeight, measuredHeight]);

  return (
    <Box ref={containerRef} flexDirection="column" flexGrow={1}>
      {visibleItems.map((item, index) => {
        const actualIndex = startIndex + index;
        const isHighlighted = actualIndex === selectedIndex;
        const key = getItemKey(item, actualIndex);

        return (
          <Box key={key} height={itemHeight} flexShrink={0}>
            {renderItem(item, actualIndex, isHighlighted)}
          </Box>
        );
      })}
    </Box>
  );
}