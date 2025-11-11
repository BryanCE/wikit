export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    muted: string;
    text: string;
    background: string;
    accent: string;
    danger: string;
    highlight: string;
  };
  backgrounds: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    overlay: string;
  };
}

export type ThemeName =
  | "dracula"
  | "dracula-modified"
  | "tokyo-night"
  | "duskfox"
  | "duskfox-light"
  | "one-monokai"
  | "scarlet-protocol"
  | "horizon"
  | "ils"
  | "synthWave84";
