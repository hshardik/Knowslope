import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  stagger?: boolean;
}

export const ScrollReveal = ({ 
  children, 
  className = '', 
  delay = 0,
  threshold = 0.1,
  stagger = false
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsRevealed(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold]);

  const baseClass = stagger ? 'reveal-stagger' : 'reveal';

  return (
    <div 
      ref={ref} 
      className={`${baseClass} ${isRevealed ? 'revealed' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
