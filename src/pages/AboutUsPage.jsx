import { useState, useEffect, useRef } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import {
  ArrowLeft,
  Building2,
  Users,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import roderickImg from '../assets/RODERICK.jpg';

const TEAM_MEMBERS = [
  {
    id: 'alatiit',
    name: 'Alatiit, Jian Karlo',
    role: 'Full-Stack Developer',
    initials: 'JA',
    image: null
  },
  {
    id: 'aviles',
    name: 'Aviles, Armi Jhon',
    role: 'Front End Developer',
    initials: 'AA',
    image: null
  },
  {
    id: 'igloso',
    name: 'Igloso, Mark Jacob',
    role: 'Software Quality Assurance',
    initials: 'MI',
    image: null
  },
  {
    id: 'orfella',
    name: 'Orfella Jr., Roderick',
    role: 'Project Manager',
    initials: 'RO',
    image: roderickImg
  },
  {
    id: 'ubaldo',
    name: 'Ubaldo, Neilven Ryan',
    role: 'Full-Stack Developer',
    initials: 'NU',
    image: null
  }
];

export default function AboutUsPage({ onNavigateBack }) {
  const [copied, setCopied] = useState(false);
  const [showSubNav, setShowSubNav] = useState(true);
  const lastScrollY = useRef(0);

  // References and states for interactive smooth scrolling
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const isInteracting = useRef(false);
  const resumeTimer = useRef(null);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  // Triplicate array for seamless infinite wraparound
  const carouselItems = [...TEAM_MEMBERS, ...TEAM_MEMBERS, ...TEAM_MEMBERS];

  // Initialize scroll position to the middle third on mount
  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      const timer = setTimeout(() => {
        if (el) el.scrollLeft = (el.scrollWidth / 3) * 1.5;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  // Smooth continuous drift to the right using requestAnimationFrame
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    let animId;
    const speed = 0.65; // Pixels per frame drift to the right

    const step = () => {
      if (!isInteracting.current && el) {
        // Decrease scrollLeft so elements smoothly glide towards the right
        el.scrollLeft -= speed;

        const singleSetWidth = el.scrollWidth / 3;
        if (singleSetWidth > 0) {
          if (el.scrollLeft <= singleSetWidth) {
            el.scrollLeft += singleSetWidth;
          } else if (el.scrollLeft >= singleSetWidth * 2) {
            el.scrollLeft -= singleSetWidth;
          }
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    const onWheel = () => {
      isInteracting.current = true;
      clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => {
        isInteracting.current = false;
      }, 1500);
    };

    el.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener('wheel', onWheel);
      clearTimeout(resumeTimer.current);
    };
  }, []);

  const handlePointerDown = (e) => {
    const el = carouselRef.current;
    if (!el) return;
    setIsDragging(true);
    isInteracting.current = true;
    clearTimeout(resumeTimer.current);
    dragStartX.current = e.pageX - el.offsetLeft;
    dragStartScroll.current = el.scrollLeft;
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const el = carouselRef.current;
    const currentX = e.pageX - el.offsetLeft;
    const walk = (currentX - dragStartX.current) * 1.35;
    el.scrollLeft = dragStartScroll.current - walk;

    const singleSetWidth = el.scrollWidth / 3;
    if (singleSetWidth > 0) {
      if (el.scrollLeft <= singleSetWidth) {
        el.scrollLeft += singleSetWidth;
        dragStartScroll.current += singleSetWidth;
      } else if (el.scrollLeft >= singleSetWidth * 2) {
        el.scrollLeft -= singleSetWidth;
        dragStartScroll.current -= singleSetWidth;
      }
    }
  };

  const handlePointerUpOrCancel = () => {
    if (isDragging) {
      setIsDragging(false);
      clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => {
        isInteracting.current = false;
      }, 1500);
    }
  };

  const handleManualScroll = (direction) => {
    const el = carouselRef.current;
    if (!el) return;
    isInteracting.current = true;
    clearTimeout(resumeTimer.current);
    const offset = direction === 'left' ? -310 : 310;
    el.scrollBy({ left: offset, behavior: 'smooth' });
    resumeTimer.current = setTimeout(() => {
      isInteracting.current = false;
    }, 2000);
  };

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-theme/10 text-theme border border-theme/20 shadow-2xs">
              <Building2 className="w-3.5 h-3.5" />
              <span>Project SEENta • PUP Biñan Campus</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              About Project SEENta
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              A decentralized, modern lost-and-found clearinghouse built for the Polytechnic University of the Philippines – Biñan Campus, connecting finders and rightful owners directly with speed, honesty, and accountability.
            </p>
          </div>
        </ScrollReveal>

        {/* 1. Mission and Vision Statements */}
        <section className="space-y-8">
          <ScrollReveal threshold={0.05} yOffset={16}>
            <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Foundational Purpose
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                Mission & Vision Statements
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission */}
            <ScrollReveal threshold={0.05} delay={60} yOffset={16}>
              <div className="group relative flex flex-col justify-between h-full cursor-default">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Mission
                    </span>
                  </div>
                  <blockquote className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed border-l-2 border-red-500/30 dark:border-red-500/40 pl-4 sm:pl-5 group-hover:border-red-500 transition-colors duration-300">
                    &ldquo;To provide the PUP Biñan community with a fast, transparent, and decentralized lost-and-found platform that connects finders and owners directly, eliminating administrative delays while upholding honesty, safety, and accountability across campus.&rdquo;
                  </blockquote>
                </div>
              </div>
            </ScrollReveal>

            {/* Vision */}
            <ScrollReveal threshold={0.05} delay={120} yOffset={16}>
              <div className="group relative flex flex-col justify-between h-full cursor-default">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Vision
                    </span>
                  </div>
                  <blockquote className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed border-l-2 border-red-500/30 dark:border-red-500/40 pl-4 sm:pl-5 group-hover:border-red-500 transition-colors duration-300">
                    &ldquo;To foster an honest, secure, and digitally empowered university environment where misplaced belongings are swiftly reunited with their rightful owners, ensuring no student or faculty member is left behind.&rdquo;
                  </blockquote>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 2. Core Pillars */}
        <section className="space-y-8">
          <ScrollReveal threshold={0.05} yOffset={16}>
            <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Guiding Principles
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
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
                title: 'Safety & Security',
                icon: Lock,
                desc: 'Promoting safe handovers at designated, CCTV-monitored campus Safe-Exchange Zones.'
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

        {/* 3. Meet the Team Section */}
        <section className="space-y-8 pt-2">
          <ScrollReveal threshold={0.05} yOffset={16}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Our Builders
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                  Meet the team behind Project SEENta
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm hidden sm:block">
                  The Group 12 developers and researchers from PUP Biñan Campus, dedicated to student-centered property recovery.
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleManualScroll('left')}
                    className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-90 shadow-2xs"
                    title="Previous member"
                    aria-label="Previous member"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleManualScroll('right')}
                    className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-90 shadow-2xs"
                    title="Next member"
                    aria-label="Next member"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Continuous Left-Moving Marquee Preview (Scrollable & Draggable) */}
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-12 overflow-hidden py-3">
            {/* Left Edge Gradient Fade */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10"
              aria-hidden="true"
            />
            {/* Right Edge Gradient Fade */}
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10"
              aria-hidden="true"
            />

            {/* Scrollable & Draggable Track */}
            <div
              ref={carouselRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUpOrCancel}
              onPointerLeave={handlePointerUpOrCancel}
              onMouseEnter={() => { isInteracting.current = true; }}
              onMouseLeave={() => {
                if (!isDragging) {
                  clearTimeout(resumeTimer.current);
                  resumeTimer.current = setTimeout(() => {
                    isInteracting.current = false;
                  }, 800);
                }
              }}
              className={`flex gap-6 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 lg:px-12 select-none touch-pan-x ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {carouselItems.map((member, idx) => (
                <div
                  key={`${member.id}-${idx}`}
                  className="w-[260px] sm:w-[280px] shrink-0 group cursor-default transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Photo / Avatar Frame */}
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs group-hover:border-red-500/40 dark:group-hover:border-red-500/40 group-hover:shadow-md transition-all duration-300">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        draggable={false}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100/90 dark:from-slate-900 dark:to-slate-900/60 text-slate-400 dark:text-slate-600 select-none">
                        <div className="w-16 h-16 rounded-full bg-red-500/[0.08] dark:bg-red-500/[0.14] border border-red-500/20 text-red-600 dark:text-red-400 font-mono font-bold text-lg flex items-center justify-center mb-3 shadow-2xs group-hover:scale-110 group-hover:bg-red-500/[0.16] transition-transform duration-300">
                          {member.initials}
                        </div>
                        <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 dark:text-slate-500">
                          Photo Pending
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Member Meta */}
                  <div className="pt-3.5 px-0.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-theme transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs font-mono font-semibold text-red-600 dark:text-red-400 mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
