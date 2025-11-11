import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useIcon } from "@/tui/contexts/IconContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";
import { getConfigStatus, type ConfigStatus } from "@/config/advancedMigration";

interface ConfigStatusViewProps {
  onStatusMessage: (message: string) => void;
}

export function ConfigStatusView({ onStatusMessage }: ConfigStatusViewProps) {
  const { theme } = useTheme();
  const { hasNerdFonts } = useIcon();
  const [statusData, setStatusData] = useState<ConfigStatus | null>(null);

  useFooterHelp(COMMON_HELP_PATTERNS.VIEW_ONLY);
  useFooterStatus("Configuration status");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await getConfigStatus();
        setStatusData(status);
      } catch (error) {
        onStatusMessage(
          `Error loading status: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };
    void loadStatus();
  }, [onStatusMessage]);

  if (!statusData) {
    return (
      <Box>
        <Text color={theme.colors.muted}>Loading status...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Configuration Status
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.text}>
          .env Configuration:{" "}
          {statusData.hasEnvConfig ? (
            <Text color={theme.colors.success}>
              Found ({statusData.envInstances.length} instances)
            </Text>
          ) : (
            <Text color={theme.colors.muted}>Not found</Text>
          )}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.text}>
          Encrypted Configuration:{" "}
          {statusData.hasEncryptedConfig ? (
            <Text color={theme.colors.success}>
              Found ({statusData.encryptedInstances.length} instances)
            </Text>
          ) : (
            <Text color={theme.colors.muted}>Not found</Text>
          )}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.colors.text}>
          Nerd Fonts Support:{" "}
          {hasNerdFonts ? (
            <Text color={theme.colors.success}>Enabled</Text>
          ) : (
            <Text color={theme.colors.muted}>Disabled (using text fallback)</Text>
          )}
        </Text>
      </Box>

      {statusData.hasEncryptedConfig && (
        <Box marginBottom={1}>
          <Text color={theme.colors.muted}>
            Config file: {statusData.configPath}
          </Text>
        </Box>
      )}

      {statusData.hasEnvConfig && (
        <Box marginBottom={1}>
          <Text color={theme.colors.text}>.env instances:</Text>
          {statusData.envInstances.map((instance) => (
            <Box key={instance.id} paddingLeft={2}>
              <Text color={theme.colors.muted}>
                • {instance.id} ({instance.name})
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {statusData.hasEncryptedConfig && (
        <Box marginBottom={1}>
          <Text color={theme.colors.text}>Encrypted instances:</Text>
          {statusData.encryptedInstances.map((instance) => (
            <Box key={instance.id} paddingLeft={2}>
              <Text color={theme.colors.muted}>
                • {instance.id} ({instance.name})
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
