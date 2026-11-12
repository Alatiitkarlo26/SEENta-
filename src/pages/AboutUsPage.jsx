import { useState, useEffect, useRef } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  HeartHandshake,
  Copy,
  Check
} from 'lucide-react';

export default function AboutUsPage({ onNavigateBack }) {
  const [copied, setCopied] = useState(false);
  const [showSubNav, setShowSubNav] = useState(true);
  const lastScrollY = useRef(0);

  // Auto-scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Smoothly hide sub-navbar on scroll down, reappear on scroll up or top
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Ignore negative scroll (rubber-banding on iOS/macOS)
      if (currentScrollY < 0) return;

      // Always show at top of page
      if (currentScrollY <= 25) {
        setShowSubNav(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scrolling down: hide smoothly
      if (currentScrollY > lastScrollY.current + 6) {
        setShowSubNav(false);
      }
      // Scrolling up: reveal smoothly
      else if (currentScrollY < lastScrollY.current - 6) {
        setShowSubNav(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Action Header (Smoothly auto-hides on scroll, reappears on scroll up) */}
      <div
        className={`border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-18 z-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showSubNav
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={onNavigateBack}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Platform</span>
          </button>

          {/* Quick Page Utilities */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer active:scale-95"
              title="Copy link to page"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16 sm:space-y-20">
        {/* Hero Section */}
        <ScrollReveal threshold={0.05} yOffset={16}>
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              About SEENta
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              A decentralized, modern lost-and-found peer-to-peer platform built for the Polytechnic University of the Philippines – Biñan Campus, connecting finders and rightful owners directly with speed, honesty, and accountability.
            </p>
          </div>
        </ScrollReveal>

        {/* 1. Mission and Vision Statements */}
        <section className="space-y-8">
          <ScrollReveal threshold={0.05} yOffset={16}>
            <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Mission & Vision Statements
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Mission */}
            <ScrollReveal threshold={0.05} delay={60} yOffset={16}>
              <div className="group relative pl-5 sm:pl-6 border-l-2 border-red-500/30 dark:border-red-500/40 hover:border-red-500 dark:hover:border-red-400 transition-colors duration-300 h-full flex flex-col justify-between cursor-default">
                <div>
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Mission Statement
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-3 group-hover:text-theme transition-colors">
                    Our Mission
                  </h3>

                  {/* Statement Quote */}
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    &ldquo;To provide the PUP Biñan community with a fast, transparent, and decentralized lost-and-found platform that connects finders and owners directly, eliminating administrative delays while upholding honesty, safety, and accountability across campus.&rdquo;
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Vision */}
            <ScrollReveal threshold={0.05} delay={120} yOffset={16}>
              <div className="group relative pl-5 sm:pl-6 border-l-2 border-red-500/30 dark:border-red-500/40 hover:border-red-500 dark:hover:border-red-400 transition-colors duration-300 h-full flex flex-col justify-between cursor-default">
                <div>
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Vision Statement
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-3 group-hover:text-theme transition-colors">
                    Our Vision
                  </h3>

                  {/* Statement Quote */}
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    &ldquo;To foster an honest, secure, and digitally empowered university environment where misplaced belongings are swiftly reunited with their rightful owners, ensuring no student or faculty member is left behind.&rdquo;
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 2. Core Pillars */}
        <section className="space-y-8">
          <ScrollReveal threshold={0.05} yOffset={16}>
            <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Core Pillars
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                The three fundamental values powering every verification, report, and property recovery across campus.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
            {[
              {
                step: '01',
                title: 'Community-Driven (P2P)',
                icon: Users,
                desc: 'Empowering Iskolar ng Bayan and faculty to assist one another directly without unnecessary office queues or bottlenecks.'
              },
              {
                step: '02',
                title: 'Integrity & Accountability',
                icon: ShieldCheck,
                desc: 'Eliminating false claims through institutional email verification and immutable, transparent transaction logs.'
              },
              {
                step: '03',
                title: 'Accessibility & Inclusion',
                icon: HeartHandshake,
                desc: 'Built for the entire PUP Biñan community with responsive access and inclusive assistive tools, ensuring no student or faculty member is left behind.'
              }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <ScrollReveal key={pillar.step} threshold={0.05} delay={i * 80} yOffset={16}>
                  <div className="group relative flex flex-col justify-between cursor-default transition-transform duration-300 md:hover:-translate-y-1">
                    <div>
                      {/* Icon & Node */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/[0.08] dark:bg-red-500/[0.14] text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/25 dark:border-red-500/35 shadow-2xs group-hover:scale-110 group-hover:bg-red-500/[0.18] group-hover:border-red-500/50 group-hover:ring-4 group-hover:ring-red-500/10 dark:group-hover:ring-red-500/20 transition-all duration-300">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                          Pillar {pillar.step}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-theme transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
