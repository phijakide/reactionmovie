import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
export type RecapFontSize = 'regular' | 'large' | 'xlarge';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  fontSize: RecapFontSize;
  setFontSize: (size: RecapFontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('cinerecap_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Dark mode by default for cinematic theme
  });

  const [fontSize, setFontSizeState] = useState<RecapFontSize>(() => {
    const saved = localStorage.getItem('cinerecap_fontsize');
    if (saved === 'regular' || saved === 'large' || saved === 'xlarge') return saved;
    return 'regular';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cinerecap_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('cinerecap_fontsize', fontSize);
  }, [fontSize]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const setFontSize = (size: RecapFontSize) => {
    setFontSizeState(size);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
