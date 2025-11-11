/**
 * Nerd Font Material Design Icon mappings
 *
 * Maps MDI icon names to their Nerd Font unicode codepoints.
 * Based on Nerd Fonts v3.0+ Material Design Icons (nf-md-*)
 *
 * Reference: https://www.nerdfonts.com/cheat-sheet
 */

export const NERD_FONT_MDI_MAP: Record<string, string> = {
  // Common navigation icons
  "atlassian": "\uef32",
  "home": "\u{F02D2}",
  "file": "\u{F0214}",
  "folder": "\u{F024B}",
  "link": "\u{F0337}",
  "menu": "\u{F035C}",
  "cog": "\u{F0493}",
  "account": "\u{F0004}",
  "book": "\u{F00BF}",

  // Tools and actions
  "wrench": "\u{F0546}",
  "hammer": "\u{F0594}",
  "settings": "\u{F0493}",
  "pencil": "\u{F03EB}",
  "plus": "\u{F0415}",
  "minus": "\u{F0374}",
  "delete": "\u{F01B4}",
  "trash": "\u{F0A79}",

  // Information and help
  "information": "\u{F02FC}",
  "help": "\u{F02D6}",
  "alert": "\u{F0026}",
  "lightbulb": "\u{F0336}",

  // Documents and files
  "file-document": "\u{F0219}",
  "file-code": "\u{F022E}",
  "file-pdf": "\u{F0225}",
  "note": "\u{F039B}",
  "clipboard": "\u{F0147}",

  // Navigation and arrows
  "arrow-right": "\u{F0054}",
  "arrow-left": "\u{F004D}",
  "arrow-up": "\u{F005D}",
  "arrow-down": "\u{F0045}",
  "chevron-right": "\u{F0142}",
  "chevron-left": "\u{F0141}",

  // Status and indicators
  "check": "\u{F012C}",
  "close": "\u{F0156}",
  "star": "\u{F04CE}",
  "heart": "\u{F02D1}",

  // Communication
  "email": "\u{F01EE}",
  "phone": "\u{F03F2}",
  "message": "\u{F0361}",

  // Media
  "image": "\u{F02E5}",
  "video": "\u{F0567}",
  "music": "\u{F075A}",

  // Other common icons
  "calendar": "\u{F00ED}",
  "clock": "\u{F0954}",
  "map": "\u{F0350}",
  "chart": "\u{F0127}",
  "table": "\u{F04D0}",
  "view-list": "\u{F0547}",
  "view-grid": "\u{F0543}",
};

/**
 * Get Nerd Font glyph for an MDI icon name
 * @param iconName - Icon name without mdi- prefix (e.g., "atlassian")
 * @returns Unicode glyph string or null if not found
 */
export function getNerdFontGlyph(iconName: string): string | null {
  return NERD_FONT_MDI_MAP[iconName] ?? null;
}

/**
 * Check if an icon name has a Nerd Font mapping
 */
export function hasNerdFontGlyph(iconName: string): boolean {
  return iconName in NERD_FONT_MDI_MAP;
}
