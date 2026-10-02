import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PUPLogo from './PUPLogo';
import { LogOut, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Formal Top University Bar */}
      <div className="bg-[#800000] text-amber-100 text-[11px] py-1.5 px-4 sm:px-8 font-medium tracking-wide flex items-center justify-between">
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
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-[#800000] transition">
                  SEEN<span className="text-[#800000]">ta</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider border border-slate-200">
                  Biñan
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Lost and Found Management System
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab(role === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
              className={`px-4 py-2 rounded-full transition ${
                activeTab === 'student-dashboard' || activeTab === 'admin-dashboard'
                  ? 'bg-black text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('student-dashboard')}
              className="px-4 py-2 rounded-full hover:bg-slate-100 text-slate-700 transition"
            >
              Browse Inventory
            </button>
            <button
              onClick={() => setActiveTab('student-dashboard')}
              className="px-4 py-2 rounded-full hover:bg-slate-100 text-slate-700 transition"
            >
              Report Lost Item
            </button>
          </nav>

          {/* Right User Card & Logout */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                  <span>{user?.fullName}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {user?.studentId} • {user?.roleTitle || 'Iskolar'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-black hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white p-4 space-y-3 animate-fadeIn">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <div className="font-bold text-sm text-slate-900">{user?.fullName}</div>
            <div className="text-xs text-slate-500 font-mono">{user?.studentId}</div>
            <div className="text-xs text-slate-500">{user?.email}</div>
          </div>
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-4 bg-black text-white font-semibold rounded-full text-xs text-center flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
}
