import React, { useRef, useState, useEffect, useMemo } from "react";
import { Box, Text, measureElement, type DOMElement } from "ink";

interface ContentScrollerProps {
  content: string;
  scrollPosition: number;
  maxHeight?: number;
}

export function ContentScroller({
  content,
  scrollPosition,
  maxHeight,
}: ContentScrollerProps) {
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

  const lines = content.split("\n");
  const viewportHeight = maxHeight ?? measuredHeight ?? 10;

  const visibleLines = useMemo(() => {
    const startIndex = scrollPosition;
    const endIndex = Math.min(lines.length, startIndex + viewportHeight);
    return lines.slice(startIndex, Math.min(endIndex, startIndex + viewportHeight));
  }, [lines, scrollPosition, viewportHeight]);

  if (!content) {
    return (
      <Box flexGrow={1} justifyContent="center" alignItems="center">
        <Text color="gray">No content available</Text>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} flexDirection="column" flexGrow={1}>
      {visibleLines.map((line, index) => (
        <Box key={scrollPosition + index} height={1} flexShrink={0}>
          <Text wrap="truncate">{line ?? " "}</Text>
        </Box>
      ))}
    </Box>
  );
}
