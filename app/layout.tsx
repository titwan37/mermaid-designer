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
      await initMermaid(); // Initialize mermaid settings and register ZenUML
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDark(prefersDark);
    };
    init();
  }, []);

  const toggle = () => setDark((prev: boolean) => !prev);

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
