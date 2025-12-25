import { useEffect, useRef } from 'react';

type ColorTheme = 'blue' | 'purple' | 'orange' | 'rainbow';

interface HeroTubesCursorProps {
  theme: ColorTheme;
}

const themeColors: Record<ColorTheme, { tubes: string[]; lights: string[] }> = {
  blue: {
    tubes: ['#3b82f6', '#60a5fa', '#1e40af'],
    lights: ['#38bdf8', '#0ea5e9', '#2563eb', '#7dd3fc']
  },
  purple: {
    tubes: ['#8b5cf6', '#a78bfa', '#6d28d9'],
    lights: ['#c084fc', '#a855f7', '#7c3aed', '#d8b4fe']
  },
  orange: {
    tubes: ['#f97316', '#fb923c', '#ea580c'],
    lights: ['#fdba74', '#f97316', '#ff88a1', '#fbbf24']
  },
  rainbow: {
    tubes: ['#f967fb', '#53bc28', '#6958d5'],
    lights: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5']
  }
};

// Dynamic import helper to avoid TS errors with CDN imports
const loadTubesCursor = async () => {
  // @ts-expect-error - CDN dynamic import
  const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
  return module.default;
};

export function HeroTubesCursor({ theme }: HeroTubesCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on mobile devices
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    let mounted = true;

    const initTubes = async () => {
      if (!canvasRef.current || !mounted) return;

      try {
        const TubesCursor = await loadTubesCursor();
        
        if (!mounted || !canvasRef.current) return;

        const colors = themeColors[theme];
        
        appRef.current = TubesCursor(canvasRef.current, {
          tubes: {
            colors: colors.tubes,
            lights: {
              intensity: 120, // Toned down from 200
              colors: colors.lights
            }
          }
        });
      } catch (error) {
        console.error('Failed to load TubesCursor:', error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      if (appRef.current?.dispose) {
        appRef.current.dispose();
      }
    };
  }, [theme]);

  // Track mouse only within hero section
  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroElement.getBoundingClientRect();
      const isInHero = (
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      );

      if (canvasRef.current) {
        canvasRef.current.style.pointerEvents = isInHero ? 'auto' : 'none';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={heroRef} className="absolute inset-0 z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}