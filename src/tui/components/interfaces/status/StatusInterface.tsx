import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { statusForTui } from "@/commands/status";
import { type StatusOptions } from "@/types";
import { type AllInstancesStatusResult, type StatusResult } from "@/types";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterStatus, useFooterHelp } from "@/tui/contexts/FooterContext";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import { Button } from "@/tui/components/ui/Button";

interface StatusInterfaceProps {
  instance: string;
  onEsc?: () => void;
}

export function StatusInterface({
  instance: _instance,
  onEsc,
}: StatusInterfaceProps) {
  // Setup escape handling
  useEscape("status", () => {
    onEsc?.();
  });

  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<AllInstancesStatusResult | null>(null);
  const [statusMsg, setStatusMsg] = useState("Loading...");

  const healthyCount = result?.instances.filter((inst) => inst.health.isHealthy).length ?? 0;
  const totalCount = result?.instances.length ?? 0;

  // Header and footer context hooks
  useHeaderData({
    title: "Instance Status",
    metadata: result ? `${healthyCount}/${totalCount} healthy` : "Loading..."
  });

  useFooterStatus(statusMsg);

  useFooterHelp(
    isLoading
      ? "Checking..."
      : formatHelpText("Enter=refresh", HELP_TEXT.BACK)
  );

  useInput((input, key) => {
    if (isLoading) return;

    if (key.return) {
      void handleStatusCheck();
    }
  });

  const handleStatusCheck = async () => {
    if (isLoading && result) return;

    setIsLoading(true);
    setStatusMsg("Checking all instance health...");

    try {
      const statusOptions: StatusOptions = {
        verbose: true,
      };

      const statusResult = await statusForTui(statusOptions);
      setResult(statusResult);

      const healthyCount = statusResult.instances.filter(
        (inst) => inst.health.isHealthy
      ).length;
      const totalCount = statusResult.instances.length;

      if (healthyCount === totalCount) {
        setStatusMsg("All instances are healthy");
      } else {
        setStatusMsg(`${healthyCount}/${totalCount} instances are healthy`);
      }
    } catch (error) {
      setStatusMsg(
        `Status check failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    void handleStatusCheck();
  }, []);

  const renderInstanceStatus = (result: StatusResult) => (
    <Box
      flexDirection="column"
      marginBottom={1}
      paddingLeft={1}
      borderStyle="round"
      borderColor={theme.colors.secondary}
    >
      <Text
        color={
          result.health.isHealthy ? theme.colors.success : theme.colors.error
        }
        bold
      >
        {result.instance.instanceName}:{" "}
        {result.health.isHealthy ? "HEALTHY" : "UNHEALTHY"}
      </Text>
      <Text color={theme.colors.text}>
        Status: {result.health.statusMessage}
      </Text>
      <Text color={theme.colors.text}>
        Response Time: {result.health.responseTime}ms
      </Text>
      {result.health.uptime && (
        <Text color={theme.colors.text}>Uptime: {result.health.uptime}</Text>
      )}
      <Text color={theme.colors.text}>
        Pages: {result.instance.publishedPages}/{result.instance.totalPages}{" "}
        published
      </Text>
      <Text color={theme.colors.text}>
        Users: {result.instance.totalUsers} total, {result.instance.adminUsers}{" "}
        admins
      </Text>
      <Text color={theme.colors.text}>Version: {result.instance.version}</Text>
    </Box>
  );

  if (isLoading) {
    return (
      <Box flexDirection="column">
        <Text color={theme.colors.muted}>Loading...</Text>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box flexDirection="column">
        <Text color={theme.colors.error}>Failed to load status</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={2}>
        <Button label="Refresh Status" isSelected={true} variant="primary" />
      </Box>

      {result.instances.map((instanceResult, index) => (
        <Box key={index}>{renderInstanceStatus(instanceResult)}</Box>
      ))}
    </Box>
  );
}
