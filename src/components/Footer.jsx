import { useState } from 'react';
import TermsPrivacyModal from './TermsPrivacyModal';
import ScrollReveal from './ScrollReveal';
import { MapPin, Clock, Mail } from 'lucide-react';

export default function Footer({ onNavigateToTab }) {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const handleLegalClick = (subTab, sectionId = null) => {
    if (onNavigateToTab) {
      onNavigateToTab('privacy-terms', subTab);
      if (sectionId) {
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else {
      setIsTermsModalOpen(true);
    }
  };

  return (
    <>
      <footer className="bg-slate-200/70 dark:bg-black text-slate-600 dark:text-slate-400 border-t border-slate-300/70 dark:border-slate-800 text-xs mt-auto transition-colors duration-200">
        <ScrollReveal threshold={0.04} yOffset={14}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-6">
            {/* Apple-style Footnote Disclosures */}
            <div className="pb-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-500 leading-normal border-b border-slate-300/70 dark:border-slate-800/80">
            <p>
              * All found items reported on SEENta remain under verified finder custody until in-person ownership authentication and mutual turnover are completed at an authorized campus Safe-Exchange Zone.
            </p>
            <p>
              * In-person recovery requires presenting your official PUP Student or Faculty ID at designated campus Safe-Exchange Zones (Main Campus Lobby, Library Entrance, Security Guard Post, or Student Center Plaza). Unclaimed belongings after statutory holding periods are surrendered to Campus Security under institutional guidelines.
            </p>
          </div>

          {/* Minimal 4-Column Directory */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
            {/* Col 1: Brand & Purpose */}
            <div className="col-span-2 md:col-span-1 space-y-1">
              <div className="flex items-baseline leading-none select-none">
                <span
                  className="font-albert font-black text-lg text-slate-900 dark:text-white tracking-tight uppercase"
                  style={{ fontFamily: "'Albert Sans', sans-serif", fontWeight: 900 }}
                >
                  SEEN
                </span>
                <span
                  className="font-alan font-normal text-[17.5px] text-slate-900 dark:text-white tracking-tight ml-0.5"
                  style={{ fontFamily: "'Alan Sans', sans-serif", fontWeight: 400 }}
                >
                  ta
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug pr-2">
                Peer-to-peer lost and found recovery platform engineered for the students and faculty of PUP Biñan Campus.
              </p>
            </div>

            {/* Col 2: Platform Links */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <a href="#feed" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    Campus Found Feed
                  </a>
                </li>
                <li>
                  <a href="#report" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    Report Lost Property
                  </a>
                </li>
                <li>
                  <a href="#post" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    Post Found Item
                  </a>
                </li>
                <li>
                  <span className="text-slate-400 dark:text-slate-500">
                    Automated Match Engine
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 3: Safe-Exchange Zones */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Safe-Exchange Zones
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>Main Campus Lobby &amp; Plaza</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>University Library Entrance</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>Campus Security Guard Post</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Research & Academic Innovation */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Research &amp; Credits
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Group 12 Development Team
              </p>
              <ul className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                <li>Jian Karlo, Alatiit</li>
                <li>Armi Jhon, Aviles</li>
                <li>Mark Jacob, Igloso</li>
                <li>Roderick, Orfella Jr.</li>
                <li>Neilven Ryan, Ubaldo</li>
              </ul>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 pt-0.5">
                Polytechnic University of the Philippines — Biñan Campus
              </p>
            </div>
          </div>

          {/* Bottom Legal / Apple-style Strip */}
          <div className="border-t border-slate-300/70 dark:border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-500 dark:text-slate-500">
            <div>
              &copy; 2026 SEENta. PUP Biñan Campus. All rights reserved.
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => handleLegalClick('privacy')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => handleLegalClick('terms')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Terms of Use
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => handleLegalClick('terms', 'sec-5')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Official Handover Protocol
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </footer>

      {/* Terms & Privacy Modal */}
      <TermsPrivacyModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </>
  );
}
