import type { Theme } from "./types";

export const tokyoNightTheme: Theme = {
  name: "Tokyo Night",
  colors: {
    primary: "#7aa2f7", // Tokyo Night blue
    secondary: "#7dcfff", // Tokyo Night cyan
    success: "#9ece6a", // Tokyo Night green
    warning: "#e0af68", // Tokyo Night yellow
    error: "#f7768e", // Tokyo Night red
    info: "#7dcfff", // Tokyo Night cyan
    muted: "#565f89", // Tokyo Night comment
    text: "#c0caf5", // Tokyo Night foreground
    background: "#1a1b26", // Tokyo Night background
    accent: "#bb9af7", // Tokyo Night purple
    danger: "#f7768e", // Tokyo Night red
    highlight: "#ff9e64", // Tokyo Night orange
  },
  backgrounds: {
    primary: "#1a1b26", // Tokyo Night background
    secondary: "#24283b", // Tokyo Night darker
    accent: "#bb9af7", // Tokyo Night purple
    surface: "#1f2335", // Tokyo Night surface
    overlay: "#3b4261", // Tokyo Night selection
  },
};
