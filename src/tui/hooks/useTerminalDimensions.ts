import { useState, useEffect } from "react";
import { useStdout } from "ink";

export interface TerminalDimensions {
  width: number;
  height: number;
}

/**
 * Hook to track terminal dimensions and automatically update when the terminal is resized
 *
 * @returns Current terminal dimensions { width, height }
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { width, height } = useTerminalDimensions();
 *   return <Box width={width} height={height}>Content</Box>;
 * }
 * ```
 */
export function useTerminalDimensions(): TerminalDimensions {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState<TerminalDimensions>({
    width: stdout.columns ?? 80,
    height: stdout.rows ?? 24,
  });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: stdout.columns ?? 80,
        height: stdout.rows ?? 24,
      });
    };

    stdout.on("resize", updateDimensions);
    return () => {
      stdout.off("resize", updateDimensions);
    };
  }, [stdout]);

  return dimensions;
}
