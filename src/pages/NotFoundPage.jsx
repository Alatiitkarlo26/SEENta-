import { Home, PackageSearch } from 'lucide-react';

export default function NotFoundPage({ onNavigateHome, onNavigateToTab }) {
  const handleHomeClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (onNavigateToTab) {
      onNavigateToTab('student-dashboard');
    } else {
      window.location.href = '/';
    }
  };

  const handleProtocolClick = () => {
    if (onNavigateToTab) {
      onNavigateToTab('privacy-terms', 'terms');
      setTimeout(() => {
        document.getElementById('sec-5')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24 overflow-hidden">
      {/* Subtle Ambient Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-theme/5 dark:bg-theme/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-2xl w-full text-center space-y-10 animate-fadeIn">
        {/* Centerpiece Icon Badge with Generous Breathing Room */}
        <div className="relative inline-block my-5 sm:my-7">
          <span
            className="absolute inset-0 rounded-[28px] border-2 border-theme/30 animate-ping pointer-events-none opacity-40"
            aria-hidden="true"
          />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/50 flex items-center justify-center mx-auto text-theme transition-transform hover:scale-105 duration-300">
            <PackageSearch className="w-12 h-12 sm:w-14 sm:h-14 stroke-[1.75]" />
          </div>
        </div>

        {/* Status & Error Headlines */}
        <div className="space-y-4 pt-4 sm:pt-6">
          {/* 404 in theme red directly beside the headline text with proper balanced alignment */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight [text-wrap:balance]">
            <span className="text-theme mr-3 sm:mr-4 inline-block">404</span>
            <span>Looks like this page is missing.</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed pt-1">
            The page you are looking for may have been moved, renamed, or already claimed and archived from the campus clearinghouse.
          </p>
        </div>

        {/* Primary Action Button (Centered alone) */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleHomeClick}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-theme hover:bg-theme-hover text-white text-xs font-bold shadow-md transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
        </div>

        {/* Inset Helpful Suggestions (Apple Style) */}
        <div className="pt-2">
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left space-y-2.5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Quick Suggestions
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={handleProtocolClick}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left flex items-center justify-between group cursor-pointer"
              >
                <span className="group-hover:text-theme transition-colors">Safe Handover Protocol</span>
                <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab?.('privacy-terms', 'privacy')}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left flex items-center justify-between group cursor-pointer"
              >
                <span className="group-hover:text-theme transition-colors">Data Privacy Rights</span>
                <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Institutional Stamp */}
        <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          Polytechnic University of the Philippines — Biñan Campus
        </div>
      </div>
    </div>
  );
}
