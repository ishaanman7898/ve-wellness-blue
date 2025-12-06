import { useRef, useState } from "react";
import { ChevronDown, Play, Pause } from "lucide-react";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Matrix Dots Background */}
      <div className="absolute inset-0 z-0">
        <div className="matrix-dots"></div>
      </div>

      {/* Video Background */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <video
            ref={videoRef}
            className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/HeroVideo.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Darker overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content - Centered like reference */}
      <div className="container mx-auto px-4 lg:px-8 relative z-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Big THRIVE Text */}
          <h1 className="font-display text-[clamp(4rem,15vw,16rem)] font-black mb-4 md:mb-6 animate-fade-in-up tracking-[0.06em] leading-none">
            <span className="text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">THRIVE</span>
          </h1>

          {/* WELLNESS THAT WORKS with oval around WORKS */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 animate-fade-in-up delay-100 mb-10 md:mb-12">
            <span className="font-display font-bold text-white tracking-wide text-[clamp(1.5rem,4vw,3rem)]">
              WELLNESS THAT
            </span>
            <span className="relative inline-flex items-center justify-center">
              {/* Glow halo */}
              <span className="absolute -inset-3 rounded-full bg-primary/30 blur-xl animate-glow-pulse" aria-hidden="true" />
              <span className="font-display font-bold text-primary tracking-wide px-4 sm:px-6 py-1 text-[clamp(1.5rem,4vw,3rem)]">
                WORKS
              </span>
              {/* Oval border around WORKS */}
              <span className="absolute inset-0 border-2 border-primary/70 rounded-full" />
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        type="button"
        aria-label="Scroll down"
        onClick={() => document.getElementById('tagline')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce z-20 hover:opacity-90 focus:outline-none"
      >
        <ChevronDown className="w-8 h-8 text-white/80" />
      </button>

      {/* Play/Pause control */}
      <button
        type="button"
        aria-label="Play or pause background video"
        onClick={togglePlay}
        className="absolute bottom-4 right-4 z-20 glass-light rounded-full p-3 text-white hover:bg-white/20 transition"
      >
        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
    </section>
  );
}
