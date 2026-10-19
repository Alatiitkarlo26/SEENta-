import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SeentaLogo from './SeentaLogo';
import AccessibilityModal from './AccessibilityModal';
import NotificationsModal from './NotificationsModal';
import ReportLostItemModal from './ReportLostItemModal';
import { itemService } from '../services/itemService';
import {
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Sun,
  Moon,
  Eye,
  Bell
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, role, logout } = useAuth();
  const { isDark, toggleMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isA11yModalOpen, setIsA11yModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Active section for navigation: 'home' | 'inventory' | 'about-us'
  const [activeNav, setActiveNav] = useState(() => (activeTab === 'about-us' ? 'about-us' : 'home'));

  // Refs for tracking button geometries for the sliding indicator
  const navRef = useRef(null);
  const homeBtnRef = useRef(null);
  const inventoryBtnRef = useRef(null);
  const aboutBtnRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await itemService.getNotifications(user.id);
      const unread = (data || []).filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Synchronize indicator position with activeNav
  const updateIndicator = useCallback(() => {
    let targetRef = null;
    if (activeNav === 'home') targetRef = homeBtnRef.current;
    else if (activeNav === 'inventory') targetRef = inventoryBtnRef.current;
    else if (activeNav === 'about-us') targetRef = aboutBtnRef.current;

    if (targetRef && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const btnRect = targetRef.getBoundingClientRect();
      setIndicator({
        left: btnRect.left - navRect.left,
        width: btnRect.width,
        opacity: 1
      });
    } else {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeNav]);

  useEffect(() => {
    updateIndicator();
    const timer = setTimeout(updateIndicator, 60);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator]);

  // Sync activeNav with activeTab when routed externally
  useEffect(() => {
    if (activeTab === 'about-us') {
      setActiveNav('about-us');
    } else if (activeNav === 'about-us') {
      setActiveNav('home');
    }
  }, [activeTab]);

  // Scroll spy: smoothly update activeNav between 'home' and 'inventory' as user scrolls
  useEffect(() => {
    if (activeTab === 'about-us') return;

    const handleScroll = () => {
      const inventoryEl = document.getElementById('inventory-feed');
      if (!inventoryEl) return;

      const rect = inventoryEl.getBoundingClientRect();
      // If the inventory feed section is at or above 240px from viewport top
      if (rect.top <= 240) {
        setActiveNav((prev) => (prev !== 'inventory' ? 'inventory' : prev));
      } else {
        setActiveNav((prev) => (prev !== 'home' ? 'home' : prev));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const handleHomeClick = () => {
    setActiveNav('home');
    if (activeTab !== 'student-dashboard' && role !== 'admin') {
      setActiveTab(role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrowseInventory = () => {
    setActiveNav('inventory');
    if (activeTab !== 'student-dashboard' && role !== 'admin') {
      setActiveTab('student-dashboard');
      setTimeout(() => {
        document.getElementById('inventory-feed')?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById('inventory-feed')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAboutUsClick = () => {
    setActiveNav('about-us');
    setActiveTab('about-us');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
        {/* Main Header Bar */}
        <div className="w-full flex items-center justify-between h-18 pl-6 sm:pl-10 lg:pl-16 pr-4 sm:pr-6 lg:pr-8">
          {/* Left Section: SEENta Brand + Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* SEENta Brand */}
            <div
              onClick={handleHomeClick}
              className="flex flex-col cursor-pointer select-none group"
            >
              <SeentaLogo size="md" showSubtitle={true} />
            </div>

            {/* Frameless Navigation with Smoothly Transferring Red Shade */}
            <nav
              ref={navRef}
              className="relative hidden md:flex items-center gap-1 sm:gap-1.5"
              aria-label="Main Navigation"
            >
              {/* Animated Sliding Red Shade Pill */}
              <span
                className="absolute top-0 bottom-0 rounded-full bg-red-500/[0.08] dark:bg-red-500/[0.14] border border-red-500/20 dark:border-red-500/30 shadow-2xs pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: `translateX(${indicator.left}px)`,
                  width: `${indicator.width}px`,
                  opacity: indicator.opacity
                }}
                aria-hidden="true"
              />

              {/* Home */}
              <button
                ref={homeBtnRef}
                type="button"
                onClick={handleHomeClick}
                className={`relative z-10 px-4 py-1.5 rounded-full text-xs transition-colors duration-200 cursor-pointer select-none text-center flex items-center justify-center active:scale-95 ${
                  activeNav === 'home'
                    ? 'text-red-800 dark:text-red-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <span>Home</span>
              </button>

              {/* Browse Inventory */}
              <button
                ref={inventoryBtnRef}
                type="button"
                onClick={handleBrowseInventory}
                className={`relative z-10 px-4 py-1.5 rounded-full text-xs transition-colors duration-200 cursor-pointer select-none text-center flex items-center justify-center active:scale-95 ${
                  activeNav === 'inventory'
                    ? 'text-red-800 dark:text-red-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <span>Browse Inventory</span>
              </button>

              {/* Report Lost Item */}
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="relative z-10 px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 cursor-pointer select-none text-center flex items-center justify-center active:scale-95"
              >
                <span>Report Lost Item</span>
              </button>

              {/* About Us */}
              <button
                ref={aboutBtnRef}
                type="button"
                onClick={handleAboutUsClick}
                className={`relative z-10 px-4 py-1.5 rounded-full text-xs transition-colors duration-200 cursor-pointer select-none text-center flex items-center justify-center active:scale-95 ${
                  activeNav === 'about-us'
                    ? 'text-red-800 dark:text-red-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <span>About Us</span>
              </button>
            </nav>
          </div>

            {/* Right Controls: Theme Buttons + User Card & Logout */}
            <div className="hidden sm:flex items-center gap-3 -mr-1 sm:-mr-2">
              {/* Quick Dark/Light Toggle */}
              <button
                type="button"
                onClick={toggleMode}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition cursor-pointer shadow-2xs active:scale-95"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 transition" />
                ) : (
                  <Moon className="w-4 h-4 transition" />
                )}
              </button>

              {/* Accessibility Modal Opener */}
              <button
                type="button"
                onClick={() => setIsA11yModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs"
                title="Accessibility & Appearance"
                aria-label="Open appearance and accessibility settings"
              >
                <Eye className="w-3.5 h-3.5 text-theme" />
                <span className="hidden lg:inline">Accessibility</span>
              </button>

              {/* Alerts / Notifications Modal Opener (next to profile beside accessibility) */}
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs group"
                title="View Match Alerts & Notifications"
                aria-label="Open appearance and alerts"
              >
                <Bell className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline">Alerts</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-white leading-tight">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Identity Pill */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="w-9 h-9 rounded-full bg-theme text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                    <span>{user?.fullName}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Verified Iskolar
                    </span>
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

            {/* Mobile Actions: Dark Mode + Theme + Alerts + Hamburger */}
            <div className="flex sm:hidden items-center gap-1 -mr-1 sm:-mr-2">
              <button
                type="button"
                onClick={toggleMode}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer shadow-2xs active:scale-95"
                title="Toggle Mode"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsA11yModalOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Accessibility & Appearance"
                aria-label="Open appearance and accessibility settings"
              >
                <Eye className="w-5 h-5 text-theme" />
              </button>

              <button
                type="button"
                onClick={() => setIsNotifModalOpen(true)}
                className="relative p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Alerts & Notifications"
                aria-label="Open alerts"
              >
                <Bell className="w-5 h-5 text-amber-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                )}
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

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 animate-fadeIn">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>{user?.fullName}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Verified Iskolar
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user?.studentId}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
            </div>

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleHomeClick();
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs text-left transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-95 ${
                  activeNav === 'home'
                    ? 'bg-red-500/[0.08] dark:bg-red-500/[0.14] text-red-800 dark:text-red-300 font-semibold border border-red-500/20 dark:border-red-500/30 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent font-medium'
                }`}
              >
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleBrowseInventory();
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs text-left transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-95 ${
                  activeNav === 'inventory'
                    ? 'bg-red-500/[0.08] dark:bg-red-500/[0.14] text-red-800 dark:text-red-300 font-semibold border border-red-500/20 dark:border-red-500/30 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent font-medium'
                }`}
              >
                <span>Browse Inventory</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsReportModalOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 text-left transition-all duration-200 ease-out cursor-pointer active:scale-95 border border-transparent"
              >
                <span>Report Lost Item</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAboutUsClick();
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs text-left transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-95 ${
                  activeNav === 'about-us'
                    ? 'bg-red-500/[0.08] dark:bg-red-500/[0.14] text-red-800 dark:text-red-300 font-semibold border border-red-500/20 dark:border-red-500/30 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent font-medium'
                }`}
              >
                <span>About Us</span>
              </button>
            </div>

            {/* Alerts & Notifications Trigger */}
            <button
              onClick={() => {
                setIsNotifModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Alerts &amp; Notifications</span>
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </button>

            {/* Appearance & Themes Trigger */}
            <button
              onClick={() => {
                setIsA11yModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-theme" />
                <span>Accessibility &amp; Appearance</span>
              </span>
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

      {/* Notifications & Match Alerts Modal */}
      <NotificationsModal
        isOpen={isNotifModalOpen}
        onClose={() => {
          setIsNotifModalOpen(false);
          fetchUnreadCount();
        }}
      />

      {/* Quick Report Lost Item Modal */}
      <ReportLostItemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportCreated={() => {
          setIsReportModalOpen(false);
        }}
      />
    </>
  );
}
