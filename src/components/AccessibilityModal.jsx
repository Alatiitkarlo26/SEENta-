import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  Laptop,
  Eye,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 transition-colors duration-200">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme text-white flex items-center justify-center shadow-sm">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Accessibility &amp; Appearance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize appearance mode and campus accessibility options.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Appearance Mode (Light / Dark / System) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Appearance Mode</span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('light')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  mode === 'light'
                    ? 'border-theme bg-theme-light dark:bg-slate-800/80 shadow-xs ring-2 ring-theme/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className={`w-5 h-5 mb-1.5 ${mode === 'light' ? 'text-theme' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">Light</span>
                <span className="text-[10px] text-slate-400">Day mode</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('dark')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  mode === 'dark'
                    ? 'border-theme bg-theme-light dark:bg-slate-800/80 shadow-xs ring-2 ring-theme/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className={`w-5 h-5 mb-1.5 ${mode === 'dark' ? 'text-theme' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">Dark</span>
                <span className="text-[10px] text-slate-400">Night mode</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('system')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  mode === 'system'
                    ? 'border-theme bg-theme-light dark:bg-slate-800/80 shadow-xs ring-2 ring-theme/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Laptop className={`w-5 h-5 mb-1.5 ${mode === 'system' ? 'text-theme' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">System</span>
                <span className="text-[10px] text-slate-400">Auto sync</span>
              </button>
            </div>
          </div>

          {/* Section 2: Campus Accessibility Options (NFR-SEEN-0001) */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-emerald-500" />
              <span>Campus Accessibility Options</span>
            </label>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>High-Contrast Mode</span>
                  {highContrast && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                  Sharper text contrast and saturated borders for bright outdoor sunlight on campus.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  highContrast ? 'bg-theme' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Font Size Booster (85% compact, 100% normal, 115% large) */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 text-blue-500" />
                  <span>Text Size Boost</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Scale text size for comfortable viewing or mobile reading.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setFontSize('compact')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    fontSize === 'compact'
                      ? 'bg-theme text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                  title="85% Compact font size"
                >
                  85%
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('normal')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    fontSize === 'normal'
                      ? 'bg-theme text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                  title="100% Standard font size"
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    fontSize === 'large'
                      ? 'bg-theme text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                  title="115% Large font size"
                >
                  115%
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={resetDefaults}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-theme hover:bg-theme-hover text-white text-xs font-bold rounded-full transition shadow-md cursor-pointer active:scale-95"
          >
            Save &amp; Apply
          </button>
        </div>
      </div>
    </div>
  );
}
