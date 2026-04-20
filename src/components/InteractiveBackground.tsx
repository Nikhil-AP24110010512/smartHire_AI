import { useEffect, useState } from 'react';

export function InteractiveBackground() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };
    
    // Only add listener on desktop, otherwise performance is poor
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isVisible]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      {/* The glowing mouse tracker spotlight */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${isVisible ? 'opacity-40 dark:opacity-60' : 'opacity-0'}`}
        style={{
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(120, 119, 198, 0.25) 0%, transparent 80%)`,
        }}
      />
      {/* Premium dark grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.08]"></div>
    </div>
  );
}
