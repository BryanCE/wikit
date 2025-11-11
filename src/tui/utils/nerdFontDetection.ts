/**
 * Detects if Nerd Fonts are installed on the system
 *
 * Uses the font-list package to check if any Nerd Font is actually installed,
 * regardless of terminal type. This provides universal, accurate detection.
 */

import { getFonts } from 'font-list';

let cachedResult: boolean | null = null;

/**
 * Detect if any Nerd Font is installed on the system
 *
 * Checks for fonts with "nerd font" in their name. Results are cached
 * for performance since font detection is expensive.
 *
 * @returns Promise resolving to true if Nerd Fonts detected, false otherwise
 */
export async function detectNerdFonts(): Promise<boolean> {
  // Use cached result if available
  if (cachedResult !== null) {
    return cachedResult;
  }

  // Manual override via environment variable
  if (process.env.NERD_FONTS === "0" || process.env.NERD_FONTS === "false") {
    cachedResult = false;
    return false;
  }
  if (process.env.NERD_FONTS === "1" || process.env.NERD_FONTS === "true") {
    cachedResult = true;
    return true;
  }

  try {
    // Get all installed fonts
    const fonts = await getFonts();

    // Check if any font contains "nerd font" in its name
    const hasNerdFont = fonts.some(font =>
      font.toLowerCase().includes('nerd font')
    );

    cachedResult = hasNerdFont;
    return hasNerdFont;
  } catch {
    // If font detection fails, default to false (safe fallback)
    cachedResult = false;
    return false;
  }
}
