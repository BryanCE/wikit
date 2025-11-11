import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { formatHelpText, HELP_TEXT } from "@/tui/constants/keyboard";
import {
  migrateToEncrypted,
  resetEncryptedConfig,
  generateEnvFromEncrypted,
  previewMigration,
  type MigrationSummary,
} from "@/config/advancedMigration";

interface MigrationViewProps {
  direction: "to-encrypted" | "to-env" | "reset";
  onComplete: () => void;
  onStatusMessage: (message: string) => void;
}

export function MigrationView({
  direction,
  onComplete,
  onStatusMessage,
}: MigrationViewProps) {
  const { theme } = useTheme();
  const [migrationData, setMigrationData] = useState<MigrationSummary | null>(
    null
  );
  const [envLines, setEnvLines] = useState<string[]>([]);

  // Footer help depends on direction
  const footerHelp = direction === "to-env"
    ? HELP_TEXT.BACK
    : formatHelpText(HELP_TEXT.ENTER_CONFIRM, HELP_TEXT.CANCEL);

  const footerStatus = direction === "to-encrypted"
    ? "Migrate .env to encrypted"
    : direction === "to-env"
    ? "Export encrypted to .env format"
    : "Reset encrypted config";

  useFooterHelp(footerHelp);
  useFooterStatus(footerStatus);

  useEffect(() => {
    if (direction === "to-encrypted") {
      void loadMigrationPreview();
    } else if (direction === "to-env") {
      void loadEnvLines();
    }
  }, [direction]);

  const loadMigrationPreview = async () => {
    try {
      const preview = await previewMigration("to-encrypted");
      setMigrationData(preview);
    } catch (error) {
      onStatusMessage(
        `Error loading migration preview: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const loadEnvLines = async () => {
    try {
      const lines = await generateEnvFromEncrypted();
      setEnvLines(lines);
    } catch (error) {
      onStatusMessage(
        `Error generating .env: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleConfirmMigration = async () => {
    try {
      const result = await migrateToEncrypted({ overwrite: false });
      onStatusMessage(
        `Migration complete: ${result.migrated} migrated, ${result.skipped} skipped`
      );
      onComplete();
    } catch (error) {
      onStatusMessage(
        `Migration failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleConfirmReset = async () => {
    try {
      await resetEncryptedConfig();
      onStatusMessage("Encrypted configuration reset successfully");
      onComplete();
    } catch (error) {
      onStatusMessage(
        `Reset failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  useInput((input, key) => {
    if (key.escape) {
      onComplete();
      return;
    }

    if (key.return) {
      if (direction === "to-encrypted") {
        void handleConfirmMigration();
      } else if (direction === "reset") {
        void handleConfirmReset();
      }
    }
  });

  if (direction === "to-encrypted") {
    if (!migrationData) {
      return (
        <Box>
          <Text color={theme.colors.muted}>Loading migration preview...</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color={theme.colors.primary} bold>
            Migrate .env to Encrypted Configuration
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.text}>
            This will copy your .env configuration to encrypted storage.
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.text}>
            Your .env file will remain unchanged.
          </Text>
        </Box>

        {migrationData.instances.length === 0 ? (
          <Box marginBottom={1}>
            <Text color={theme.colors.warning}>
              No .env instances found to migrate.
            </Text>
          </Box>
        ) : (
          migrationData.instances.map((instance) => (
            <Box key={instance.id} marginBottom={1}>
              <Text
                color={
                  instance.status === "skipped"
                    ? theme.colors.warning
                    : theme.colors.success
                }
              >
                • {instance.id} ({instance.name}):{" "}
                {instance.status === "skipped"
                  ? "Will skip - already exists"
                  : "Will migrate"}
              </Text>
            </Box>
          ))
        )}
      </Box>
    );
  }

  if (direction === "to-env") {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color={theme.colors.primary} bold>
            Export Encrypted Config to .env Format
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.text}>
            Copy the following to your .env file:
          </Text>
        </Box>

        <Box flexDirection="column" paddingLeft={2} marginBottom={2}>
          {envLines.map((line, index) => (
            <Text
              key={index}
              color={
                line.startsWith("#") ? theme.colors.muted : theme.colors.text
              }
            >
              {line}
            </Text>
          ))}
        </Box>
      </Box>
    );
  }

  if (direction === "reset") {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color={theme.colors.error} bold>
            Reset Encrypted Configuration
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.warning}>
            This will completely remove your encrypted configuration file.
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.warning}>
            Your .env file (if present) will remain untouched.
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.error}>This action cannot be undone.</Text>
        </Box>
      </Box>
    );
  }

  return null;
}
