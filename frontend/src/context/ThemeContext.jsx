// src/context/ThemeContext.jsx
// Provides dark mode toggle across the entire app

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    // Load from localStorage on first render
    const saved = localStorage.getItem('ew_darkmode');
    if (saved !== null) return saved === 'true';
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply dark mode class to document root
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
    localStorage.setItem('ew_darkmode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(v => !v);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);