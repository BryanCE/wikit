import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { formatHelpText, HELP_TEXT, COMMON_HELP_PATTERNS } from "@/tui/constants/keyboard";
import {
  getConfigManager,
  getAvailableInstances,
} from "@/config/dynamicConfig";
import { ConfigStatusView } from "./ConfigStatusView";
import { MigrationView } from "./MigrationView";
import { InstanceForm } from "./InstanceForm";
import type { WikiInstance } from "@/config/configManager";

interface ConfigInterfaceProps {
  onEsc: () => void;
}

enum ConfigMode {
  MENU = "menu",
  LIST = "list",
  ADD = "add",
  EDIT = "edit",
  DELETE = "delete",
  MIGRATE_TO_ENCRYPTED = "migrate_to_encrypted",
  MIGRATE_TO_ENV = "migrate_to_env",
  RESET_ENCRYPTED = "reset_encrypted",
  STATUS = "status",
}

interface ConfigState {
  mode: ConfigMode;
  instances: string[];
  selectedIndex: number;
  editingInstance: string | null;
  newInstance: Partial<WikiInstance>;
  showInstanceActions: boolean;
  instanceActionIndex: number;
  deleteConfirmationInput: string;
}

export function ConfigInterface({
  onEsc,
}: ConfigInterfaceProps) {
  const { theme } = useTheme();
  const [state, setState] = useState<ConfigState>({
    mode: ConfigMode.MENU,
    instances: [],
    selectedIndex: 0,
    editingInstance: null,
    newInstance: { id: "", name: "", url: "", key: "" },
    showInstanceActions: false,
    instanceActionIndex: 0,
    deleteConfirmationInput: "",
  });
  const [statusMsg, setStatusMsg] = useState("");
  useFooterStatus(statusMsg);

  // Dynamic footer help based on mode
  const getFooterHelp = () => {
    switch (state.mode) {
      case ConfigMode.MENU:
        return COMMON_HELP_PATTERNS.MENU;
      case ConfigMode.LIST:
        if (state.showInstanceActions) {
          return COMMON_HELP_PATTERNS.ACTION_MENU;
        }
        return formatHelpText(HELP_TEXT.NAVIGATE, HELP_TEXT.ENTER_ACTIONS, HELP_TEXT.BACK);
      case ConfigMode.DELETE:
        const isLastInstance = state.instances.length === 1;
        return isLastInstance
          ? "Type instance name to confirm • Enter confirm • Esc cancel"
          : formatHelpText(HELP_TEXT.ENTER_CONFIRM, HELP_TEXT.CANCEL);
      case ConfigMode.STATUS:
      case ConfigMode.MIGRATE_TO_ENCRYPTED:
      case ConfigMode.MIGRATE_TO_ENV:
      case ConfigMode.RESET_ENCRYPTED:
      case ConfigMode.ADD:
      case ConfigMode.EDIT:
        // These sub-components set their own footer
        return "";
      default:
        return HELP_TEXT.BACK;
    }
  };

  const getFooterStatus = () => {
    switch (state.mode) {
      case ConfigMode.MENU:
        return "Configuration Management";
      case ConfigMode.LIST:
        return `Instances: ${state.instances.length}`;
      case ConfigMode.DELETE:
        return `Delete: ${state.editingInstance}`;
      case ConfigMode.STATUS:
      case ConfigMode.MIGRATE_TO_ENCRYPTED:
      case ConfigMode.MIGRATE_TO_ENV:
      case ConfigMode.RESET_ENCRYPTED:
      case ConfigMode.ADD:
      case ConfigMode.EDIT:
        // These sub-components set their own footer
        return "";
      default:
        return "Configuration";
    }
  };

  useFooterHelp(getFooterHelp());
  useFooterStatus(getFooterStatus());
  useHeaderData({ title: "Configuration Management", metadata: `${state.instances.length} instances` });

  useEffect(() => {
    void loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      const instances = await getAvailableInstances();
      setState((prev) => ({ ...prev, instances }));
    } catch (error) {
      setStatusMsg(
        `Error loading instances: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleMenuNavigation = (key: string) => {
    switch (key) {
      case "ArrowUp":
        setState((prev) => ({
          ...prev,
          selectedIndex: Math.max(0, prev.selectedIndex - 1),
        }));
        break;
      case "ArrowDown":
        const maxIndex = getMenuItems().length - 1;
        setState((prev) => ({
          ...prev,
          selectedIndex: Math.min(maxIndex, prev.selectedIndex + 1),
        }));
        break;
      case "Enter":
        const menuItems = getMenuItems();
        const selectedItem = menuItems[state.selectedIndex];
        if (selectedItem) {
          handleMenuSelection(selectedItem.id);
        }
        break;
    }
  };

  const handleMenuSelection = (itemId: string) => {
    switch (itemId) {
      case "status":
        setState((prev) => ({ ...prev, mode: ConfigMode.STATUS }));
        break;
      case "list":
        setState((prev) => ({
          ...prev,
          mode: ConfigMode.LIST,
          selectedIndex: 0,
        }));
        break;
      case "add":
        setState((prev) => ({
          ...prev,
          mode: ConfigMode.ADD,
          newInstance: { id: "", name: "", url: "", key: "" },
        }));
        // setInputField("id");
        break;
      case "migrate-to-encrypted":
        setState((prev) => ({
          ...prev,
          mode: ConfigMode.MIGRATE_TO_ENCRYPTED,
        }));
        break;
      case "migrate-to-env":
        setState((prev) => ({ ...prev, mode: ConfigMode.MIGRATE_TO_ENV }));
        break;
      case "reset":
        setState((prev) => ({ ...prev, mode: ConfigMode.RESET_ENCRYPTED }));
        break;
      case "back":
        onEsc();
        break;
    }
  };

  const handleInstanceNavigation = (key: string) => {
    if (state.showInstanceActions) {
      // Navigate within action menu
      switch (key) {
        case "ArrowUp":
          setState((prev) => ({
            ...prev,
            instanceActionIndex: Math.max(0, prev.instanceActionIndex - 1),
          }));
          break;
        case "ArrowDown":
          setState((prev) => ({
            ...prev,
            instanceActionIndex: Math.min(1, prev.instanceActionIndex + 1),
          }));
          break;
        case "Enter":
          if (state.instanceActionIndex === 0) {
            // Edit
            const toEdit = state.instances[state.selectedIndex];
            setState((prev) => ({
              ...prev,
              mode: ConfigMode.EDIT,
              editingInstance: toEdit ?? null,
              showInstanceActions: false,
              instanceActionIndex: 0,
            }));
          } else if (state.instanceActionIndex === 1) {
            // Delete
            const toDelete = state.instances[state.selectedIndex];
            setState((prev) => ({
              ...prev,
              mode: ConfigMode.DELETE,
              editingInstance: toDelete ?? null,
              showInstanceActions: false,
              instanceActionIndex: 0,
            }));
          }
          break;
      }
    } else {
      // Navigate within instance list
      switch (key) {
        case "ArrowUp":
          setState((prev) => ({
            ...prev,
            selectedIndex: Math.max(0, prev.selectedIndex - 1),
          }));
          break;
        case "ArrowDown":
          setState((prev) => ({
            ...prev,
            selectedIndex: Math.min(
              prev.instances.length - 1,
              prev.selectedIndex + 1
            ),
          }));
          break;
        case "Enter":
          setState((prev) => ({
            ...prev,
            showInstanceActions: true,
            instanceActionIndex: 0,
          }));
          break;
      }
    }
  };

  const handleDeleteInstance = async () => {
    if (!state.editingInstance) return;

    const isLastInstance = state.instances.length === 1;

    // For last instance, require typing the instance name
    if (isLastInstance && state.deleteConfirmationInput !== state.editingInstance) {
      setStatusMsg(`You must type the instance name '${state.editingInstance}' to confirm deletion of the last instance.`);
      return;
    }

    try {
      const configManager = getConfigManager();
      await configManager.removeInstance(state.editingInstance);

      if (isLastInstance) {
        setStatusMsg(`All instances deleted. Run setup wizard to configure a new instance.`);
      } else {
        setStatusMsg(`Instance '${state.editingInstance}' deleted`);
      }

      await loadInstances();
      setState((prev) => ({
        ...prev,
        mode: ConfigMode.MENU,
        selectedIndex: 0,
        deleteConfirmationInput: "",
      }));
    } catch (error) {
      setStatusMsg(
        `Error deleting instance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleSaveInstance = async (instance: WikiInstance) => {
    try {
      const configManager = getConfigManager();

      if (state.mode === ConfigMode.ADD) {
        await configManager.addInstance(instance);
        setStatusMsg(`Instance '${instance.name}' added successfully`);
      } else if (state.mode === ConfigMode.EDIT) {
        await configManager.updateInstance(instance.id, instance);
        setStatusMsg(`Instance '${instance.name}' updated successfully`);
      }

      await loadInstances();
      setState((prev) => ({
        ...prev,
        mode: ConfigMode.MENU,
        selectedIndex: 0,
      }));
    } catch (error) {
      setStatusMsg(
        `Error saving instance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Setup escape handling
  useEscape("config", () => {
    if (state.showInstanceActions) {
      setState((prev) => ({
        ...prev,
        showInstanceActions: false,
        instanceActionIndex: 0,
      }));
    } else if (state.mode === ConfigMode.MENU) {
      setStatusMsg(""); // Clear any lingering status messages
      onEsc();
    } else {
      setState((prev) => ({
        ...prev,
        mode: ConfigMode.MENU,
        selectedIndex: 0,
        deleteConfirmationInput: "", // Clear any confirmation input
      }));
    }
  });

  useInput((input, key) => {
    switch (state.mode) {
      case ConfigMode.MENU:
        handleMenuNavigation(
          key.upArrow
            ? "ArrowUp"
            : key.downArrow
            ? "ArrowDown"
            : key.return
            ? "Enter"
            : ""
        );
        break;
      case ConfigMode.LIST:
        if (state.instances.length > 0) {
          handleInstanceNavigation(
            key.upArrow
              ? "ArrowUp"
              : key.downArrow
              ? "ArrowDown"
              : key.return
              ? "Enter"
              : input
          );
        }
        break;
      case ConfigMode.DELETE:
        const isDeletingLastInstance = state.instances.length === 1;
        if (isDeletingLastInstance) {
          // Handle text input for confirmation when deleting last instance
          if (key.return) {
            void handleDeleteInstance();
          } else if (key.backspace || key.delete) {
            setState((prev) => ({
              ...prev,
              deleteConfirmationInput: prev.deleteConfirmationInput.slice(0, -1),
            }));
          } else if (input && !key.ctrl && !key.meta && input.length === 1) {
            setState((prev) => ({
              ...prev,
              deleteConfirmationInput: prev.deleteConfirmationInput + input,
            }));
          }
        } else {
          // Simple confirmation for non-last instance
          if (key.return) {
            void handleDeleteInstance();
          }
        }
        break;
    }
  });

  const getMenuItems = () => [
    {
      id: "status",
      label: "Configuration status",
      description: "View current configuration state",
    },
    {
      id: "list",
      label: "List instances",
      description: "View and manage existing instances",
    },
    {
      id: "add",
      label: "Add instance",
      description: "Configure a new Wiki.js instance",
    },
    {
      id: "migrate-to-encrypted",
      label: "Migrate to encrypted",
      description: "Move .env config to encrypted storage",
    },
    {
      id: "migrate-to-env",
      label: "Export to .env",
      description: "Generate .env format from encrypted config",
    },
    {
      id: "reset",
      label: "Reset encrypted config",
      description: "Clear all encrypted configuration",
    },
    { id: "back", label: "Back", description: "Return to main menu" },
  ];

  const renderMenu = () => {
    const menuItems = getMenuItems();

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color={theme.colors.primary} bold>
            Configuration Menu
          </Text>
        </Box>

        {menuItems.map((item, index) => (
          <Box key={item.id} marginBottom={1}>
            <Text
              color={
                index === state.selectedIndex
                  ? theme.colors.accent
                  : theme.colors.text
              }
            >
              {index === state.selectedIndex ? " ► " : "   "}
              {item.label}
            </Text>
            <Box marginLeft={2}>
              <Text color={theme.colors.muted}>- {item.description}</Text>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const renderInstanceList = () => {
    if (state.instances.length === 0) {
      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.colors.primary} bold>
              Instance List
            </Text>
          </Box>
          <Text color={theme.colors.warning}>No instances configured</Text>
        </Box>
      );
    }

    if (state.showInstanceActions) {
      const selectedInstance = state.instances[state.selectedIndex];
      const isLastInstance = state.instances.length === 1;

      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.colors.primary} bold>
              Actions for: {selectedInstance}
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text
              color={
                state.instanceActionIndex === 0
                  ? theme.colors.accent
                  : theme.colors.text
              }
              bold={state.instanceActionIndex === 0}
            >
              {state.instanceActionIndex === 0 ? " ► " : "   "}
              Edit Instance
            </Text>
          </Box>

          <Box>
            <Text
              color={
                state.instanceActionIndex === 1
                  ? theme.colors.error
                  : theme.colors.text
              }
              bold={state.instanceActionIndex === 1}
            >
              {state.instanceActionIndex === 1 ? " ► " : "   "}
              Delete Instance{isLastInstance ? " ⚠" : ""}
            </Text>
          </Box>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color={theme.colors.primary} bold>
            Instance List ({state.instances.length})
          </Text>
        </Box>

        {state.instances.map((instance, index) => (
          <Box key={instance}>
            <Text
              color={
                index === state.selectedIndex
                  ? theme.colors.accent
                  : theme.colors.text
              }
            >
              {index === state.selectedIndex ? " ► " : "   "}
              {instance}
            </Text>
          </Box>
        ))}
      </Box>
    );
  };

  const renderDeleteConfirmation = () => {
    const instanceCount = state.instances.length;
    const isLastInstance = instanceCount === 1;

    if (isLastInstance) {
      // Strong warnings and confirmation input for last instance
      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.colors.error} bold>
              ⚠ WARNING: DELETING LAST INSTANCE ⚠
            </Text>
          </Box>

          <Box marginBottom={1} flexDirection="column">
            <Text color={theme.colors.error} bold>
              This is your LAST configured instance!
            </Text>
            <Text color={theme.colors.error}>
              After deletion, you will need to run the setup wizard to configure a new instance.
            </Text>
          </Box>

          <Box marginBottom={1} flexDirection="column">
            <Text color={theme.colors.warning}>Instance to delete: {state.editingInstance}</Text>
            <Text color={theme.colors.muted}>This action cannot be undone.</Text>
          </Box>

          <Box marginTop={1} marginBottom={1} flexDirection="column">
            <Text color={theme.colors.text} bold>
              Type the instance name to confirm deletion:
            </Text>
          </Box>

          <Box
            borderStyle="round"
            borderColor={
              state.deleteConfirmationInput === state.editingInstance
                ? theme.colors.success
                : theme.colors.error
            }
            paddingX={1}
          >
            <Text color={theme.colors.text}>
              {state.deleteConfirmationInput || " "}
            </Text>
          </Box>

          {state.deleteConfirmationInput && state.deleteConfirmationInput !== state.editingInstance && (
            <Box marginTop={1}>
              <Text color={theme.colors.error}>
                Incorrect. Type '{state.editingInstance}' exactly.
              </Text>
            </Box>
          )}

          {state.deleteConfirmationInput === state.editingInstance && (
            <Box marginTop={1}>
              <Text color={theme.colors.success}>
                Confirmed. Press Enter to delete.
              </Text>
            </Box>
          )}
        </Box>
      );
    }

    // Normal deletion confirmation for non-last instance
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color={theme.colors.error} bold>
            Delete Instance
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.warning}>
            Are you sure you want to delete instance '{state.editingInstance}'?
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={theme.colors.error}>This action cannot be undone.</Text>
        </Box>

        <Box marginTop={1}>
          <Text color={theme.colors.muted}>
            {instanceCount} instances configured • {instanceCount - 1} will remain after deletion
          </Text>
        </Box>

        <Box marginTop={1}>
          <Text color={theme.colors.text}>
            Press Enter to confirm deletion, or Esc to cancel.
          </Text>
        </Box>
      </Box>
    );
  };

  return (() => {
    switch (state.mode) {
      case ConfigMode.MENU:
        return renderMenu();
      case ConfigMode.STATUS:
        return <ConfigStatusView onStatusMessage={setStatusMsg} />;
      case ConfigMode.LIST:
        return renderInstanceList();
      case ConfigMode.DELETE:
        return renderDeleteConfirmation();
      case ConfigMode.ADD:
        return (
          <InstanceForm
            mode="add"
            onSave={handleSaveInstance}
            onCancel={() =>
              setState((prev) => ({
                ...prev,
                mode: ConfigMode.MENU,
                selectedIndex: 0,
              }))
            }
            onStatusMessage={setStatusMsg}
          />
        );
      case ConfigMode.EDIT:
        return (
          <InstanceForm
            mode="edit"
            instanceId={state.editingInstance ?? undefined}
            onSave={handleSaveInstance}
            onCancel={() =>
              setState((prev) => ({
                ...prev,
                mode: ConfigMode.MENU,
                selectedIndex: 0,
              }))
            }
            onStatusMessage={setStatusMsg}
          />
        );
      case ConfigMode.MIGRATE_TO_ENCRYPTED:
        return (
          <MigrationView
            direction="to-encrypted"
            onComplete={() =>
              setState((prev) => ({ ...prev, mode: ConfigMode.MENU }))
            }
            onStatusMessage={setStatusMsg}
          />
        );
      case ConfigMode.MIGRATE_TO_ENV:
        return (
          <MigrationView
            direction="to-env"
            onComplete={() =>
              setState((prev) => ({ ...prev, mode: ConfigMode.MENU }))
            }
            onStatusMessage={setStatusMsg}
          />
        );
      case ConfigMode.RESET_ENCRYPTED:
        return (
          <MigrationView
            direction="reset"
            onComplete={() =>
              setState((prev) => ({ ...prev, mode: ConfigMode.MENU }))
            }
            onStatusMessage={setStatusMsg}
          />
        );
      default:
        return renderMenu();
    }
  })();
}
