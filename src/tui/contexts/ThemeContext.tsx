import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { type Theme, type ThemeName, getTheme, themeNames } from "@/tui/theme";
import { getDefaultTheme, setDefaultTheme as saveDefaultTheme } from "@/config/dynamicConfig";

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  toggleTheme: () => void;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "dracula-modified",
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);

  const theme = getTheme(themeName);

  // Load saved theme on mount
  useEffect(() => {
    let isMounted = true;

    getDefaultTheme()
      .then((savedTheme) => {
        if (isMounted && savedTheme && themeNames.includes(savedTheme as ThemeName)) {
          setThemeName(savedTheme as ThemeName);
        }
      })
      .catch(() => {
        // If loading fails, use default
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = () => {
    const currentIndex = themeNames.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    const newTheme = themeNames[nextIndex]!;
    setThemeName(newTheme);

    // Save to config
    void saveDefaultTheme(newTheme);
  };

  const setTheme = (newName: ThemeName) => {
    setThemeName(newName);

    // Save to config
    void saveDefaultTheme(newName);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeName,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
