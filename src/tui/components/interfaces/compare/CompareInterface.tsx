import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { compareForTui } from "@/commands/compare";
import type { CompareOptions, CompareResults } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterStatus } from "@/tui/contexts/FooterContext";
import { getAvailableInstances, getInstanceLabels } from "@/config";
import { InstanceContext } from "@/contexts/InstanceContext";
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
  useFooterStatus(statusMsg);

  const instance = InstanceContext.getInstance();
  const otherInstances = availableInstances.filter(i => i !== instance);
  const otherInstance = otherInstances[0] ?? instance;

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

    // Handle post-results actions
    if (results) {
      if (input === "d") {
        setShowDetails(!showDetails);
        return;
      }
      if (input === "r") {
        setResults(null);
        setSelectedOption(0);
        return;
      }
      return; // Block other inputs when showing results
    }

    // Handle pre-results navigation
    if (key.upArrow) {
      setSelectedOption((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (key.downArrow) {
      setSelectedOption((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      void handleCompare();
    }
  });

  const handleCompare = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setStatusMsg(
      `Comparing ${instanceLabels[instance]} vs ${instanceLabels[otherInstance]}...`
    );

    try {
      const option = options[selectedOption];
      if (!option) {
        setStatusMsg("Invalid option selected");
        return;
      }

      const compareOptions: CompareOptions = {
        from: instance,
        to: otherInstance,
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

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.secondary}>
          Comparing {instanceLabels[instance]} → {instanceLabels[otherInstance]}
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
