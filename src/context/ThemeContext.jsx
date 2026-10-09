import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { THEME_PALETTES } from '../constants/themes';

const STORAGE_KEY = 'seenta_theme_settings';

const ThemeContext = createContext(null);

function getInitialSettings(userEmail = null) {
  try {
    // 1. Try reading user-specific settings first if userEmail provided
    if (userEmail) {
      const userSaved = localStorage.getItem(`seenta_theme_settings_${userEmail}`);
      if (userSaved) return JSON.parse(userSaved);
    }
    // 2. Fall back to generic client saved settings
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Could not read saved theme settings:', err);
  }

  // Fallback defaults
  return {
    mode: 'light', // 'light' | 'dark' | 'system'
    themeColor: 'maroon',
    highContrast: false,
    fontSize: 'normal' // 'normal' | 'large'
  };
}

export function ThemeProvider({ children }) {
  const auth = useAuth();
  const userEmail = auth?.user?.email || null;
  const [settings, setSettings] = useState(() => getInitialSettings(userEmail));

  // When a user logs in or switches, load their saved preferences automatically
  useEffect(() => {
    if (!userEmail) return;
    try {
      const userSaved = localStorage.getItem(`seenta_theme_settings_${userEmail}`);
      if (userSaved) {
        setSettings(JSON.parse(userSaved));
      }
    } catch (e) {
      console.warn('Failed to load user theme preference:', e);
    }
  }, [userEmail]);

  const { mode, themeColor, highContrast, fontSize } = settings;

  // Compute whether dark mode is currently active (taking 'system' into account)
  const isSystemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = mode === 'dark' || (mode === 'system' && isSystemDark);

  // Apply DOM classes, data attributes, and CSS variables
  useEffect(() => {
    const root = document.documentElement;

    // 1. Dark Mode Class
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 2. High Contrast Mode
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 3. Font Size Scaling (85% compact, 100% normal, 115% large)
    root.classList.remove('font-compact', 'font-large');
    if (fontSize === 'compact' || fontSize === '85' || fontSize === 'small') {
      root.classList.add('font-compact');
    } else if (fontSize === 'large' || fontSize === '115') {
      root.classList.add('font-large');
    }

    // 4. Set Theme Color Attribute
    root.setAttribute('data-theme', themeColor);

    // Save to localStorage (both global client preference and user profile)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      if (userEmail) {
        localStorage.setItem(`seenta_theme_settings_${userEmail}`, JSON.stringify(settings));
      }
    } catch (e) {
      console.warn('Failed to persist theme settings:', e);
    }
  }, [settings, isDark, mode, themeColor, highContrast, fontSize, userEmail]);

  // Listen to OS system color-scheme changes if mode is set to 'system'
  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Force re-render to update isDark
      setSettings((prev) => ({ ...prev }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const setMode = (newMode) => {
    setSettings((prev) => ({ ...prev, mode: newMode }));
  };

  const setThemeColor = (newColor) => {
    setSettings((prev) => ({ ...prev, themeColor: newColor }));
  };

  const setHighContrast = (val) => {
    setSettings((prev) => ({ ...prev, highContrast: typeof val === 'function' ? val(prev.highContrast) : val }));
  };

  const setFontSize = (newSize) => {
    setSettings((prev) => ({ ...prev, fontSize: newSize }));
  };

  const toggleMode = () => {
    setSettings((prev) => ({
      ...prev,
      mode: isDark ? 'light' : 'dark'
    }));
  };

  const resetDefaults = () => {
    setSettings({
      mode: 'light',
      themeColor: 'maroon',
      highContrast: false,
      fontSize: 'normal'
    });
  };

  const currentPalette = THEME_PALETTES.find((p) => p.id === themeColor) || THEME_PALETTES[0];

  return (
    <ThemeContext.Provider
      value={{
        mode,
        themeColor,
        highContrast,
        fontSize,
        isDark,
        currentPalette,
        palettes: THEME_PALETTES,
        setMode,
        setThemeColor,
        setHighContrast,
        setFontSize,
        toggleMode,
        resetDefaults
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
