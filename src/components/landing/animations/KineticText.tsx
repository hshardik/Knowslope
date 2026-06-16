import { useEffect, useRef, useState } from 'react';

interface KineticTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
  gradient?: boolean;
}

export const KineticText = ({ 
  text, 
  className = '', 
  as: Component = 'h1',
  delay = 0,
  gradient = false
}: KineticTextProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const words = text.split(' ');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="overflow-hidden">
      <Component className={`${className} ${gradient ? 'text-gradient' : ''}`}>
        {words.map((word, index) => (
          <span
            key={index}
            className="kinetic-word inline-block mr-[0.25em]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
              transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.08}s`,
            }}
          >
            {word}
          </span>
        ))}
      </Component>
    </div>
  );
};
