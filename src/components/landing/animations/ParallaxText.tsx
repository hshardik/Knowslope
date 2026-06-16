import { useEffect, useRef, useState, ReactNode } from 'react';

interface ParallaxTextProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export const ParallaxText = ({ 
  children, 
  className = '',
  intensity = 15
}: ParallaxTextProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      
      setTransform({
        x: deltaX * intensity,
        y: deltaY * intensity * 0.5,
      });
    };

    const handleMouseLeave = () => {
      setTransform({ x: 0, y: 0 });
    };

    // Only apply on desktop
    if (window.innerWidth > 768) {
      window.addEventListener('mousemove', handleMouseMove);
      ref.current?.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [intensity]);

  return (
    <div 
      ref={ref}
      className={className}
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {children}
    </div>
  );
};
