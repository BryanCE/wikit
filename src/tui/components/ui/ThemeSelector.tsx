import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { themeNames, themes } from "@/tui/theme";

interface ThemeSelectorProps {
  onSelect: () => void;
  onCancel: () => void;
}

export function ThemeSelector({ onSelect, onCancel }: ThemeSelectorProps) {
  const {
    theme: currentTheme,
    setTheme,
    themeName: currentThemeName,
  } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(
    themeNames.indexOf(currentThemeName)
  );

  // Set header
  useHeaderData({
    title: "Theme Selector",
    metadata: `${themeNames.length} themes available • Current: ${currentTheme.name}`
  });

  // Set footer
  useFooterHelp("↑↓=navigate • Enter=select • Esc=cancel");

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(themeNames.length - 1, prev + 1));
    } else if (key.return) {
      const selectedTheme = themeNames[selectedIndex];
      if (selectedTheme) {
        setTheme(selectedTheme);
        onSelect();
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" marginBottom={1}>
        {themeNames.map((themeName, index) => {
          const theme = themes[themeName];
          const isSelected = index === selectedIndex;
          const isCurrent = themeName === currentThemeName;

          return (
            <Box key={themeName}>
              <Text
                color={
                  isSelected
                    ? currentTheme.colors.accent
                    : isCurrent
                    ? currentTheme.colors.success
                    : currentTheme.colors.text
                }
                bold={isSelected || isCurrent}
              >
                {isSelected ? "▶ " : "  "}
                {theme.name}
                {isCurrent && (
                  <Text color={currentTheme.colors.success}> (active)</Text>
                )}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
