import type { Theme } from "./types";

export const horizonTheme: Theme = {
  name: "Horizon",
  colors: {
    primary: "#E95378", // Horizon bright pink/red
    secondary: "#FAB795", // Horizon apricot
    success: "#29D398", // Horizon teal
    warning: "#FAC39A", // Horizon peach
    error: "#E95378", // Horizon pink/red
    info: "#26BBD9", // Horizon cyan
    muted: "#6C6F93", // Horizon muted
    text: "#F0F0F0", // Horizon foreground
    background: "#1C1E26", // Horizon background
    accent: "#B877DB", // Horizon purple
    danger: "#E95378", // Horizon pink/red
    highlight: "#FAB795", // Horizon apricot
  },
  backgrounds: {
    primary: "#1C1E26", // Horizon background
    secondary: "#232530", // Slightly lighter
    accent: "#B877DB", // Horizon purple
    surface: "#16161C", // Darker than background
    overlay: "#232530", // Selection background
  },
};
