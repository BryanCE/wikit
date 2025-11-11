import React from "react";
import { ThemeProvider } from "@/tui/contexts/ThemeContext";
import { IconProvider } from "@/tui/contexts/IconContext";
import { HeaderProvider } from "@/tui/contexts/HeaderContext";
import { FooterProvider } from "@/tui/contexts/FooterContext";
import { EscapeProvider } from "@/tui/contexts/EscapeContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dracula-modified">
      <IconProvider>
        <HeaderProvider>
          <FooterProvider>
            <EscapeProvider>
              {children}
            </EscapeProvider>
          </FooterProvider>
        </HeaderProvider>
      </IconProvider>
    </ThemeProvider>
  );
}
