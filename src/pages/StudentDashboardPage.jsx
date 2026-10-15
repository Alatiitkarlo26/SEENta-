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
  PlusCircle,
  Package,
  MapPin,
  Mail,
  Calendar,
  Building,
  Bell,
  Sparkles,
  Camera,
  FileText,
  Tag,
  RefreshCw
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
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.item_name?.toLowerCase().includes(q) ||
      item.location_found?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const displayedLostReports = lostReports.filter((report) => {
    const matchesCat = selectedCategory === 'All' || report.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      report.item_name?.toLowerCase().includes(q) ||
      report.last_known_location?.toLowerCase().includes(q) ||
      report.description?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-16 transition-colors duration-200">
      {/* ================= HERO SECTION (Formal & Matched with Brand Background) ================= */}
      <div className="relative w-full overflow-hidden bg-slate-900 text-white border-b border-slate-200/50 dark:border-slate-800">
        {/* Background Image with Photographic Contrast */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={campusBg}
            alt="PUP Biñan Campus"
            className="w-full h-full object-cover object-center filter contrast-[1.08] saturate-[1.12] brightness-[0.70] scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Formal Greeting */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Mabuhay, {user?.fullName || 'Iskolar'}!
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              PUP Biñan decentralized lost and found clearinghouse. Report missing items, post surrendered belongings, and connect directly with fellow Iskolars.
            </p>

            {/* Quick Institutional ID Pill & Notifications Trigger */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300 font-mono">
              <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                ID: {user?.studentId}
              </span>
              <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                {user?.email}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30 font-sans font-semibold">
                ✓ Verified Iskolar
              </span>
              <button
                type="button"
                onClick={() => setShowNotifModal(true)}
                className="bg-theme hover:bg-theme-hover text-white px-3 py-1 rounded-full border border-white/20 font-sans font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Alerts {unreadCount > 0 && `(${unreadCount})`}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowOutlookModal(true)}
                className="bg-black/40 hover:bg-black/60 text-slate-200 px-3 py-1 rounded-full border border-white/15 font-sans font-semibold flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Outlook Logs</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-8 w-full max-w-2xl">
              <div className="relative flex items-center bg-white dark:bg-slate-800/90 rounded-full p-2 shadow-2xl border border-white/80 dark:border-slate-700">
                <div className="pl-4 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by item name, location, or distinguishing description..."
                  className="w-full px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className="px-5 py-2.5 bg-theme hover:bg-theme-hover text-white font-semibold text-xs sm:text-sm rounded-full transition shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CORE ACTION CARDS (Clean Adaptive Cards) ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Action Card 1: Report Lost Item */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-theme text-white flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-xs">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Report a Lost Item</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Misplaced an ID, calculator, tumbler, keys, or device? File a report and our automated matching engine will scan incoming posts.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">FR-SEEN-0002 Active</span>
              <button
                type="button"
                onClick={() => setShowReportLostModal(true)}
                className="py-2.5 px-5 bg-theme hover:bg-theme-hover text-white text-xs font-semibold rounded-full transition shadow-sm cursor-pointer"
              >
                File Report &rarr;
              </button>
            </div>
          </div>

          {/* Action Card 2: Post a Found Item */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-theme text-white flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Post a Found Item</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Found an unattended belonging on campus? Upload photos, specify location discovered, and hold safe custody for the owner.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">P2P Safe Custody</span>
              <button
                type="button"
                onClick={() => setShowPostFoundModal(true)}
                className="py-2.5 px-5 bg-theme hover:bg-theme-hover text-white text-xs font-semibold rounded-full transition shadow-sm cursor-pointer"
              >
                Post Item &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= AUTOMATED MATCH ALERT BANNER ================= */}
      {unreadMatches.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div
            onClick={() => setShowNotifModal(true)}
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-2 border-amber-500/40 dark:border-amber-500/30 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  🎯 Potential Match Alert ({unreadMatches.length})
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Our matching engine discovered an item matching your reported missing belongings! Tap to review.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs shrink-0">
              View Matches &rarr;
            </span>
          </div>
        </div>
      )}

      {/* ================= MAIN DIRECTORY & P2P DISCOVERY FEED ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white dark:bg-slate-900 rounded-[36px] sm:rounded-[44px] p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl transition-colors">
          {/* Main Feed Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('campus-feed')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'campus-feed'
                    ? 'bg-theme text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Campus Found Feed ({foundItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('my-found')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'my-found'
                    ? 'bg-theme text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>My Found Posts ({foundItems.filter((i) => i.finder_id === user?.id).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('my-lost')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'my-lost'
                    ? 'bg-theme text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Lost Reports ({lostReports.length})</span>
              </button>
            </div>

            <div className="text-xs text-slate-400">
              {activeTab === 'my-lost' ? 'Scanning active reports' : 'Live campus custody'}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-6 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-theme text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Feed Grid Display */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              <div className="w-7 h-7 border-2 border-theme border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading campus feed...
            </div>
          ) : activeTab === 'my-lost' ? (
            // ================= MY LOST REPORTS VIEW =================
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {displayedLostReports.length > 0 ? (
                displayedLostReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                          {report.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            report.status === 'Matched'
                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300'
                          }`}
                        >
                          {report.status === 'Matched' ? '🎯 Potential Match' : report.status}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        {report.photo_url ? (
                          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            <img src={report.photo_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center shrink-0">
                            <Tag className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {report.item_name}
                          </h4>
                          {report.color && (
                            <p className="text-xs text-slate-500">Color: {report.color}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Last seen at: <strong>{report.last_known_location}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Reported lost on: <strong>{report.date_lost}</strong></span>
                        </div>
                      </div>

                      {report.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                          &quot;{report.description}&quot;
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        ID: {report.id}
                      </span>
                      {report.status === 'Matched' && (
                        <button
                          type="button"
                          onClick={() => setShowNotifModal(true)}
                          className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Inspect Match</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-16 text-center text-slate-400 text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No lost item reports found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Have you misplaced something? Click &quot;Report a Lost Item&quot; to file an official notice.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // ================= FOUND ITEMS CAMPUS FEED =================
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {displayedFoundItems.length > 0 ? (
                displayedFoundItems.map((item) => {
                  const coverPhoto = item.photos?.[0]?.photo_url;
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md bg-slate-50/50 dark:bg-slate-800/40 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300">
                            {item.status || 'AvailableForClaim'}
                          </span>
                        </div>

                        {/* Photo Thumbnail + Item Headline */}
                        <div className="flex items-start gap-3">
                          {coverPhoto ? (
                            <div className="w-18 h-18 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                              <img src={coverPhoto} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-18 h-18 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center shrink-0">
                              <Package className="w-7 h-7" />
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                              {item.item_name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {item.condition || 'Good'}
                              </span>
                              {item.color && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {item.color}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Location and Date */}
                        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Found at: <strong className="text-slate-800 dark:text-slate-200">{item.location_found}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Date: <span className="text-slate-700 dark:text-slate-300">{item.date_found}</span></span>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Finder: {item.finder?.full_name || 'Iskolar'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedItemForDetail(item)}
                          className="px-4 py-2 bg-theme hover:bg-theme-hover text-white text-xs font-semibold rounded-full transition cursor-pointer shadow-2xs"
                        >
                          Inspect / Claim
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 py-16 text-center text-slate-400 text-sm">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No items match your query</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try adjusting your search terms or category filter.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= FORMAL VERIFICATION & SAFETY POLICY ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-theme text-white rounded-[32px] p-7 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Building className="w-6 h-6 text-amber-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Official Campus Property Handover Policy
              </h3>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-2xl">
                To guarantee safe recovery and eliminate fraudulent claims, all physical handoffs require presenting your official PUP Student or Employee ID at the <strong>Ground Floor Campus Security Office</strong> during official hours (8:00 AM – 5:00 PM).
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <span className="inline-block bg-white dark:bg-slate-900 text-black dark:text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-md">
              PUP Biñan Campus Regulation
            </span>
          </div>
        </div>
      </div>

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
