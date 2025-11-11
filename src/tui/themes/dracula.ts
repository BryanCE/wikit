import type { Theme } from "./types";

export const draculaTheme: Theme = {
  name: "Dracula",
  colors: {
    primary: "#BD93F9", // Dracula purple
    secondary: "#8BE9FD", // Dracula cyan
    success: "#50FA7B", // Dracula green
    warning: "#F1FA8C", // Dracula yellow
    error: "#FF5555", // Dracula red
    info: "#8BE9FD", // Dracula cyan
    muted: "#6272A4", // Dracula comment
    text: "#F8F8F2", // Dracula foreground
    background: "#282A36", // Dracula background
    accent: "#FF79C6", // Dracula pink
    danger: "#FF5555", // Dracula red
    highlight: "#FFB86C", // Dracula orange
  },
  backgrounds: {
    primary: "#282A36", // Dracula background
    secondary: "#44475A", // Dracula current line
    accent: "#BD93F9", // Dracula purple
    surface: "#21222C", // Darker than background
    overlay: "#44475A", // Dracula current line
  },
};

export const draculaModifiedTheme: Theme = {
  name: "Dracula Modified",
  colors: {
    primary: "#BD93F9", // Dracula purple
    secondary: "#8BE9FD", // Dracula cyan
    success: "#50FA7B", // Dracula green
    warning: "#FF1493", // Deep pink (changed from yellow)
    error: "#FF5555", // Dracula red
    info: "#8BE9FD", // Dracula cyan
    muted: "#6272A4", // Dracula comment
    text: "#F8F8F2", // Dracula foreground
    background: "#282A36", // Dracula background
    accent: "#FF79C6", // Dracula pink
    danger: "#FF5555", // Dracula red
    highlight: "#FFB86C", // Dracula orange
  },
  backgrounds: {
    primary: "#282A36", // Dracula background
    secondary: "#44475A", // Dracula current line
    accent: "#BD93F9", // Dracula purple
    surface: "#21222C", // Darker than background
    overlay: "#44475A", // Dracula current line
  },
};
