// client-user/src/shared/context/ThemeContext.jsx
// Contexto de tema claro/oscuro para toda la app móvil, equivalente al
// localStorage + data-theme de client-admin (web) pero para React Native:
// persiste la preferencia con AsyncStorage y expone { colors, isDark, toggleTheme }.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLORS, LIGHT_COLORS } from '../constants/theme.js';

const THEME_KEY = 'alertagt-theme';
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Oscuro por defecto: es la paleta con la que se diseñó originalmente la app.
  const [isDark, setIsDark] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') setIsDark(saved === 'dark');
      } finally {
        setHasHydrated(true);
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const value = useMemo(
    () => ({ colors, isDark, toggleTheme, hasHydrated }),
    [colors, isDark, toggleTheme, hasHydrated]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
};

export default ThemeContext;
