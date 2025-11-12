import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { NavigationConfig } from "@/types";
import { NAVIGATION_MODES } from "@/types";
import { setNavigationMode } from "@/commands/navigation";
import { AsyncActionDialog } from "@comps/modals/AsyncActionDialog";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { InstanceContext } from "@/contexts/InstanceContext";

interface NavModeSelectorProps {
  currentMode: NavigationConfig["mode"];
  onModeChange: () => void;
  onCancel: () => void;
}

export function NavModeSelector({
  currentMode,
  onModeChange,
  onCancel,
}: NavModeSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    NAVIGATION_MODES.findIndex((m) => m.mode === currentMode)
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useFooterHelp("↑↓ navigate • Enter confirm • Esc cancel");

  useInput((input, key) => {
    if (showConfirm) return;

    if (key.escape) {
      onCancel();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) =>
        prev === 0 ? NAVIGATION_MODES.length - 1 : prev - 1
      );
    } else if (key.downArrow) {
      setSelectedIndex((prev) =>
        prev === NAVIGATION_MODES.length - 1 ? 0 : prev + 1
      );
    } else if (key.return) {
      setShowConfirm(true);
    }
  });

  if (showConfirm) {
    const selectedMode = NAVIGATION_MODES[selectedIndex];
    return (
      <AsyncActionDialog
        title="Change Navigation Mode"
        message={`Change navigation mode to ${selectedMode?.mode}? This will be visible on the wiki immediately.`}
        confirmText="Confirm"
        cancelText="Cancel"
        destructive={false}
        loadingMessage="Updating navigation mode..."
        successMessage="Navigation mode updated successfully!"
        onConfirm={async () => {
          if (!selectedMode) throw new Error("No mode selected");
          await setNavigationMode(selectedMode.mode, { instance: InstanceContext.getInstance() });
        }}
        onSuccess={() => {
          setShowConfirm(false);
          onModeChange();
        }}
        onCancel={() => setShowConfirm(false)}
        onError={(err) => setError(err)}
      />
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.secondary}>Current mode: {currentMode}</Text>
      </Box>

      {NAVIGATION_MODES.map((modeInfo, index) => {
        const isSelected = index === selectedIndex;
        const isCurrent = modeInfo.mode === currentMode;

        return (
          <Box
            key={modeInfo.mode}
            backgroundColor={isSelected ? theme.colors.primary : undefined}
            paddingX={1}
            marginBottom={1}
          >
            <Box width={8}>
              <Text
                color={
                  isSelected
                    ? theme.colors.background
                    : isCurrent
                    ? theme.colors.success
                    : theme.colors.text
                }
                bold={isSelected || isCurrent}
              >
                {isSelected ? " ► " : "   "}
                {modeInfo.mode}
              </Text>
            </Box>
            <Text
              color={isSelected ? theme.colors.background : theme.colors.muted}
            >
              {modeInfo.description}
              {isCurrent && " (current)"}
            </Text>
          </Box>
        );
      })}

      {error && (
        <Box marginTop={1}>
          <Text color={theme.colors.error}>[ERROR] {error}</Text>
        </Box>
      )}
    </Box>
  );
}
