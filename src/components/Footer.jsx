import PUPLogo from './PUPLogo';
import { MapPin, Clock, ShieldCheck, Mail, Info } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: System Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <PUPLogo className="w-8 h-8 shrink-0" />
              <span className="text-white font-extrabold text-base tracking-tight">Project SEEN<span className="text-[#800000]">ta</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              A centralized digital lost and found management platform built specifically for the students, faculty, and campus security of PUP Biñan.
            </p>
            <div className="flex items-center gap-2 text-amber-400 text-[11px] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Institutional Domain Protected</span>
            </div>
          </div>

          {/* Col 2: Campus Security Office */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Security Office Hours
            </h4>
            <div className="flex items-start gap-2 text-slate-300 mt-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Monday – Friday: 8:00 AM – 5:00 PM</span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Campus Security Office, Ground Floor, PUP Biñan Main Building</span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="font-mono text-[11px]">security.binan@pup.edu.ph</span>
            </div>
          </div>

          {/* Col 3: Policy & Delimitation (Document Scope) */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Policy &amp; Verification
            </h4>
            <div className="flex items-start gap-2 text-slate-400 text-[11px] leading-relaxed">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Physical Handoff Notice:</strong> Digital approval is an audit step. The final item turnover requires in-person ID authentication at the campus security office.
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              • Strictly restricted to items lost/found within university grounds.
            </p>
          </div>

          {/* Col 4: Project Team (Group 12) */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Group 12 Development Team
            </h4>
            <ul className="text-[11px] space-y-1 text-slate-400">
              <li>• Alatiit, Jian Karlo</li>
              <li>• Aviles, Armi Jhon</li>
              <li>• Igloso, Mark Jacob</li>
              <li>• Orfella Jr., Roderick</li>
              <li>• Ubaldo, Neilven Ryan</li>
            </ul>
            <div className="text-[10px] text-slate-500 pt-1">
              Polytechnic University of the Philippines — Biñan Campus
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>&copy; 2026 Project SEENta. All rights reserved.</div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>PUP Biñan Campus</span>
            <span>•</span>
            <span>Lost &amp; Found Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
