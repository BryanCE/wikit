import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterStatus } from "@/tui/contexts/FooterContext";
import { getConfigManager, needsSetup } from "@/config/dynamicConfig";
import { InstanceForm } from "./InstanceForm";
import type { WikiInstance } from "@/config/configManager";

interface SetupWizardProps {
  onComplete: (success: boolean, instanceId?: string) => void;
}

enum WizardStep {
  WELCOME = "welcome",
  FORM = "form",
  SUCCESS = "success",
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    WizardStep.WELCOME
  );
  const [shouldShow, setShouldShow] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  useFooterStatus(statusMsg);

  useEffect(() => {
    void checkIfSetupNeeded();
  }, []);

  const checkIfSetupNeeded = async () => {
    try {
      const setupRequired = await needsSetup();
      setShouldShow(setupRequired);

      if (!setupRequired) {
        onComplete(true);
      }
    } catch (error) {
      setStatusMsg(
        `Error checking setup status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      onComplete(false);
    }
  };

  const handleSaveInstance = async (instance: WikiInstance): Promise<void> => {
    try {
      const configManager = getConfigManager();
      await configManager.addInstance(instance);

      setStatusMsg(
        `Welcome! Instance '${instance.name}' configured successfully.`
      );
      setCurrentStep(WizardStep.SUCCESS);

      // Auto-close after showing success
      setTimeout(() => {
        onComplete(true, instance.id);
      }, 3000);
    } catch (error) {
      throw error instanceof Error ? error : new Error("Unknown error");
    }
  };

  useInput((input, key) => {
    if (currentStep === WizardStep.WELCOME) {
      if (key.return || input === "y" || input === "Y") {
        setCurrentStep(WizardStep.FORM);
      } else if (key.escape || input === "n" || input === "N") {
        onComplete(false);
      }
    }
  });

  if (!shouldShow) {
    return null;
  }

  switch (currentStep) {
    case WizardStep.WELCOME:
      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.colors.primary} bold>
              Welcome to Wiki.js CLI!
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text color={theme.colors.text}>
              This appears to be your first time using the CLI. Let's set up
              your first
            </Text>
          </Box>
          <Box marginBottom={1}>
            <Text color={theme.colors.text}>
              Wiki.js instance to get you started.
            </Text>
          </Box>

          <Box marginBottom={2}>
            <Text color={theme.colors.warning}>
              You'll need your Wiki.js API URL and API key.
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text color={theme.colors.info}>To find your API key:</Text>
          </Box>
          <Box marginBottom={1}>
            <Text color={theme.colors.info}>
              1. Go to your Wiki.js admin panel
            </Text>
          </Box>
          <Box marginBottom={1}>
            <Text color={theme.colors.info}>2. Navigate to API Access</Text>
          </Box>
          <Box marginBottom={2}>
            <Text color={theme.colors.info}>
              3. Generate a new API key with appropriate permissions
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text color={theme.colors.accent}>
              Ready to configure your first instance? (Y/n)
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text color={theme.colors.muted}>
              Enter=continue • Esc=skip
            </Text>
          </Box>
        </Box>
      );

    case WizardStep.FORM:
      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.colors.primary} bold>
              Configure Your First Wiki.js Instance
            </Text>
          </Box>

          <InstanceForm
            mode="add"
            onSave={handleSaveInstance}
            onCancel={() => onComplete(false)}
            onStatusMessage={setStatusMsg}
          />
        </Box>
      );

    case WizardStep.SUCCESS:
      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.colors.success} bold>
              Setup Complete!
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text color={theme.colors.text}>
              Your Wiki.js instance has been configured successfully.
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text color={theme.colors.text}>
              You can now use all CLI and TUI features.
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text color={theme.colors.muted}>
              Returning to main menu in 3 seconds...
            </Text>
          </Box>
        </Box>
      );

    default:
      return null;
  }
}
