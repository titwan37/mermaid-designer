"use client";

// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { initMermaid } from '../lib/mermaid-config'; // Added [cite: 11]
import * as React from "react";


const inter = Inter({ subsets: ["latin"] });

export const ThemeContext = React.createContext<{ dark: boolean; toggle: () => void; mounted: boolean }>({
  dark: false,
  toggle: () => { },
  mounted: false
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      setMounted(true);
      await initMermaid();

      // Mirroring simulacrum-client theme logic
      const storedTheme = localStorage.getItem('mermaid-designer-theme');
      if (storedTheme) {
        setDark(storedTheme === 'dark');
      } else {
        const hour = new Date().getHours();
        // Auto-dark from 6 PM (18:00) to 8 AM (08:00)
        const isNight = hour < 8 || hour >= 18;
        if (isNight) {
          setDark(true);
        } else {
          // Default to system preference if it's daytime
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          setDark(prefersDark);
        }
      }
    };
    init();
  }, []);

  const toggle = () => {
    setDark((prev: boolean) => {
      const newVal = !prev;
      localStorage.setItem('mermaid-designer-theme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  React.useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  return (
    <html lang="en" className={dark ? "dark" : ""} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeContext.Provider value={{ dark, toggle, mounted }}>
          {children}
        </ThemeContext.Provider>
      </body>
    </html>
  );
}
