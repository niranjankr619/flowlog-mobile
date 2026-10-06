"use client";

import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";
import { useApp } from "../../lib/AppContext";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useApp();
  
  // Check if dark mode is active
  const isDarkMode = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": isDarkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 1)",
          "--normal-text": isDarkMode ? "#FFFFFF" : "#000000",
          "--normal-border": isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.15)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };