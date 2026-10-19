import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  Laptop,
  PersonStanding,
  Contrast,
  Type,
  RotateCcw,
  X
} from 'lucide-react';

export default function AccessibilityModal({ isOpen, onClose }) {
  const {
    mode,
    highContrast,
    fontSize,
    setMode,
    setHighContrast,
    setFontSize,
    resetDefaults
  } = useTheme();

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-fadeIn"
    >
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card with Apple / Mobbin Aesthetic */}
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-900/15 dark:shadow-black/70 overflow-hidden z-10 animate-modalEnter transition-colors duration-200">
        {/* Header Bar */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-theme/10 dark:bg-theme/20 text-theme flex items-center justify-center shrink-0 transition-transform active:scale-95">
              <PersonStanding className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="a11y-modal-title"
                className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight"
              >
                Appearance &amp; Accessibility
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize display mode, contrast, and typography
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer active:scale-90"
            title="Close"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Section 1: Appearance Mode (Light / Dark / System) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Appearance Mode
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                {mode === 'system' ? 'System Sync' : `${mode} Mode`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={(e) => setMode('light', e)}
                className={`group p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center gap-2.5 active:scale-[0.97] ${
                  mode === 'light'
                    ? 'border-theme bg-theme/[0.04] dark:bg-theme/[0.08] ring-2 ring-theme/25 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Mini Preview Frame */}
                <div className="w-full h-12 rounded-xl bg-slate-100 border border-slate-200/90 p-1.5 flex flex-col justify-between overflow-hidden shadow-2xs group-hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <div className="w-8 h-1 rounded-full bg-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-3/4 rounded bg-white shadow-2xs" />
                    <div className="h-1.5 w-1/2 rounded bg-slate-200" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Sun className={`w-3.5 h-3.5 ${mode === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span>Light</span>
                </div>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={(e) => setMode('dark', e)}
                className={`group p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center gap-2.5 active:scale-[0.97] ${
                  mode === 'dark'
                    ? 'border-theme bg-theme/[0.04] dark:bg-theme/[0.08] ring-2 ring-theme/25 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Mini Preview Frame */}
                <div className="w-full h-12 rounded-xl bg-slate-950 border border-slate-800 p-1.5 flex flex-col justify-between overflow-hidden shadow-2xs group-hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <div className="w-8 h-1 rounded-full bg-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-3/4 rounded bg-slate-800" />
                    <div className="h-1.5 w-1/2 rounded bg-slate-700/60" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Moon className={`w-3.5 h-3.5 ${mode === 'dark' ? 'text-theme' : 'text-slate-400'}`} />
                  <span>Dark</span>
                </div>
              </button>

              {/* System Mode Card */}
              <button
                type="button"
                onClick={(e) => setMode('system', e)}
                className={`group p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center gap-2.5 active:scale-[0.97] ${
                  mode === 'system'
                    ? 'border-theme bg-theme/[0.04] dark:bg-theme/[0.08] ring-2 ring-theme/25 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Mini Preview Frame (Split) */}
                <div className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs flex group-hover:scale-[1.02] transition-transform">
                  <div className="w-1/2 bg-slate-100 p-1.5 flex flex-col justify-between border-r border-slate-200/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <div className="h-1.5 w-full rounded bg-white shadow-2xs" />
                  </div>
                  <div className="w-1/2 bg-slate-950 p-1.5 flex flex-col justify-between">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 ml-auto" />
                    <div className="h-1.5 w-full rounded bg-slate-800" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Laptop className={`w-3.5 h-3.5 ${mode === 'system' ? 'text-theme' : 'text-slate-400'}`} />
                  <span>System</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Readability & Contrast (Apple Inset Grouped) */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Readability &amp; Contrast
            </span>

            <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl divide-y divide-slate-200/60 dark:divide-slate-800/60 overflow-hidden">
              {/* High Contrast Mode Row */}
              <div className="flex items-center justify-between p-3.5 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Contrast className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>High-Contrast Mode</span>
                      {highContrast && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      Crisper borders and higher contrast for outdoor campus sunlight
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={highContrast}
                  onClick={() => setHighContrast(!highContrast)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none active:scale-95 ${
                    highContrast ? 'bg-theme' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle High-Contrast Mode"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                      highContrast ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Font Size Scaling Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Text Scaling
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      Adjust interface font size for comfortable reading
                    </p>
                  </div>
                </div>

                {/* Apple Segmented Pill */}
                <div className="inline-flex items-center p-1 bg-slate-200/70 dark:bg-slate-700/60 rounded-xl self-end sm:self-auto gap-0.5">
                  {[
                    { key: 'compact', label: '85%', title: 'Compact font size' },
                    { key: 'normal', label: '100%', title: 'Standard font size' },
                    { key: 'large', label: '115%', title: 'Large font size' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFontSize(item.key)}
                      title={item.title}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer active:scale-95 ${
                        fontSize === item.key
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
          <button
            type="button"
            onClick={resetDefaults}
            className="group inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium transition-colors cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-45 transition-transform duration-200" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-full transition-all shadow-sm cursor-pointer active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
