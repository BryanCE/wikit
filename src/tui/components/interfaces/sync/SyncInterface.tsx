import React, { useState, useEffect } from "react";
import { useInput } from "ink";
import { syncForTui } from "@/commands/sync";
import { type SyncCommandOptions, type SyncSummary } from "@/types";
import { getAvailableInstances, getInstanceLabels } from "@/config/dynamicConfig";
import { InstanceContext } from "@/contexts/InstanceContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterStatus } from "@/tui/contexts/FooterContext";
import { SyncOptions } from "./SyncOptions.js";
import { SyncConfirmation } from "./SyncConfirmation.js";
import { SyncResults } from "./SyncResults.js";

interface SyncInterfaceProps {
  onEsc?: () => void;
}

export function SyncInterface({
  onEsc,
}: SyncInterfaceProps) {
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
  useFooterStatus(statusMsg);

  const instance = InstanceContext.getInstance();
  const otherInstances = availableInstances.filter(i => i !== instance);
  const otherInstance = otherInstances[0] ?? instance;

  useHeaderData({
    title: "Sync Configurations",
    metadata: `${instance} → ${otherInstance}${isDryRun ? " (dry run)" : ""}`
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

    if (key.upArrow) {
      setSelectedOption((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (key.downArrow) {
      setSelectedOption((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (input === "d") {
      setIsDryRun(!isDryRun);
    } else if (key.return) {
      if (isDryRun) {
        void performSync(true);
      } else {
        setShowConfirmation(true);
      }
    }
  });

  const performSync = async (dryRun: boolean) => {
    setIsLoading(true);
    const mode = dryRun ? "dry run" : "sync";
    setStatusMsg(
      `🔄 ${dryRun ? "Checking what would be synced" : "Syncing"} from ${
        instanceLabels[instance]
      } to ${instanceLabels[otherInstance]}...`
    );

    try {
      const option = options[selectedOption];
      if (!option) {
        setStatusMsg("❌ Invalid option selected");
        return;
      }

      const syncOptions: SyncCommandOptions = {
        from: instance,
        to: otherInstance,
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
        otherInstance={otherInstance}
        selectedOption={selectedOption}
        options={options}
      />
    );
  }

  if (results) {
    return <SyncResults results={results} />;
  }

  return (
    <SyncOptions
      otherInstance={otherInstance}
      selectedOption={selectedOption}
      isDryRun={isDryRun}
      isLoading={isLoading}
      options={options}
    />
  );
}
