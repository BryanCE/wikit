export type { Theme, ThemeName } from "./themes/types";
export { draculaTheme, draculaModifiedTheme } from "./themes/dracula";
export { tokyoNightTheme } from "./themes/tokyoNight";
export { duskfoxTheme, duskfoxLightTheme } from "./themes/duskfox";
export { oneMonokaiTheme } from "./themes/monokai";
export { scarletProtocolTheme } from "./themes/scarletProtocol";
export { horizonTheme } from "./themes/horizon";
export { ilsTheme } from "./themes/ilsTheme";

import type { Theme, ThemeName } from "./themes/types";
import { draculaTheme, draculaModifiedTheme } from "./themes/dracula";
import { tokyoNightTheme } from "./themes/tokyoNight";
import { duskfoxTheme, duskfoxLightTheme } from "./themes/duskfox";
import { oneMonokaiTheme } from "./themes/monokai";
import { scarletProtocolTheme } from "./themes/scarletProtocol";
import { horizonTheme } from "./themes/horizon";
import { ilsTheme } from "./themes/ilsTheme";
import { synthWave84 } from "./themes/synthwave";

export const themes: Record<ThemeName, Theme> = {
  dracula: draculaTheme,
  "dracula-modified": draculaModifiedTheme,
  "tokyo-night": tokyoNightTheme,
  duskfox: duskfoxTheme,
  "duskfox-light": duskfoxLightTheme,
  "one-monokai": oneMonokaiTheme,
  "scarlet-protocol": scarletProtocolTheme,
  horizon: horizonTheme,
  ils: ilsTheme,
  synthWave84: synthWave84,
};

export const themeNames: ThemeName[] = [
  "dracula",
  "dracula-modified",
  "tokyo-night",
  "duskfox",
  "duskfox-light",
  "one-monokai",
  "scarlet-protocol",
  "horizon",
  "ils",
  "synthWave84",
];

export const getTheme = (name: ThemeName): Theme => {
  return themes[name];
};
