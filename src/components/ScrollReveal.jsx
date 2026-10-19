import { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal
 * Elegant reveal-on-scroll component inspired by Apple & Mobbin design systems.
 * 
 * Key behavior:
 * - Smoothly fades and slides elements up when they enter viewport during scrolling down.
 * - DOES NOT RESET when the user scrolls back up (retains visible state permanently).
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 650,
  threshold = 0.08,
  yOffset = 18,
  as: Component = 'div',
  ...props
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If already revealed once, keep it permanently visible (never reset when scrolling up)
    if (isVisible) return;

    const node = ref.current;
    if (!node) return;

    // Graceful fallback for non-supporting browsers
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -30px 0px' // Triggers slightly before element reaches bottom of viewport
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, threshold]);

  return (
    <Component
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: delay ? `${delay}ms` : undefined,
        transform: isVisible ? 'translateY(0)' : `translateY(${yOffset}px)`,
        willChange: isVisible ? 'auto' : 'opacity, transform'
      }}
      className={`transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
