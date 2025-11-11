import type { Theme } from "./types";

export const oneMonokaiTheme: Theme = {
  name: "One Monokai",
  colors: {
    primary: "#66D9EF", // Monokai blue
    secondary: "#A6E22E", // Monokai green
    success: "#A6E22E", // Monokai green
    warning: "#E6DB74", // Monokai yellow
    error: "#F92672", // Monokai pink
    info: "#66D9EF", // Monokai blue
    muted: "#75715E", // Monokai comment
    text: "#F8F8F2", // Monokai white
    background: "#272822", // Monokai background
    accent: "#AE81FF", // Monokai purple
    danger: "#F92672", // Monokai pink
    highlight: "#FD971F", // Monokai orange
  },
  backgrounds: {
    primary: "#272822", // Monokai background
    secondary: "#3E3D32", // Lighter shade
    accent: "#AE81FF", // Monokai purple
    surface: "#1E1F1C", // Darker than background
    overlay: "#49483E", // Selection color
  },
};
