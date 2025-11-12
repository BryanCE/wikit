import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { compareForTui } from "@/commands/compare";
import type { CompareOptions, CompareResults } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterStatus } from "@/tui/contexts/FooterContext";
import { getAvailableInstances, getInstanceLabels } from "@/config/dynamicConfig";
import { CompareOptions as CompareOptionsComponent } from "./CompareOptions.js";
import { CompareResultsDisplay } from "./CompareResults.js";

interface CompareInterfaceProps {
  onEsc?: () => void;
}

export function CompareInterface({
  onEsc,
}: CompareInterfaceProps) {
  const { theme } = useTheme();
  useHeaderData({ title: "Compare Instances" });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CompareResults | null>(null);
  const [selectedOption, setSelectedOption] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [availableInstances, setAvailableInstances] = useState<string[]>([]);
  const [instanceLabels, setInstanceLabels] = useState<Record<string, string>>({});
  const [fromInstance, setFromInstance] = useState("");
  const [toInstance, setToInstance] = useState("");
  const [selectionMode, setSelectionMode] = useState<"from" | "to" | "options">("from");
  const [selectedInstanceIndex, setSelectedInstanceIndex] = useState(0);
  useFooterStatus(statusMsg);

  useEffect(() => {
    void Promise.all([
      getAvailableInstances(),
      getInstanceLabels()
    ]).then(([instances, labels]) => {
      setAvailableInstances(instances);
      setInstanceLabels(labels);
    });
  }, []);

  const options = [
    {
      key: "all",
      label: "Compare All",
      desc: "All configurations",
    },
    {
      key: "config",
      label: "Site Configuration",
      desc: "Site settings",
    },
    {
      key: "theme",
      label: "Theme Configuration",
      desc: "Theme config",
    },
    {
      key: "localization",
      label: "Localization Configuration",
      desc: "Language config",
    },
    {
      key: "navigation",
      label: "Navigation Configuration",
      desc: "Nav config",
    },
    {
      key: "users",
      label: "User Summary",
      desc: "User info",
    },
    {
      key: "system",
      label: "System Information",
      desc: "System info",
    },
    {
      key: "pages",
      label: "Page Summary",
      desc: "Page stats",
    },
  ];

  // Setup escape handling
  useEscape("compare", () => {
    if (results) {
      // If showing results, go back to options
      setResults(null);
      setSelectedOption(0);
    } else {
      // If on options screen, exit to main menu
      onEsc?.();
    }
  });

  useInput((input, key) => {
    if (isLoading) return;

    // When showing results, allow Space to toggle details
    if (results) {
      if (input === " ") {
        setShowDetails(!showDetails);
      }
      return;
    }

    if (selectionMode === "from") {
      if (key.upArrow) {
        setSelectedInstanceIndex((prev) => (prev > 0 ? prev - 1 : availableInstances.length - 1));
      } else if (key.downArrow) {
        setSelectedInstanceIndex((prev) => (prev < availableInstances.length - 1 ? prev + 1 : 0));
      } else if (key.return) {
        setFromInstance(availableInstances[selectedInstanceIndex] ?? "");
        setSelectionMode("to");
        setSelectedInstanceIndex(0);
      }
    } else if (selectionMode === "to") {
      if (key.upArrow) {
        setSelectedInstanceIndex((prev) => (prev > 0 ? prev - 1 : availableInstances.length - 1));
      } else if (key.downArrow) {
        setSelectedInstanceIndex((prev) => (prev < availableInstances.length - 1 ? prev + 1 : 0));
      } else if (key.return) {
        setToInstance(availableInstances[selectedInstanceIndex] ?? "");
        setSelectionMode("options");
        setSelectedOption(0);
      }
    } else {
      // selectionMode === "options"
      if (key.upArrow) {
        setSelectedOption((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      } else if (key.downArrow) {
        setSelectedOption((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      } else if (key.return) {
        void handleCompare();
      }
    }
  });

  const handleCompare = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setStatusMsg(
      `Comparing ${instanceLabels[fromInstance]} vs ${instanceLabels[toInstance]}...`
    );

    try {
      const option = options[selectedOption];
      if (!option) {
        setStatusMsg("Invalid option selected");
        return;
      }

      const compareOptions: CompareOptions = {
        from: fromInstance,
        to: toInstance,
        [option.key]: true,
        details: showDetails,
      };

      const compareResults = await compareForTui(compareOptions);
      setResults(compareResults);
      setStatusMsg("Comparison complete");
    } catch (error) {
      setStatusMsg(
        `Comparison failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (results) {
    return (
      <CompareResultsDisplay results={results} showDetails={showDetails} />
    );
  }

  if (availableInstances.length < 2) {
    return (
      <Box flexDirection="column">
        <Text color={theme.colors.error} bold>
          Error: Not Enough Instances
        </Text>
        <Text color={theme.colors.text}>
          Compare requires at least 2 configured instances.
        </Text>
        <Text color={theme.colors.muted}>
          Press Esc to return
        </Text>
      </Box>
    );
  }

  if (selectionMode === "from" || selectionMode === "to") {
    return (
      <Box flexDirection="column">
        <Text color={theme.colors.primary} bold>
          Select {selectionMode === "from" ? "Source" : "Target"} Instance
        </Text>
        <Box marginY={1} flexDirection="column">
          {availableInstances.map((inst, index) => (
            <Text
              key={inst}
              color={index === selectedInstanceIndex ? theme.colors.background : theme.colors.text}
              backgroundColor={index === selectedInstanceIndex ? theme.colors.primary : undefined}
            >
              {index === selectedInstanceIndex ? " ► " : "   "}
              {instanceLabels[inst] ?? inst}
            </Text>
          ))}
        </Box>
        <Text color={theme.colors.muted}>↑↓=navigate • Enter=select</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.secondary}>
          Comparing {instanceLabels[fromInstance]} → {instanceLabels[toInstance]}
        </Text>
      </Box>

      <CompareOptionsComponent
        selectedOption={selectedOption}
        isLoading={isLoading}
        options={options}
      />
    </Box>
  );
}
