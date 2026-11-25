import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightPalette, darkPalette, ThemeMode } from '../theme/tokens';
import { getThemePreference, setThemePreference } from '../storage';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  palette: typeof lightPalette;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  isDark: false,
  palette: lightPalette,
  setThemeMode: async () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    getThemePreference().then(setThemeModeState);
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await setThemePreference(mode);
  };

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const activePalette = isDark ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        palette: activePalette,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

