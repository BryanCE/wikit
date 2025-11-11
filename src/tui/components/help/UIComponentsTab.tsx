import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { VirtualizedList } from "@comps/ui/VirtualizedList";
import type { UIComponent } from "./types";

interface UIComponentsTabProps {
  components: UIComponent[];
  selectedIndex: number;
  inContent: boolean;
}

export function UIComponentsTab({
  components,
  selectedIndex,
  inContent,
}: UIComponentsTabProps) {
  const { theme } = useTheme();
  const selectedComponent = components[selectedIndex];

  return (
    <Box flexDirection="row" gap={2} flexGrow={1}>
      {/* Left panel: Component list */}
      <Box
        flexDirection="column"
        width="30%"
        borderStyle="single"
        borderColor={inContent ? theme.colors.warning : theme.colors.muted}
        padding={1}
      >
        <Box paddingBottom={1}>
          <Text
            color={inContent ? theme.colors.warning : theme.colors.muted}
            bold
          >
            UI Components
          </Text>
        </Box>
        <VirtualizedList
          items={components}
          selectedIndex={selectedIndex}
          itemHeight={1}
          renderItem={(component, index, isHighlighted) => {
            const prefix = isHighlighted && inContent ? " ► " : "   ";
            const textColor = !inContent
              ? theme.colors.muted
              : isHighlighted
              ? theme.colors.background
              : theme.colors.text;

            return (
              <Text
                color={textColor}
                bold={isHighlighted && inContent}
                backgroundColor={
                  isHighlighted && inContent
                    ? theme.colors.primary
                    : undefined
                }
              >
                {prefix}
                {component.name}
              </Text>
            );
          }}
          getItemKey={(component) => component.name}
        />
      </Box>

      {/* Right panel: Component details */}
      <Box
        flexDirection="column"
        width="70%"
        borderStyle="single"
        borderColor={inContent ? theme.colors.accent : theme.colors.muted}
        padding={1}
      >
        {selectedComponent && (
          <Box flexDirection="column">
            <Box paddingBottom={1}>
              <Text
                color={inContent ? theme.colors.accent : theme.colors.muted}
                bold
              >
                {selectedComponent.name}
              </Text>
            </Box>

            <Box flexDirection="column" paddingBottom={1}>
              <Text
                color={inContent ? theme.colors.secondary : theme.colors.muted}
                bold
              >
                Description:
              </Text>
              <Box paddingLeft={2}>
                <Text
                  color={inContent ? theme.colors.text : theme.colors.muted}
                >
                  {selectedComponent.description}
                </Text>
              </Box>
            </Box>

            <Box flexDirection="column" paddingBottom={1}>
              <Text
                color={inContent ? theme.colors.warning : theme.colors.muted}
                bold
              >
                Where it appears:
              </Text>
              <Box paddingLeft={2}>
                <Text
                  color={inContent ? theme.colors.text : theme.colors.muted}
                >
                  {selectedComponent.whereAppears}
                </Text>
              </Box>
            </Box>

            {selectedComponent.relatedShortcuts &&
              selectedComponent.relatedShortcuts.length > 0 && (
                <Box flexDirection="column">
                  <Text
                    color={
                      inContent ? theme.colors.success : theme.colors.muted
                    }
                    bold
                  >
                    Related shortcuts:
                  </Text>
                  {selectedComponent.relatedShortcuts.map((shortcut, i) => (
                    <Box key={i} paddingLeft={2}>
                      <Text
                        color={
                          inContent ? theme.colors.accent : theme.colors.muted
                        }
                      >
                        {shortcut}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
