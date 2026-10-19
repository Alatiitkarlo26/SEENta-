import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
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

  const isTransitioningRef = useRef(false);

  const executeThemeTransition = (newMode, event) => {
    if (isTransitioningRef.current) return;

    const isSystemDarkNow = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextIsDark = newMode === 'dark' || (newMode === 'system' && isSystemDarkNow);

    // If active appearance doesn't change or prefers reduced motion, toggle immediately
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (nextIsDark === isDark || prefersReducedMotion) {
      setSettings((prev) => ({ ...prev, mode: newMode }));
      return;
    }

    // Determine circular origin (x, y) starting on the icon
    let x = typeof window !== 'undefined' ? Math.round(window.innerWidth - 60) : 0;
    let y = 36;

    if (event) {
      if (event.currentTarget && typeof event.currentTarget.getBoundingClientRect === 'function') {
        const rect = event.currentTarget.getBoundingClientRect();
        x = Math.round(rect.left + rect.width / 2);
        y = Math.round(rect.top + rect.height / 2);
      } else if (typeof event.clientX === 'number' && event.clientX > 0) {
        x = Math.round(event.clientX);
        y = Math.round(event.clientY);
      }
    }

    const endRadius = typeof window !== 'undefined'
      ? Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
      : 1200;

    // 1. Modern View Transitions API with circular clipPath reveal
    if (typeof document !== 'undefined' && document.startViewTransition) {
      isTransitioningRef.current = true;
      try {
        const transition = document.startViewTransition(() => {
          flushSync(() => {
            setSettings((prev) => ({
              ...prev,
              mode: newMode
            }));
          });
        });

        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`
              ]
            },
            {
              duration: 650,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              pseudoElement: '::view-transition-new(root)'
            }
          );
        });

        transition.finished.finally(() => {
          isTransitioningRef.current = false;
        });
        return;
      } catch (err) {
        console.warn('View transition failed, falling back:', err);
        isTransitioningRef.current = false;
      }
    }

    // 2. Pure JavaScript Ripple Fallback (For browsers without View Transitions)
    if (typeof document !== 'undefined') {
      isTransitioningRef.current = true;
      const ripple = document.createElement('div');
      ripple.className = 'theme-circle-ripple';
      ripple.style.position = 'fixed';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = '24px';
      ripple.style.height = '24px';
      ripple.style.borderRadius = '50%';
      ripple.style.transform = 'translate(-50%, -50%) scale(1)';
      ripple.style.backgroundColor = nextIsDark ? '#090d16' : '#f8fafc';
      ripple.style.zIndex = '999999';
      ripple.style.pointerEvents = 'none';
      ripple.style.boxShadow = nextIsDark ? '0 0 25px rgba(0,0,0,0.5)' : '0 0 25px rgba(255,255,255,0.7)';
      ripple.style.transition = 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms ease';
      document.body.appendChild(ripple);

      requestAnimationFrame(() => {
        const scale = (endRadius * 2.2) / 24;
        ripple.style.transform = `translate(-50%, -50%) scale(${scale})`;
        setTimeout(() => {
          setSettings((prev) => ({ ...prev, mode: newMode }));
          ripple.style.opacity = '0';
          setTimeout(() => {
            if (ripple.parentNode) ripple.remove();
            isTransitioningRef.current = false;
          }, 300);
        }, 450);
      });
      return;
    }

    setSettings((prev) => ({ ...prev, mode: newMode }));
  };

  const setMode = (newMode, event) => {
    executeThemeTransition(newMode, event);
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

  const toggleMode = (event) => {
    const nextMode = isDark ? 'light' : 'dark';
    executeThemeTransition(nextMode, event);
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
