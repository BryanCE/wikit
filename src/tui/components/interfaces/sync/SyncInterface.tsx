import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { syncForTui } from "@/commands/sync";
import { type SyncCommandOptions, type SyncSummary } from "@/types";
import { getAvailableInstances, getInstanceLabels } from "@/config/dynamicConfig";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterStatus } from "@/tui/contexts/FooterContext";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { SyncOptions } from "./SyncOptions.js";
import { SyncConfirmation } from "./SyncConfirmation.js";
import { SyncResults } from "./SyncResults.js";

interface SyncInterfaceProps {
  onEsc?: () => void;
}

export function SyncInterface({
  onEsc,
}: SyncInterfaceProps) {
  const { theme } = useTheme();
  // Setup escape handling
  useEscape('sync', () => {
    onEsc?.();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SyncSummary | null>(null);
  const [selectedOption, setSelectedOption] = useState(0);
  const [isDryRun, setIsDryRun] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [availableInstances, setAvailableInstances] = useState<string[]>([]);
  const [instanceLabels, setInstanceLabels] = useState<Record<string, string>>({});
  const [fromInstance, setFromInstance] = useState("");
  const [toInstance, setToInstance] = useState("");
  const [selectionMode, setSelectionMode] = useState<"from" | "to" | "options">("from");
  const [selectedInstanceIndex, setSelectedInstanceIndex] = useState(0);
  useFooterStatus(statusMsg);

  useHeaderData({
    title: "Sync Configurations",
    metadata: fromInstance && toInstance ? `${fromInstance} → ${toInstance}${isDryRun ? " (dry run)" : ""}` : "Loading..."
  });

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
    { key: "all", label: "Sync All", desc: "Site config, theme, assets, and pages" },
    {
      key: "config",
      label: "Site Configuration",
      desc: "Site title, description, settings",
    },
    {
      key: "theme",
      label: "Theme Configuration",
      desc: "Theme settings and customization",
    },
    {
      key: "assets",
      label: "Asset Information",
      desc: "Logo, favicon, custom CSS/JS",
    },
    {
      key: "pages",
      label: "Pages Content",
      desc: "Copy missing pages from source to target",
    },
    {
      key: "toggle-mode",
      label: isDryRun ? "Switch to Live Sync" : "Switch to Dry Run",
      desc: isDryRun ? "Execute actual sync" : "Preview changes only",
    },
  ];

  useInput((input, key) => {
    if (isLoading) return;

    if (showConfirmation) {
      if (input === "y" || input === "Y") {
        setShowConfirmation(false);
        void performSync(false);
      } else if (input === "n" || input === "N" || key.escape) {
        setShowConfirmation(false);
      }
      return;
    }

    if (results) {
      if (input === "r") {
        setResults(null);
        setSelectedOption(0);
        setIsDryRun(true);
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
        const option = options[selectedOption];
        if (option?.key === "toggle-mode") {
          setIsDryRun(!isDryRun);
        } else {
          if (isDryRun) {
            void performSync(true);
          } else {
            setShowConfirmation(true);
          }
        }
      }
    }
  });

  const performSync = async (dryRun: boolean) => {
    setIsLoading(true);
    const mode = dryRun ? "dry run" : "sync";
    setStatusMsg(
      `🔄 ${dryRun ? "Checking what would be synced" : "Syncing"} from ${
        instanceLabels[fromInstance]
      } to ${instanceLabels[toInstance]}...`
    );

    try {
      const option = options[selectedOption];
      if (!option) {
        setStatusMsg("❌ Invalid option selected");
        return;
      }

      const syncOptions: SyncCommandOptions = {
        from: fromInstance,
        to: toInstance,
        [option.key]: true,
        dryRun,
      };

      const syncResults = await syncForTui(syncOptions);
      setResults(syncResults);

      if (syncResults.totalErrors > 0) {
        setStatusMsg(
          `❌ ${syncResults.totalErrors} error(s) occurred during ${mode}`
        );
      } else if (syncResults.totalChanges === 0) {
        setStatusMsg(
          "✅ No changes needed - instances are already synchronized"
        );
      } else if (dryRun) {
        setStatusMsg(
          `💡 ${syncResults.totalChanges} change(s) would be made`
        );
      } else {
        setStatusMsg(
          `✅ Successfully synchronized ${syncResults.totalChanges} change(s)`
        );
      }
    } catch (error) {
      setStatusMsg(
        `❌ ${mode} failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };


  if (showConfirmation) {
    return (
      <SyncConfirmation
        fromInstance={fromInstance}
        toInstance={toInstance}
        selectedOption={selectedOption}
        options={options}
        instanceLabels={instanceLabels}
      />
    );
  }

  if (results) {
    return <SyncResults results={results} />;
  }

  if (availableInstances.length < 2) {
    return (
      <Box flexDirection="column">
        <Text color={theme.colors.error} bold>
          Error: Not Enough Instances
        </Text>
        <Text color={theme.colors.text}>
          Sync requires at least 2 configured instances.
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
    <SyncOptions
      fromInstance={fromInstance}
      toInstance={toInstance}
      selectedOption={selectedOption}
      isDryRun={isDryRun}
      isLoading={isLoading}
      options={options}
      instanceLabels={instanceLabels}
    />
  );
}
