import { useRef, useState, useEffect } from "react";
import { ChevronDown, Play, Pause } from "lucide-react";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);

  const GradientLetter = ({ letter }: { letter: string }) => {
    return (
      <span
        className="ve-gradient-letter"
        aria-label={letter}
        style={{
          WebkitTextStroke: '0.5px white',
          background:
            "linear-gradient(135deg, rgba(34,211,238,1) 0%, rgba(56,189,248,1) 30%, rgba(59,130,246,1) 60%, rgba(14,165,233,1) 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        }}
      >
        {letter}
      </span>
    );
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const playPromise = v.play();
    if (playPromise && typeof (playPromise as any).then === "function") {
      (playPromise as Promise<void>).catch(() => {
        setPlaying(false);
      });
    }
  }, []);

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
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-24">
      <style>{`
        .ve-gradient-letter{
          display: inline-block;
          line-height: 1;
          vertical-align: baseline;
        }
      `}</style>
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
          <h1 className="font-display text-[clamp(4rem,15vw,20rem)] font-black mb-4 md:mb-6 animate-fade-in-up tracking-[0.06em] leading-none text-center">
            <span className="text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)] whitespace-nowrap">
              <span className="inline-block text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">T</span>
              <span className="inline-block text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">H</span>
              <span className="inline-block text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">R</span>
              <span className="inline-block text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">I</span>
              <GradientLetter letter="V" />
              <GradientLetter letter="E" />
            </span>
          </h1>

          {/* WELLNESS THAT WORKS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 animate-fade-in-up delay-100 mb-10 md:mb-12 w-full">
            <span className="font-display font-bold text-white tracking-wide text-[clamp(1.1rem,4vw,2.8rem)] text-center sm:text-left">
              WELLNESS THAT
            </span>
            <span className="font-display font-bold tracking-wide text-[clamp(1.1rem,4vw,2.8rem)]" style={{ color: '#3686F5' }}>
              WORKS
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
