import { X, Mail, Copy, Check, ShieldCheck, Clock } from 'lucide-react';
import { useState } from 'react';

export default function OutlookSimulationModal({ emailData, isOpen, onClose, onApplyOTP }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !emailData) return null;

  const handleCopy = () => {
    if (emailData.otp) {
      navigator.clipboard.writeText(emailData.otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onApplyOTP) {
        onApplyOTP(emailData.otp);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Outlook Web Header Simulation */}
        <div className="bg-[#0078d4] text-white px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {/* Microsoft 9-dots icon */}
            <div className="grid grid-cols-3 gap-0.5 w-4 h-4 p-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-[0.5px]"></div>
              ))}
            </div>
            <span className="font-semibold text-sm tracking-wide">Outlook</span>
            <span className="text-blue-100 text-xs px-2 py-0.5 rounded bg-blue-600/50">
              PUP Microsoft 365 Webmail
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-blue-700/60 transition"
            title="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outlook Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-800 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-600" />
              Inbox ({emailData.to})
            </span>
            <span className="text-slate-400">|</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              Received: {emailData.sentAt || 'Just now'}
            </span>
          </div>
          <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
            Live Simulated Inbox
          </span>
        </div>

        {/* Email Header Card */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="text-base font-bold text-slate-900 leading-snug">
            {emailData.subject}
          </h2>

          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#800000] text-amber-300 font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                PUP
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  Project SEENta Auth System
                  <span className="text-slate-400 font-normal">&lt;noreply@seenta.pup.edu.ph&gt;</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  To: <span className="font-mono text-slate-700">{emailData.to}</span>
                </div>
              </div>
            </div>

            {/* Quick Action: Copy & Auto-paste OTP */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-sm transition shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied & Filled!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy OTP ({emailData.otp})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Email Body Content */}
        <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: emailData.bodyHtml }}
          />
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Simulates actual PUP Microsoft Outlook reception on campus</span>
          </div>
          <button
            onClick={() => {
              handleCopy();
              onClose();
            }}
            className="px-4 py-1.5 bg-theme hover:bg-theme-hover text-white font-medium rounded-md transition text-xs cursor-pointer"
          >
            Use OTP & Return
          </button>
        </div>
      </div>
    </div>
  );
}
