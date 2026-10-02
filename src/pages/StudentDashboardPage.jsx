import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import campusBg from '../assets/pup-binan-campus.jpg';
import PUPLogo from '../components/PUPLogo';
import OutlookSimulationModal from '../components/OutlookSimulationModal';
import { otpService } from '../services/otpService';
import {
  Search,
  PlusCircle,
  Package,
  ShieldCheck,
  MapPin,
  Mail,
  Calendar,
  Building
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOutlookModal, setShowOutlookModal] = useState(false);
  const latestEmail = otpService.getLatestEmail(user?.email);

  // Sample realistic surrendered items in PUP Biñan Security Vault
  const sampleItems = [
    {
      id: 'item-01',
      name: 'Casio Scientific Calculator fx-991CW',
      category: 'Electronics',
      location: 'Computer Laboratory 2 (2nd Floor)',
      date: 'October 2, 2026',
      status: 'In Security Vault',
      vaultSlot: 'Slot A-14',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'item-02',
      name: 'PUP Biñan Student ID with Maroon Lanyard',
      category: 'Student IDs',
      location: 'Main Campus Quadrangle',
      date: 'October 1, 2026',
      status: 'In Security Vault',
      vaultSlot: 'Slot B-03',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'item-03',
      name: 'Navy Blue AquaFlask Tumbler (32oz)',
      category: 'Personal Belongings',
      location: 'Main Building 3rd Floor East Corridor',
      date: 'September 30, 2026',
      status: 'In Security Vault',
      vaultSlot: 'Slot A-22',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'item-04',
      name: 'Black Leather Bifold Wallet',
      category: 'Wallets & Bags',
      location: 'Student Canteen Area',
      date: 'September 29, 2026',
      status: 'Under Verification',
      vaultSlot: 'Slot C-08',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    }
  ];

  const categories = ['All', 'Electronics', 'Student IDs', 'Personal Belongings', 'Wallets & Bags'];

  const filteredItems = sampleItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#800000] selection:text-white pb-16">
      {/* ================= HERO SECTION (Formal & Matched with Login Background) ================= */}
      <div className="relative w-full overflow-hidden bg-slate-900 text-white border-b border-slate-200/50">
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
            {/* PUP Institutional Seal Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-5 shadow-sm">
              <PUPLogo className="w-5 h-5 shrink-0" />
              <span className="text-xs font-semibold tracking-wide text-amber-200 uppercase">
                PUP Biñan Central Clearinghouse
              </span>
            </div>

            {/* Formal Greeting */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Mabuhay, {user?.fullName || 'Iskolar'}!
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Official lost and found portal for students, faculty, and campus security. Search surrendered belongings or file a misplaced item report.
            </p>

            {/* Quick Institutional ID Pill */}
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
            </div>

            {/* Formal Search Bar (Matching Pill Aesthetic) */}
            <div className="mt-8 w-full max-w-2xl">
              <div className="relative flex items-center bg-white rounded-full p-2 shadow-2xl border border-white/80">
                <div className="pl-4 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by item name, category, or location found..."
                  className="w-full px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm rounded-full transition shadow-md shrink-0 cursor-pointer"
                >
                  Search Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CORE ACTION CARDS (Clean White Cards) ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Action Card 1: Report Lost Item */}
          <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Report a Lost Item</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Misplaced an ID, device, tumbler, or notebook on campus? File an official report with description and location.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Phase 2 Module</span>
              <button
                type="button"
                className="py-2.5 px-5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-full transition shadow-sm cursor-pointer"
              >
                File Report &rarr;
              </button>
            </div>
          </div>

          {/* Action Card 2: Browse Surrendered Inventory */}
          <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Surrendered Vault</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Filter through cataloged items turned in to the Campus Security Office by category, color, size, and date.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">4 Active Items</span>
              <button
                type="button"
                className="py-2.5 px-5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-full transition shadow-sm cursor-pointer"
              >
                Browse Items &rarr;
              </button>
            </div>
          </div>

          {/* Action Card 3: In-Person Office Notice & Verification */}
          <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#800000] text-amber-300 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Security Office Handover</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                All physical item turnovers require in-person identity verification at the Security Desk (Ground Floor, Main Bldg).
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">8:00 AM – 5:00 PM</span>
              <button
                type="button"
                onClick={() => setShowOutlookModal(true)}
                className="py-2 px-3 text-slate-700 hover:text-black font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Outlook Logs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RECENT SURRENDERED ITEMS DIRECTORY ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-[36px] sm:rounded-[44px] p-6 sm:p-10 border border-slate-200/80 shadow-xl">
          {/* Header & Category Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Recently Surrendered Belongings
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Items safely held in the PUP Biñan Campus Security Vault awaiting owner verification.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Item Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl border border-slate-200 hover:border-slate-300 hover:shadow-md bg-slate-50/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 pt-1">
                      {item.name}
                    </h4>

                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Found at: <strong className="text-slate-800">{item.location}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Date Logged: <span className="text-slate-700">{item.date}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-medium text-slate-500">
                      Vault: {item.vaultSlot}
                    </span>
                    <button
                      type="button"
                      className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-full transition cursor-pointer"
                    >
                      Inquire / Claim
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-slate-400 text-sm">
                No items match your query. Try a different search term or category.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= FORMAL VERIFICATION & SAFETY POLICY ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-[#800000] text-white rounded-[32px] p-7 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Building className="w-6 h-6 text-amber-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Official Campus Property Handover Policy
              </h3>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-2xl">
                To guarantee safe recovery and eliminate fraudulent ownership claims, all physical handoffs require presenting your official PUP Student or Employee ID at the <strong>Ground Floor Campus Security Office</strong> during official hours (8:00 AM – 5:00 PM).
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <span className="inline-block bg-white text-black font-semibold text-xs px-5 py-2.5 rounded-full shadow-md">
              PUP Biñan Campus Regulation
            </span>
          </div>
        </div>
      </div>

      {/* Outlook Simulation Modal */}
      <OutlookSimulationModal
        emailData={latestEmail}
        isOpen={showOutlookModal}
        onClose={() => setShowOutlookModal(false)}
      />
    </div>
  );
}
