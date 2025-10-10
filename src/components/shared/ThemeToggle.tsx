"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-300 dark:ring-gray-700 ${className}`}
      aria-label={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
      title={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-gray-900 dark:text-gray-100" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-400" />
      )}
    </button>
  );
}
