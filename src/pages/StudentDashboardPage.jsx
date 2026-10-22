import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import campusBg from '../assets/pup-binan-campus.jpg';
import OutlookSimulationModal from '../components/OutlookSimulationModal';
import PostFoundItemModal from '../components/PostFoundItemModal';
import ReportLostItemModal from '../components/ReportLostItemModal';
import ItemDetailModal from '../components/ItemDetailModal';
import NotificationsModal from '../components/NotificationsModal';
import { itemService } from '../services/itemService';
import { authService } from '../services/authService';
import { otpService } from '../services/otpService';
import { ITEM_CATEGORIES } from '../constants/itemPresets';
import {
  Search,
  Package,
  MapPin,
  Calendar,
  Sparkles,
  Camera,
  FileText,
  Tag,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  X,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { ItemCardSkeleton, LostReportCardSkeleton } from '../components/Skeleton';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('campus-feed'); // 'campus-feed' | 'my-found' | 'my-lost'

  // Data states
  const [foundItems, setFoundItems] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showOutlookModal, setShowOutlookModal] = useState(false);
  const [showPostFoundModal, setShowPostFoundModal] = useState(false);
  const [showReportLostModal, setShowReportLostModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);

  const latestEmail = otpService.getLatestEmail(user?.email);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [foundData, lostData, notifsData, usersData] = await Promise.all([
        itemService.getFoundPosts(),
        user?.id ? itemService.getLostReports({ userId: user.id }) : [],
        user?.id ? itemService.getNotifications(user.id) : [],
        authService.getAllUsers()
      ]);

      setFoundItems(foundData || []);
      setLostReports(lostData || []);
      setNotifications(notifsData || []);
      setActiveUsersCount(Array.isArray(usersData) && usersData.length > 0 ? usersData.length : (user ? 1 : 0));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keyboard shortcut '/' or 'Cmd/Ctrl+K' to quickly focus the search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle post/report creation callbacks
  const handleItemPosted = (newPost) => {
    setFoundItems((prev) => [newPost, ...prev]);
    loadData(true);
  };

  const handleReportCreated = (newReport) => {
    setLostReports((prev) => [newReport, ...prev]);
    loadData(true);
  };

  // Inspect item from notification
  const handleViewNotificationItem = async (referenceId) => {
    try {
      setShowNotifModal(false);
      const post = await itemService.getFoundPostById(referenceId);
      if (post) {
        setSelectedItemForDetail(post);
      }
    } catch {
      // ignore
    }
  };

  // Active match alerts count
  const unreadMatches = notifications.filter((n) => !n.is_read && n.type === 'MATCH');
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const categories = ['All', ...ITEM_CATEGORIES];

  // Filter items based on activeTab, category, and search query
  const displayedFoundItems = (activeTab === 'my-found'
    ? foundItems.filter((i) => i.finder_id === user?.id)
    : foundItems
  ).filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.item_name?.toLowerCase().includes(q) ||
      item.location_found?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.color?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const displayedLostReports = lostReports.filter((report) => {
    const matchesCat = selectedCategory === 'All' || report.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      report.item_name?.toLowerCase().includes(q) ||
      report.last_known_location?.toLowerCase().includes(q) ||
      report.description?.toLowerCase().includes(q) ||
      report.color?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const firstName =
    user?.firstName ||
    (user?.fullName?.includes(',') ? user.fullName.split(',')[1]?.trim() : user?.fullName?.split(' ')[0]) ||
    'Iskolar';
  const myFoundCount = foundItems.filter((i) => i.finder_id === user?.id).length;

  const tabs = [
    { key: 'campus-feed', label: 'Campus Feed', count: foundItems.length },
    { key: 'my-found', label: 'My Posts', count: myFoundCount },
    { key: 'my-lost', label: 'My Reports', count: lostReports.length }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20 transition-colors duration-200">
      {/* ================= HERO ================= */}
      <section className="relative w-full overflow-hidden bg-slate-950 text-white">
        {/* Background with Ambient Radial Ambiance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={campusBg}
            alt="PUP Biñan Campus"
            className="w-full h-full object-cover object-center brightness-[0.32] saturate-[1.1] scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pt-12 pb-16 sm:pt-14 sm:pb-20">
          <div className="max-w-2xl">
            {/* Campus Institutional Pill Badge */}
            <div className="animate-fadeIn inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-medium text-slate-300 backdrop-blur-sm mb-4">
              <span className="font-semibold text-white">PUP Biñan Campus</span>
              <span className="text-slate-600 dark:text-slate-500">•</span>
              <span className="text-slate-300">Peer-to-Peer Student Recovery</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fadeInUp text-3xl sm:text-[2.85rem] font-bold tracking-tight text-white leading-[1.15]">
              Welcome back,<br />
              <span className="text-white font-extrabold">{firstName}.</span>
            </h1>

            {/* Student-Centered Subtext */}
            <p className="animate-fadeInUp [animation-delay:100ms] text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-xl mt-3.5">
              Lost an item between lectures or found unattended property? Connect directly with fellow Iskolars and safely coordinate campus returns.
            </p>

            {/* Quick Action Buttons */}
            <div className="animate-fadeInUp [animation-delay:180ms] mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowReportLostModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-theme hover:bg-theme-hover text-white text-sm font-semibold rounded-full border border-red-500/30 shadow-md shadow-red-950/40 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <HelpCircle className="w-4 h-4 text-red-200" />
                <span>Report Lost Item</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPostFoundModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-sm font-semibold rounded-full border border-slate-700/80 hover:border-slate-600 transition-all duration-200 cursor-pointer active:scale-95 shadow-xs"
              >
                <Camera className="w-4 h-4 text-slate-400" />
                <span>Post Found Item</span>
              </button>
            </div>

            {/* Stats row without green dot */}
            <div className="animate-fadeIn [animation-delay:240ms] mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-200">{foundItems.length}</span>
                <span>items logged</span>
              </div>

              <span className="w-px h-3 bg-slate-700/80" />

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-200">{lostReports.length}</span>
                <span>reports filed</span>
              </div>

              <span className="w-px h-3 bg-slate-700/80" />

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-200">{activeUsersCount}</span>
                <span>active users</span>
              </div>

              {unreadMatches.length > 0 && (
                <>
                  <span className="w-px h-3 bg-slate-700/80" />
                  <button
                    type="button"
                    onClick={() => setShowNotifModal(true)}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{unreadMatches.length} match{unreadMatches.length > 1 ? 'es' : ''} found</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEARCH & QUICK FILTERS ================= */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 -mt-7 relative z-20">
        <ScrollReveal threshold={0.05} yOffset={16}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-900/5 dark:shadow-none border border-slate-200/90 dark:border-slate-800/90 focus-within:border-slate-300 dark:focus-within:border-slate-700 focus-within:ring-2 focus-within:ring-slate-900/5 dark:focus-within:ring-white/5 transition-all duration-200 overflow-hidden">
            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 py-2 sm:py-2.5">
              <div className="text-slate-400 dark:text-slate-500 pl-1 shrink-0">
                <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item name, category, color, or location..."
                className="w-full px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none bg-transparent"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer mr-1"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd
                  className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded mr-2 pointer-events-none select-none"
                  title="Press '/' or Cmd+K to search"
                >
                  /
                </kbd>
              )}
              <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />
              <button
                type="button"
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="p-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
                title="Refresh inventory"
                aria-label="Refresh inventory data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Quick Search Tags Strip */}
            <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0 mr-1 select-none">
                  Quick search:
                </span>
                {[
                  { label: 'Calculator', query: 'Calculator' },
                  { label: 'Student ID', query: 'ID' },
                  { label: 'Tumbler', query: 'Tumbler' },
                  { label: 'Keys', query: 'Keys' },
                  { label: 'Umbrella', query: 'Umbrella' },
                  { label: 'Earphones', query: 'Earphones' }
                ].map((tag) => {
                  const isActive = searchQuery === tag.query;
                  return (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => setSearchQuery((prev) => (prev === tag.query ? '' : tag.query))}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all duration-150 cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-theme text-white border border-red-500/30 shadow-xs'
                          : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="ml-auto text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition cursor-pointer shrink-0 pl-2 select-none"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ================= MATCH ALERT ================= */}
      {unreadMatches.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 sm:px-8 mt-5">
          <ScrollReveal threshold={0.05} yOffset={14} delay={30}>
            <button
              type="button"
              onClick={() => setShowNotifModal(true)}
              className="w-full p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between gap-4 cursor-pointer hover:bg-amber-100/80 dark:hover:bg-amber-950/50 transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {unreadMatches.length} potential match{unreadMatches.length > 1 ? 'es' : ''} found
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    An item matching your report has been logged. Review to confirm.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 transition-colors" />
            </button>
          </ScrollReveal>
        </section>
      )}

      {/* ================= INVENTORY FEED ================= */}
      <section id="inventory-feed" className="max-w-5xl mx-auto px-5 sm:px-8 mt-8 scroll-mt-24">
        {/* Tab bar */}
        <ScrollReveal threshold={0.05} yOffset={14}>
          <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 mb-1">
            <div className="flex items-center gap-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-4 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer select-none ${
                    activeTab === tab.key
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`ml-1.5 text-xs tabular-nums ${
                    activeTab === tab.key
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                  {/* Active underline */}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-theme rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Active filter chips (compact) */}
            <div className="hidden sm:flex items-center gap-2 pb-2.5">
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {selectedCategory}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  &quot;{searchQuery}&quot;
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Category pills */}
        <ScrollReveal threshold={0.05} delay={40} yOffset={10}>
          <div className="py-3 overflow-x-auto custom-scrollbar flex items-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Shimmer bar when refreshing data in background */}
        {refreshing && (
          <div className="w-full h-1 rounded-full shimmer-bg my-2 animate-fadeIn" />
        )}

        {/* Feed content with Skeletons */}
        {loading ? (
          <div className="mt-4">
            {activeTab === 'my-lost' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <LostReportCardSkeleton key={idx} delay={idx * 60} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <ItemCardSkeleton key={idx} delay={idx * 50} />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'my-lost' ? (
          /* ================= MY LOST REPORTS ================= */
          <div className="mt-3">
            {displayedLostReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedLostReports.map((report, idx) => (
                  <ScrollReveal
                    key={report.id}
                    delay={(idx % 4) * 45}
                    threshold={0.04}
                    className="h-full"
                  >
                    <div
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between h-full"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {report.category}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              report.status === 'Matched'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300'
                            }`}
                          >
                            {report.status === 'Matched' ? 'Match Found' : report.status || 'Active'}
                          </span>
                        </div>

                        <div className="flex items-start gap-3.5">
                          {report.photo_url ? (
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                              <img src={report.photo_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 flex items-center justify-center shrink-0">
                              <Tag className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug truncate">
                              {report.item_name}
                            </h4>
                            {report.color && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                {report.color}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{report.last_known_location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>{report.date_lost}</span>
                          </div>
                        </div>

                        {report.description && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 italic">
                            &quot;{report.description}&quot;
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-mono">
                          #{report.id?.slice(0, 8)}
                        </span>
                        {report.status === 'Matched' ? (
                          <button
                            type="button"
                            onClick={() => setShowNotifModal(true)}
                            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>View Match</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Scanning...</span>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <FileText className="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No reports yet</h4>
                <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'No reports match your filters. Try clearing them.'
                    : 'Lost something? File a report and our system will notify you when a match appears.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowReportLostModal(true)}
                  className="mt-5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  File a Report
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ================= FOUND ITEMS FEED ================= */
          <div className="mt-3">
            {displayedFoundItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedFoundItems.map((item, idx) => {
                  const coverPhoto = item.photos?.[0]?.photo_url;
                  return (
                    <ScrollReveal
                      key={item.id}
                      delay={(idx % 6) * 45}
                      threshold={0.04}
                      className="h-full"
                    >
                      <div
                        onClick={() => setSelectedItemForDetail(item)}
                        className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer h-full"
                      >
                        {/* Photo */}
                        <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          {coverPhoto ? (
                            <img
                              src={coverPhoto}
                              alt={item.item_name}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                              <Package className="w-8 h-8 stroke-[1.5]" />
                              <span className="text-[11px] mt-1.5">No photo</span>
                            </div>
                          )}
                          {/* Status badge */}
                          <div className="absolute top-2.5 right-2.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium tracking-tight bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
                              <span>
                                {item.status === 'AvailableForClaim' || !item.status || item.status === 'Available'
                                  ? 'Available for Claim'
                                  : item.status === 'ClaimUnderReview'
                                  ? 'Under Review'
                                  : item.status === 'CoordinatingHandover'
                                  ? 'Handover'
                                  : item.status}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                                {item.item_name}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {item.category}
                            </p>

                            {/* Meta */}
                            <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{item.location_found}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span>{item.date_found}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                              {item.finder?.full_name ? `${item.finder.full_name}` : 'Campus Custody'}
                            </span>
                            <span className="text-xs font-medium text-theme flex items-center gap-0.5 group-hover:gap-1.5 transition-all duration-200">
                              View
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center">
                <Package className="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No items found</h4>
                <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Try adjusting your search or category filter, or check back later.
                </p>
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ================= RECOVERY PROTOCOL ================= */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 mt-12 mb-8">
        <ScrollReveal threshold={0.05} yOffset={22}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-theme" />
                  Peer Property Recovery Protocol
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Three steps to recover your belongings directly via Campus Safe-Exchange Zones.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-theme" />
                Campus Safe Zones · Mon–Sat, 8 AM – 5 PM
              </span>
            </div>

            {/* Steps Progress Flow */}
            <div className="relative">
              {/* Desktop connecting progress track */}
              <div
                className="hidden md:block absolute top-5 left-[16.6%] right-[16.6%] h-[2px] bg-slate-200/90 dark:bg-slate-800 -translate-y-1/2"
                aria-hidden="true"
              >
                <div className="h-full w-full bg-gradient-to-r from-red-500/70 via-red-500/45 to-red-500/25 rounded-full" />
              </div>

              {/* Mobile connecting vertical line */}
              <div
                className="md:hidden absolute top-5 bottom-8 left-5 w-[2px] bg-slate-200/90 dark:bg-slate-800 -translate-x-1/2"
                aria-hidden="true"
              >
                <div className="h-full w-full bg-gradient-to-b from-red-500/70 via-red-500/45 to-red-500/25 rounded-full" />
              </div>

              {/* Steps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
                {[
                  {
                    step: '1',
                    stage: 'STEP 01',
                    title: 'Submit Ownership Proof',
                    desc: 'Supply distinctive proof (serial numbers, hidden marks, receipts, or lock screen details) in the claim form directly to the finder.'
                  },
                  {
                    step: '2',
                    stage: 'STEP 02',
                    title: 'Finder Review & Chat',
                    desc: 'Once the finder approves your claim, coordinate a safe in-person handover schedule via direct in-app messaging.'
                  },
                  {
                    step: '3',
                    stage: 'STEP 03',
                    title: 'Safe-Zone Turnover',
                    desc: 'Meet at a campus Safe-Exchange Zone (Main Lobby, Library, Guard Post), inspect the item, verify PUP IDs, and confirm mutual return.'
                  }
                ].map((s, i) => (
                  <ScrollReveal key={s.step} threshold={0.05} delay={i * 80} yOffset={12}>
                    <div className="group relative flex md:flex-col items-start md:items-center gap-4 md:gap-0 cursor-default transition-transform duration-300 md:hover:-translate-y-1">
                      {/* Step Indicator Node with Red Shade */}
                      <div className="relative z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-900 p-0.5 shrink-0 flex items-center justify-center">
                        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-500/[0.08] dark:bg-red-500/[0.14] text-xs sm:text-sm font-mono font-bold text-red-700 dark:text-red-400 flex items-center justify-center border border-red-500/25 dark:border-red-500/35 shadow-2xs group-hover:scale-110 group-hover:bg-red-500/[0.18] group-hover:border-red-500/50 group-hover:ring-4 group-hover:ring-red-500/10 dark:group-hover:ring-red-500/20 transition-all duration-300">
                          {s.step}
                        </span>
                      </div>

                      {/* Step Content */}
                      <div className="pt-0.5 md:pt-3.5 md:text-center w-full px-2.5 py-2 rounded-xl transition-colors duration-300 group-hover:bg-slate-50/70 dark:group-hover:bg-slate-800/30">
                        <span className="inline-block text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-0.5 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                          {s.stage}
                        </span>
                        <h5 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-theme transition-colors">
                          {s.title}
                        </h5>
                        <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 md:max-w-xs md:mx-auto">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ================= MODALS ================= */}

      {/* Post Found Item Modal */}
      <PostFoundItemModal
        isOpen={showPostFoundModal}
        onClose={() => setShowPostFoundModal(false)}
        onItemPosted={handleItemPosted}
      />

      {/* Report Lost Item Modal */}
      <ReportLostItemModal
        isOpen={showReportLostModal}
        onClose={() => setShowReportLostModal(false)}
        onReportCreated={handleReportCreated}
      />

      {/* Item Detail & Inquire Modal */}
      <ItemDetailModal
        isOpen={!!selectedItemForDetail}
        item={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        onInitiateClaim={() => {
          alert('Proof of Ownership Claim workflow initiated. You will be redirected to submit detailed verification proof.');
        }}
      />

      {/* Notifications & Match Alerts Modal */}
      <NotificationsModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        onViewItem={handleViewNotificationItem}
      />

      {/* Outlook Simulation Modal */}
      <OutlookSimulationModal
        emailData={latestEmail}
        isOpen={showOutlookModal}
        onClose={() => setShowOutlookModal(false)}
      />
    </div>
  );
}
