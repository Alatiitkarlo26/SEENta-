import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import campusBg from '../assets/pup-binan-campus.jpg';
import OutlookSimulationModal from '../components/OutlookSimulationModal';
import PostFoundItemModal from '../components/PostFoundItemModal';
import ReportLostItemModal from '../components/ReportLostItemModal';
import ItemDetailModal from '../components/ItemDetailModal';
import NotificationsModal from '../components/NotificationsModal';
import { itemService } from '../services/itemService';
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
  Building2,
  X,
  HelpCircle
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('campus-feed'); // 'campus-feed' | 'my-found' | 'my-lost'

  // Data states
  const [foundItems, setFoundItems] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
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
      const [foundData, lostData, notifsData] = await Promise.all([
        itemService.getFoundPosts(),
        user?.id ? itemService.getLostReports({ userId: user.id }) : [],
        user?.id ? itemService.getNotifications(user.id) : []
      ]);

      setFoundItems(foundData || []);
      setLostReports(lostData || []);
      setNotifications(notifsData || []);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20 transition-colors duration-200">
      {/* ================= REFINED HERO SECTION ================= */}
      <section className="relative w-full overflow-hidden bg-slate-950 text-white border-b border-slate-200/40 dark:border-slate-800">
        {/* Subtle Ambient Photographic Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={campusBg}
            alt="PUP Biñan Campus"
            className="w-full h-full object-cover object-center filter saturate-[1.1] brightness-[0.45] scale-[1.02] transform transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40" />
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/50 to-slate-950/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Welcoming Greeting */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Mabuhay, {firstName}!
            </h1>
            <p className="mt-3.5 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Report misplaced belongings, browse surrendered campus items, and coordinate safe custody turnover.
            </p>

            {/* Mobbin-Inspired Tactile Search Bar */}
            <div className="mt-8 w-full max-w-2xl">
              <div className="relative flex items-center bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-full p-1.5 sm:p-2 shadow-2xl border border-white/80 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-theme/30 focus-within:border-theme transition-all">
                <div className="pl-3.5 sm:pl-4 text-slate-400 dark:text-slate-500">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by item name, color, or location (e.g. Rm 302, Library)..."
                  className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-theme hover:bg-theme-hover text-white font-semibold text-xs sm:text-sm rounded-xl sm:rounded-full transition shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>

              {/* Search Shortcut Hint */}
              <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span>{foundItems.length} active items logged</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span>{lostReports.length} reports filed</span>
                {unreadMatches.length > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {unreadMatches.length} match alert{unreadMatches.length > 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CORE ACTION CARDS (Tactile Launchpad) ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: Report Lost Item */}
          <div className="group relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-800/80">
                  Missing Property
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                Report a Lost Item
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Misplaced your student ID, calculator, keys, tumbler, or device? File an official notice so finders and security personnel can match it.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Auto-match scanning active</span>
              <button
                type="button"
                onClick={() => setShowReportLostModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-theme hover:bg-theme-hover text-white text-xs font-semibold rounded-full transition shadow-xs cursor-pointer group-hover:shadow-md"
              >
                <span>File Report</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Post Found Item */}
          <div className="group relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-theme/10 dark:bg-theme/20 text-theme flex items-center justify-center border border-theme/20 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/80">
                  Campus Safe Custody
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                Post a Found Item
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Found unattended property in a room, corridor, or canteen? Post photos and location details to hold safe custody until claimed.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Safe P2P turnover</span>
              <button
                type="button"
                onClick={() => setShowPostFoundModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-theme hover:bg-theme-hover text-white text-xs font-semibold rounded-full transition shadow-xs cursor-pointer group-hover:shadow-md"
              >
                <span>Post Item</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= AUTOMATED MATCH ALERT BANNER ================= */}
      {unreadMatches.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div
            onClick={() => setShowNotifModal(true)}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border border-amber-500/40 dark:border-amber-500/30 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Potential Match Alert ({unreadMatches.length})</span>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-500 text-white">Action Required</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Our matching engine discovered an item matching your reported missing belongings! Tap to inspect.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs shrink-0 group-hover:translate-x-0.5">
              <span>View Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </section>
      )}

      {/* ================= MAIN DIRECTORY & DISCOVERY FEED ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Feed Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          {/* Segmented Controller (Tabs) */}
          <div className="inline-flex p-1 bg-slate-200/70 dark:bg-slate-900 rounded-2xl border border-slate-300/60 dark:border-slate-800 shadow-2xs self-start">
            <button
              type="button"
              onClick={() => setActiveTab('campus-feed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'campus-feed'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Campus Found Feed</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'campus-feed'
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
              }`}>
                {foundItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('my-found')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'my-found'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>My Posts</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'my-found'
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
              }`}>
                {myFoundCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('my-lost')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'my-lost'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Lost Reports</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'my-lost'
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
              }`}>
                {lostReports.length}
              </span>
            </button>
          </div>

          {/* Active Filter Indicators */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span>{selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span>&quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Horizontal Category Filter Pills (Mobbin Style) */}
        <div className="py-2 overflow-x-auto custom-scrollbar flex items-center gap-2 pb-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-theme text-white shadow-xs font-semibold'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Feed Grid Display */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-theme border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-medium text-slate-600 dark:text-slate-300">Loading campus clearinghouse...</p>
          </div>
        ) : activeTab === 'my-lost' ? (
          // ================= MY LOST REPORTS VIEW =================
          <div className="mt-4">
            {displayedLostReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedLostReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-700">
                          {report.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            report.status === 'Matched'
                              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300'
                          }`}
                        >
                          {report.status === 'Matched' ? '🎯 Potential Match Found' : report.status || 'Active Report'}
                        </span>
                      </div>

                      <div className="flex items-start gap-3.5">
                        {report.photo_url ? (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            <img src={report.photo_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                            <Tag className="w-6 h-6" />
                          </div>
                        )}
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {report.item_name}
                          </h4>
                          {report.color && (
                            <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Color: {report.color}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Last seen at: <strong className="text-slate-800 dark:text-slate-200">{report.last_known_location}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Reported on: <span className="text-slate-700 dark:text-slate-300">{report.date_lost}</span></span>
                        </div>
                      </div>

                      {report.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic pt-1">
                          &quot;{report.description}&quot;
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        REF #{report.id?.slice(0, 8)}
                      </span>
                      {report.status === 'Matched' ? (
                        <button
                          type="button"
                          onClick={() => setShowNotifModal(true)}
                          className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Inspect Match</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Actively scanning posts
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
                <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">No lost item reports found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'No reports match your current filter settings. Try clearing the search or category.'
                    : 'Have you misplaced an ID, keys, or device? File a report so our system can alert you when it turns up.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowReportLostModal(true)}
                  className="mt-4 px-4 py-2 bg-theme hover:bg-theme-hover text-white text-xs font-semibold rounded-full transition shadow-xs cursor-pointer"
                >
                  File a Lost Report
                </button>
              </div>
            )}
          </div>
        ) : (
          // ================= FOUND ITEMS CAMPUS FEED =================
          <div className="mt-4">
            {displayedFoundItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedFoundItems.map((item) => {
                  const coverPhoto = item.photos?.[0]?.photo_url;
                  return (
                    <div
                      key={item.id}
                      className="group rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Photo Thumbnail / Visual Area */}
                      <div className="relative w-full h-44 sm:h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {coverPhoto ? (
                          <img
                            src={coverPhoto}
                            alt={item.item_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200/60 dark:from-slate-800 dark:to-slate-900/60">
                            <Package className="w-9 h-9 stroke-[1.5] text-slate-400" />
                            <span className="text-[11px] font-medium text-slate-400 mt-1">Photo not provided</span>
                          </div>
                        )}

                        {/* Category Floating Pill */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/15">
                            {item.category}
                          </span>
                        </div>

                        {/* Status Floating Pill */}
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 backdrop-blur-md text-white shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            {item.status || 'Available'}
                          </span>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-theme transition-colors">
                              {item.item_name}
                            </h4>
                          </div>

                          {/* Attributes Tags */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                              {item.condition || 'Good'}
                            </span>
                            {item.color && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                                {item.color}
                              </span>
                            )}
                          </div>

                          {/* Location & Date */}
                          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">Found at: <strong className="text-slate-800 dark:text-slate-200">{item.location_found}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Discovered: <span className="text-slate-700 dark:text-slate-300">{item.date_found}</span></span>
                            </div>
                          </div>

                          {item.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed pt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Card Footer / Action */}
                        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                            {item.finder?.full_name ? `By ${item.finder.full_name}` : 'Campus Custody'}
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedItemForDetail(item)}
                            className="px-3.5 py-1.5 bg-theme hover:bg-theme-hover text-white text-xs font-semibold rounded-full transition cursor-pointer shadow-2xs"
                          >
                            Inspect &amp; Claim
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
                <Package className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">No items match your search</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search keywords, clearing filters, or check back later as students post surrendered items.
                </p>
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-full transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ================= CAMPUS HANDOVER & SECURITY PROTOCOL (Institutional Trust) ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-theme mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PUP Biñan Campus Regulation</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Official Property Recovery Protocol
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Three steps ensuring verified ownership transfer at the Ground Floor Security Office.
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/80">
                <Building2 className="w-3.5 h-3.5 text-theme" />
                <span>Ground Floor Security Office • Mon–Sat: 8:00 AM – 3:00 PM</span>
              </span>
            </div>
          </div>

          {/* 3 Step Protocol Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-theme">01</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                Verify Distinct Identifiers
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Confirm serial numbers, distinguishing scratches, lock screens, or stickers to verify legitimate ownership.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-theme">02</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                Coordinate Custody Claim
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Submit an inquiry through the clearinghouse to coordinate safe turnover with the finder or campus custodian.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-theme">03</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                Present Official PUP ID
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Complete physical recovery in person at the Campus Security Office by presenting your official university ID card (Mon–Sat, 8:00 AM–3:00 PM).
              </p>
            </div>
          </div>
        </div>
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
