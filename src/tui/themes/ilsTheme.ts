import type { Theme } from "./types";

export const ilsTheme: Theme = {
  name: "ILS",
  colors: {
    primary: "#81a33e", // ILS green
    secondary: "#50622d", // ILS muted green
    success: "#81a33e", // ILS green
    warning: "#c2c421", // ILS yellow (from chart-4)
    error: "#ef4444", // ILS red
    info: "#3e4fa3", // ILS blue (from chart-1)
    muted: "#50622d", // ILS muted foreground
    text: "#262626", // ILS foreground
    background: "#ffffff", // ILS background
    accent: "#c5e486", // ILS accent green
    danger: "#ef4444", // ILS red
    highlight: "#b2d963", // ILS sidebar accent
  },
  backgrounds: {
    primary: "#333333", // ILS background
    secondary: "#000000ff", // ILS muted/sidebar
    accent: "#8ab13cff", // ILS accent green
    surface: "#1f1f1fff", // ILS secondary
    overlay: "#333333", // ILS muted
  },
};
