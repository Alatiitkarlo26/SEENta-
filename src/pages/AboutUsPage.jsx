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
import roderickImg from '../assets/RODERICK.jpg';
import karloImg from '../assets/karlo.jpg';
import neilvenImg from '../assets/neilven.jpg';

const TEAM_MEMBERS = [
  {
    id: 'alatiit',
    name: 'Alatiit, Jian Karlo',
    role: 'Full-Stack Developer',
    initials: 'JA',
    image: karloImg
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
    image: neilvenImg
  }
];

export default function AboutUsPage({ onNavigateBack }) {
  const [copied, setCopied] = useState(false);
  const [showSubNav, setShowSubNav] = useState(true);
  const lastScrollY = useRef(0);

  // References and states for interactive smooth scrolling
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const lastPointerX = useRef(0);
  const posRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Quadruplicate array for seamless infinite wraparound
  const carouselItems = [...TEAM_MEMBERS, ...TEAM_MEMBERS, ...TEAM_MEMBERS, ...TEAM_MEMBERS];

  // Helper to measure exact width of 1 complete set including gaps
  const getLoopWidth = () => {
    const el = carouselRef.current;
    if (!el) return 0;
    if (el.children && el.children.length >= TEAM_MEMBERS.length * 2) {
      const first = el.children[0];
      const nextSet = el.children[TEAM_MEMBERS.length];
      if (first && nextSet) {
        const dist = nextSet.getBoundingClientRect().left - first.getBoundingClientRect().left;
        if (dist > 100) return dist;
      }
    }
    return el.scrollWidth > 0 ? el.scrollWidth / 4 : 0;
  };

  // Helper to wrap position seamlessly within the middle sets
  const wrapPosition = (width) => {
    if (width <= 0) return;
    if (posRef.current <= width * 0.5) {
      posRef.current += width;
      if (carouselRef.current) carouselRef.current.scrollLeft = posRef.current;
    } else if (posRef.current >= width * 2.5) {
      posRef.current -= width;
      if (carouselRef.current) carouselRef.current.scrollLeft = posRef.current;
    }
  };

  // Initialize scroll position to middle on mount
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const initPos = () => {
      const loopWidth = getLoopWidth();
      if (loopWidth > 0) {
        posRef.current = loopWidth * 1.5;
        el.scrollLeft = posRef.current;
        return true;
      }
      return false;
    };

    if (!initPos()) {
      const timer = setTimeout(initPos, 60);
      return () => clearTimeout(timer);
    }
  }, []);

  // Constantly move in a loop without stopping using requestAnimationFrame
  useEffect(() => {
    let animId;
    // Gentle continuous glide speed (pixels per second)
    const speed = 28;
    lastTimeRef.current = performance.now();

    const step = (now) => {
      const el = carouselRef.current;
      if (el) {
        const delta = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        lastTimeRef.current = now;

        // If user is NOT dragging, continuously move smoothly
        if (!isDraggingRef.current) {
          // If the user scrolled natively (trackpad / mousewheel), sync position
          if (Math.abs(el.scrollLeft - posRef.current) > 2) {
            posRef.current = el.scrollLeft;
          }

          // Smooth continuous drift towards the right
          posRef.current -= speed * delta;
          el.scrollLeft = posRef.current;

          const loopWidth = getLoopWidth();
          wrapPosition(loopWidth);
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const handlePointerDown = (e) => {
    const el = carouselRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    lastPointerX.current = e.pageX;
    posRef.current = el.scrollLeft;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !carouselRef.current) return;
    e.preventDefault();
    const el = carouselRef.current;
    const currentX = e.pageX;
    const deltaX = currentX - lastPointerX.current;
    lastPointerX.current = currentX;

    // Directly move it around with the user's cursor / touch
    posRef.current -= deltaX;
    el.scrollLeft = posRef.current;

    const loopWidth = getLoopWidth();
    wrapPosition(loopWidth);
  };

  const handlePointerUpOrCancel = (e) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      lastTimeRef.current = performance.now();
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      } catch {}
    }
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

        {/* 3. Meet the Team Section */}
        <section className="space-y-8 pt-2">
          <ScrollReveal threshold={0.05} yOffset={16}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Meet the team behind SEENta
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                The Group 12 developers and researchers from PUP Biñan Campus, dedicated to student-centered property recovery.
              </p>
            </div>
          </ScrollReveal>

          {/* Continuous Right-Moving Carousel Preview (Scrollable & Draggable) */}
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
              onPointerCancel={handlePointerUpOrCancel}
              className={`flex gap-6 overflow-x-auto no-scrollbar scroll-auto px-4 sm:px-6 lg:px-12 select-none touch-pan-x ${
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
