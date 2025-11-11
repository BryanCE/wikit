import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { detectNerdFonts } from "@/tui/utils/nerdFontDetection";
import { getMdiIconName, formatIconFallback } from "@/tui/utils/iconFormatter";
import { getNerdFontGlyph } from "@/tui/utils/nerdFontIcons";

interface IconContextType {
  hasNerdFonts: boolean;
  formatIcon: (icon?: string) => string;
}

const IconContext = createContext<IconContextType | undefined>(undefined);

interface IconProviderProps {
  children: ReactNode;
}

export const IconProvider: React.FC<IconProviderProps> = ({ children }) => {
  const [hasNerdFonts, setHasNerdFonts] = useState(false);

  // Detect Nerd Font support on mount
  useEffect(() => {
    void detectNerdFonts().then(detected => {
      setHasNerdFonts(detected);
    });
  }, []);

  /**
   * Format icon for display
   * - If Nerd Fonts available and icon mapped: use Nerd Font glyph
   * - Otherwise: use fallback abbreviation
   */
  const formatIcon = (icon?: string): string => {
    if (!icon) return "";

    const iconName = getMdiIconName(icon);
    if (!iconName) return "";

    // Try Nerd Font first if available
    if (hasNerdFonts) {
      const glyph = getNerdFontGlyph(iconName);
      if (glyph) {
        return `${glyph} `;
      }
    }

    // Fallback to abbreviation
    return formatIconFallback(icon);
  };

  return (
    <IconContext.Provider value={{ hasNerdFonts, formatIcon }}>
      {children}
    </IconContext.Provider>
  );
};

export const useIcon = (): IconContextType => {
  const context = useContext(IconContext);
  if (context === undefined) {
    throw new Error("useIcon must be used within an IconProvider");
  }
  return context;
};
