import { useEffect, useRef, useCallback } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

interface WaterRippleProps {
  className?: string;
  color?: string;
  maxRipples?: number;
  rippleSpeed?: number;
  autoRipple?: boolean;
}

export function WaterRipple({
  className = '',
  color = 'rgba(59, 130, 246, 0.3)', // Blue color matching theme
  maxRipples = 5,
  rippleSpeed = 2,
  autoRipple = true
}: WaterRippleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const animationRef = useRef<number>();
  const lastAutoRippleRef = useRef<number>(0);

  const createRipple = useCallback((x: number, y: number) => {
    const newRipple: Ripple = {
      x,
      y,
      radius: 0,
      maxRadius: Math.random() * 100 + 50,
      opacity: 0.6,
      speed: rippleSpeed + Math.random() * 2
    };

    ripplesRef.current = [...ripplesRef.current, newRipple].slice(-maxRipples);
  }, [maxRipples, rippleSpeed]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw ripples
    ripplesRef.current = ripplesRef.current.filter(ripple => {
      ripple.radius += ripple.speed;
      ripple.opacity = Math.max(0, 0.6 * (1 - ripple.radius / ripple.maxRadius));

      if (ripple.opacity <= 0) return false;

      // Draw ripple
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.strokeStyle = color.replace('0.3', String(ripple.opacity));
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw inner ripple for depth
      if (ripple.radius > 10) {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = color.replace('0.3', String(ripple.opacity * 0.5));
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      return true;
    });

    // Auto-generate ripples
    if (autoRipple && Date.now() - lastAutoRippleRef.current > 2000) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      createRipple(x, y);
      lastAutoRippleRef.current = Date.now();
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [color, autoRipple, createRipple]);

  const handleInteraction = useCallback((event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;

    if (event instanceof MouseEvent) {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    } else {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    }

    createRipple(x, y);
  }, [createRipple]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();

    // Add event listeners
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('click', handleInteraction);
    canvas.addEventListener('touchstart', handleInteraction);

    // Start animation
    animate();

    // Create initial ripples
    setTimeout(() => {
      createRipple(canvas.width * 0.3, canvas.height * 0.4);
    }, 500);

    setTimeout(() => {
      createRipple(canvas.width * 0.7, canvas.height * 0.6);
    }, 1200);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleInteraction);
      canvas.removeEventListener('touchstart', handleInteraction);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resizeCanvas, handleInteraction, animate, createRipple]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'auto' }}
    />
  );
}
