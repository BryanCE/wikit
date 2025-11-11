import React, { useState } from "react";
import { Box, useInput } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useFooterHelp } from "@/tui/contexts/FooterContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { COMMANDS } from "@/tui/commands";
import { getQuickActions } from "@/tui/commands";
import { CommandPreviewList } from "@comps/command/CommandPreviewList";
import { parseCommandInput, getCommandPart } from "@/utils/commandParser";
import { QuickActions } from "./QuickActions";
import { CommandInputField } from "./CommandInputField";
import type { FocusMode } from "@/types";

interface CommandInputProps {
  onCommand: (command: string, args?: string) => void;
}

export function CommandInput({ onCommand }: CommandInputProps) {
  const [input, setInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusMode, setFocusMode] = useState<FocusMode>("input");
  const [showCommandPreview, setShowCommandPreview] = useState(false);
  const { theme } = useTheme();
  const quickActions = getQuickActions(theme);

  // Set header based on focus mode
  useHeaderData({
    title: "Home",
    metadata: focusMode === "menu" ? "Quick Actions" : "Command Interface",
  });

  // Set footer help text based on focus mode and command preview state
  const helpText =
    focusMode === "commands"
      ? "↑↓=navigate commands • Enter=select • Esc=cancel"
      : focusMode === "input"
      ? showCommandPreview
        ? "Tab=auto-complete • ↑↓=navigate commands • →=quick menu • Ctrl+C=exit"
        : "Type /commands • →=quick menu • Ctrl+C=exit"
      : "↑↓=navigate • Enter=select • ←=back to input";

  useFooterHelp(helpText);

  // Helper function to get filtered commands
  const getFilteredCommands = () => {
    const commandPart = getCommandPart(input);
    if (!commandPart) return COMMANDS;

    return COMMANDS.filter((cmd) => {
      const matches =
        cmd.name.toLowerCase().startsWith(commandPart) ||
        cmd.aliases?.some((alias) =>
          alias.toLowerCase().startsWith(commandPart)
        );
      return matches;
    });
  };

  useInput((inputChar, key) => {
    if (key.ctrl && inputChar === "c") {
      process.exit(0);
    }

    // Handle escape key
    if (key.escape) {
      setShowCommandPreview(false);
      setFocusMode("input");
      setSelectedIndex(0);
      return;
    }

    if (focusMode === "input") {
      // Input mode
      if (key.rightArrow && !showCommandPreview) {
        setFocusMode("menu");
        return;
      }

      // Show command preview when typing /
      if (showCommandPreview) {
        if (key.upArrow) {
          setFocusMode("commands");
          const filteredCommands = getFilteredCommands();
          setSelectedIndex(filteredCommands.length - 1); // Go to last command
          return;
        }
        if (key.downArrow) {
          setFocusMode("commands");
          const filteredCommands = getFilteredCommands();
          setSelectedIndex(Math.min(1, filteredCommands.length - 1)); // Go to second command, or stay at 0 if only one command
          return;
        }
      }

      // Handle Tab key for auto-completion
      if (key.tab && showCommandPreview) {
        const filteredCommands = getFilteredCommands();
        if (filteredCommands.length > 0) {
          // Auto-complete to the first matching command (index 0) when in input mode
          const command = filteredCommands[0];
          if (command) {
            // Add space after command name only if it expects arguments
            const newInput = command.args
              ? `/${command.name} `
              : `/${command.name}`;
            setInput(newInput);
            if (filteredCommands.length === 1) {
              // If only one match, hide preview since it's fully completed
              setShowCommandPreview(false);
            }
          }
        }
        return;
      }

      if (key.return) {
        if (input.trim()) {
          const parsed = parseCommandInput(input);
          if (parsed && parsed.isComplete) {
            onCommand(parsed.command, parsed.args ?? undefined);
          } else {
            // Invalid command structure, show help
            onCommand("help");
          }
          setInput("");
          setShowCommandPreview(false);
        }
        return;
      }

      if (key.backspace || key.delete) {
        const newInput = input.slice(0, -1);
        setInput(newInput);
        setShowCommandPreview(newInput.startsWith("/"));
        return;
      }

      if (inputChar && !key.ctrl && !key.meta) {
        const newInput = input + inputChar;
        setInput(newInput);

        // Show command preview when typing /
        if (newInput.startsWith("/")) {
          setShowCommandPreview(true);
          setSelectedIndex(0);
        } else {
          setShowCommandPreview(false);
        }
      }
    } else if (focusMode === "commands") {
      // Command preview navigation mode
      const filteredCommands = getFilteredCommands();

      // Handle Tab key for auto-completion in commands mode
      if (key.tab) {
        const command = filteredCommands[selectedIndex];
        if (command && selectedIndex < filteredCommands.length) {
          // Add space after command name only if it expects arguments
          const newInput = command.args
            ? `/${command.name} `
            : `/${command.name}`;
          setInput(newInput);
          if (filteredCommands.length === 1) {
            setShowCommandPreview(false);
          }
          setFocusMode("input");
          setSelectedIndex(0);
        }
        return;
      }

      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) =>
          Math.min(filteredCommands.length - 1, prev + 1)
        );
      } else if (key.return) {
        const selectedCommand = filteredCommands[selectedIndex];
        if (selectedCommand) {
          setInput(`/${selectedCommand.name} `);
          setFocusMode("input");
          setShowCommandPreview(false);
          setSelectedIndex(0);
        }
      } else if (key.leftArrow || key.rightArrow) {
        setFocusMode("input");
        setSelectedIndex(0);
      }
    } else {
      // Menu mode (original quick actions)
      if (key.leftArrow) {
        setFocusMode("input");
        return;
      }

      if (key.upArrow) {
        setSelectedIndex((prev) => (prev - 1 + quickActions.length) % quickActions.length);
      } else if (key.downArrow) {
        setSelectedIndex((prev) => (prev + 1) % quickActions.length);
      } else if (key.return) {
        const selectedItem = quickActions[selectedIndex];
        if (selectedItem) {
          const commandId = selectedItem.id === "theme" ? "t" : selectedItem.id;
          onCommand(commandId);
        }
      }
    }
  });

  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Main Interface */}
      <Box>
        {/* Left side - Command Input */}
        <CommandInputField input={input} focusMode={focusMode} theme={theme} />

        {/* Right side - Quick Actions */}
        <QuickActions
          focusMode={focusMode}
          selectedIndex={selectedIndex}
          quickActions={quickActions}
          theme={theme}
        />
      </Box>

      {/* Command Preview */}
      {showCommandPreview && (
        <CommandPreviewList
          filteredCommands={getFilteredCommands()}
          selectedIndex={focusMode === "commands" ? selectedIndex : 0}
          theme={theme}
        />
      )}
    </Box>
  );
}
