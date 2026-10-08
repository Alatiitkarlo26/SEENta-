import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PUPLogo from './PUPLogo';
import AccessibilityModal from './AccessibilityModal';
import {
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, role, logout } = useAuth();
  const { isDark, toggleMode, currentPalette } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isA11yModalOpen, setIsA11yModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
        {/* Formal Top University Bar */}
        <div className="bg-theme text-amber-100 text-[11px] py-1.5 px-4 sm:px-8 font-medium tracking-wide flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            <span>Politeknikong Unibersidad ng Pilipinas — Sangay ng Biñan</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-amber-200/90">
            <span>Campus Security Office • Ground Floor Main Building</span>
            <span>•</span>
            <span>8:00 AM – 5:00 PM</span>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* PUP Brand & Logo */}
            <div
              onClick={() => setActiveTab(role === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
              className="flex items-center gap-3.5 cursor-pointer select-none group"
            >
              <PUPLogo className="w-10 h-10 shrink-0 drop-shadow-xs group-hover:scale-105 transition" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-theme transition">
                    SEEN<span className="text-theme">ta</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                    Biñan
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Lost and Found Management System
                </span>
              </div>
            </div>

            {/* Center Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setActiveTab(role === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
                className={`px-4 py-2 rounded-full transition cursor-pointer ${
                  activeTab === 'student-dashboard' || activeTab === 'admin-dashboard'
                    ? 'bg-theme text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('student-dashboard')}
                className="px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Browse Inventory
              </button>
              <button
                onClick={() => setActiveTab('student-dashboard')}
                className="px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Report Lost Item
              </button>
            </nav>

            {/* Right Controls: Theme Buttons + User Card & Logout */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Quick Dark/Light Toggle */}
              <button
                type="button"
                onClick={toggleMode}
                className="p-2 text-slate-500 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 transition" />
                ) : (
                  <Moon className="w-4 h-4 transition" />
                )}
              </button>

              {/* Theme & Accessibility Modal Opener */}
              <button
                type="button"
                onClick={() => setIsA11yModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs"
                title="Theme Colors & Accessibility Options"
                aria-label="Open appearance and accessibility settings"
              >
                <Palette className="w-3.5 h-3.5 text-theme" />
                <span className="hidden lg:inline">{currentPalette.name}</span>
              </button>

              {/* User Identity Pill */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="w-9 h-9 rounded-full bg-theme text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                    <span>{user?.fullName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {user?.studentId} • {user?.roleTitle || 'Iskolar'}
                  </div>
                </div>
              </div>

              {/* Sign Out */}
              <button
                onClick={logout}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Actions: Dark Mode + Theme + Hamburger */}
            <div className="flex sm:hidden items-center gap-1">
              <button
                type="button"
                onClick={toggleMode}
                className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Toggle Mode"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsA11yModalOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Customize Theme"
                aria-label="Customize theme"
              >
                <Palette className="w-5 h-5 text-theme" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 animate-fadeIn">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>{user?.fullName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                  Verified
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user?.studentId}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
            </div>

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab(role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                  activeTab === 'student-dashboard' || activeTab === 'admin-dashboard'
                    ? 'bg-theme text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab('student-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition cursor-pointer"
              >
                Browse Inventory
              </button>
              <button
                onClick={() => {
                  setActiveTab('student-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition cursor-pointer"
              >
                Report Lost Item
              </button>
            </div>

            {/* Appearance & Themes Trigger */}
            <button
              onClick={() => {
                setIsA11yModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-theme" />
                <span>Theme &amp; Accessibility Options</span>
              </span>
              <span className="text-[11px] font-bold text-theme">{currentPalette.name}</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white font-semibold rounded-full text-xs text-center flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Accessibility & Theme Customization Modal */}
      <AccessibilityModal
        isOpen={isA11yModalOpen}
        onClose={() => setIsA11yModalOpen(false)}
      />
    </>
  );
}
