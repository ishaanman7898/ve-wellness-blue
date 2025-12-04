import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

export function Hero() {
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
          <h1 className="font-display text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem] font-black mb-2 md:mb-4 animate-fade-in-up tracking-tight leading-none">
            <span className="text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">THRIVE</span>
          </h1>

          {/* WELLNESS THAT WORKS with oval around WORKS */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 animate-fade-in-up delay-100 mb-10 md:mb-12">
            <span className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-wide">
              WELLNESS THAT
            </span>
            <span className="relative inline-flex items-center justify-center">
              <span className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary tracking-wide px-4 sm:px-6 py-1">
                WORKS
              </span>
              {/* Oval border around WORKS */}
              <span className="absolute inset-0 border-2 border-primary/70 rounded-full" />
            </span>
          </div>

          {/* CTA Buttons - Fatter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 animate-fade-in-up delay-300 justify-center">
            <Button variant="hero" size="lg" className="rounded-full w-full sm:w-auto text-base sm:text-lg px-8 py-6" asChild>
              <Link to="/shop">
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" className="rounded-full w-full sm:w-auto text-base sm:text-lg px-8 py-6" asChild>
              <Link to="/about">
                Our Story
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20">
        <ChevronDown className="w-8 h-8 text-white/70" />
      </div>
    </section>
  );
}
