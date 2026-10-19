import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  History,
  PlusCircle,
  Lock
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export default function AdminDashboardPage() {
  const { user, role } = useAuth();

  // If user is not admin, enforce RBAC protection
  if (role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied (RBAC Protected)</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          The Admin Dashboard and Inventory Audit Trail are restricted exclusively to authorized <strong>PUP Biñan Campus Security Personnel</strong> (FR-SEEN-0008).
        </p>
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 max-w-sm mx-auto text-left">
          <strong>Authorized Personnel Notice:</strong> Please sign in with an official campus security institutional account (e.g., <em>security.binan@pup.edu.ph</em>) to access administrative controls.
        </div>
      </div>
    );
  }

  // Sample seed statistics and audit logs for Phase 1 view
  const stats = [
    { label: 'Surrendered Items in Vault', count: 18, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Active Lost Reports', count: 12, color: 'text-rose-700', bg: 'bg-rose-50' },
    { label: 'Pending Claim Audits', count: 5, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Returned to Owners', count: 42, color: 'text-emerald-700', bg: 'bg-emerald-50' }
  ];

  const sampleAuditLogs = [
    {
      id: 'log_01',
      action: 'Item Surrender Logged',
      officer: user.fullName,
      item: 'Scientific Calculator (Casio fx-991EX)',
      location: 'Computer Lab 3, 2nd Floor',
      timestamp: 'Today, 10:14 AM',
      hash: 'sha256-a78b9...'
    },
    {
      id: 'log_02',
      action: 'Claim Approved for Office Pickup',
      officer: user.fullName,
      item: 'PUP Student ID (2022-01452-BN-0)',
      location: 'Main Security Desk',
      timestamp: 'Today, 09:30 AM',
      hash: 'sha256-f41e2...'
    },
    {
      id: 'log_03',
      action: 'Physical Handover Completed',
      officer: user.fullName,
      item: 'Blue Hydro Flask Tumbler 32oz',
      location: 'Security Office',
      timestamp: 'Yesterday, 04:45 PM',
      hash: 'sha256-c92d1...'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-black rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Campus Security Administration • RBAC Tier 2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Security Inventory &amp; Audit Dashboard
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Logged in as <strong className="text-white">{user.fullName}</strong> ({user.studentId}). Authorized to log surrendered items, audit claims, and maintain immutable activity records.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              className="px-4 py-2.5 bg-theme hover:bg-theme-hover text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Found Item (Phase 2)</span>
            </button>
            <button
              type="button"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Audit Log (Phase 3)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <ScrollReveal threshold={0.05} yOffset={16}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {s.label}
              </div>
              <div className={`text-3xl font-extrabold ${s.color}`}>
                {s.count}
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Audit Trail & Action Management */}
      <ScrollReveal threshold={0.05} delay={60} yOffset={20}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Immutable Audit Trail Preview (FR-SEEN-0007, SYS-SEEN-0004) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <History className="w-4 h-4 text-theme" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Immutable Administrative Audit Trail
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  SYS-SEEN-0004: Tamper-resistant log of all staff actions
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
              Live Auditing
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sampleAuditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({log.hash})</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Item: <span className="font-semibold text-slate-800 dark:text-slate-100">{log.item}</span>
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>Officer: {log.officer}</span>
                    <span>•</span>
                    <span>{log.location}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {log.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 text-center border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Non-editable ledger recording every action, status override, and claim approval.
          </div>
        </div>

        {/* Right Column: Security Office Protocols */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-theme" />
              Staff Verification Protocol
            </h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-theme text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Check student/employee ID card physically against the registered record on the claim ticket.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-theme text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Require claimant to describe unique identifying marks, wallpapers, or passwords if electronic.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-theme text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Perform physical handoff and confirm the status update in SEENta to commit the audit record.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
    </div>
  );
}
