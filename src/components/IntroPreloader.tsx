import { useEffect, useRef, useState } from "react";

// Lightweight GSAP loader (CDN) to avoid adding dependencies
function useGsap() {
  const [gsap, setGsap] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    if ((window as any).gsap) {
      setGsap((window as any).gsap);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
    s.async = true;
    s.onload = () => mounted && setGsap((window as any).gsap);
    s.onerror = () => mounted && setGsap(null);
    document.head.appendChild(s);
    return () => {
      mounted = false;
    };
  }, []);
  return gsap;
}

export default function IntroPreloader() {
  const [show, setShow] = useState(false);
  const gsap = useGsap();

  const wrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Play once per session
    const played = sessionStorage.getItem("introPlayed");
    if (!played) {
      setShow(true);
      sessionStorage.setItem("introPlayed", "1");
    }
  }, []);

  useEffect(() => {
    if (!show || !gsap || !wrapRef.current) return;

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" }
    });

    // Simple text char-anim without SplitText
    const logoEl = logoRef.current as HTMLDivElement | null;
    if (logoEl) {
      const text = logoEl.innerText;
      logoEl.innerHTML = "";
      const frag = document.createDocumentFragment();
      const spans: HTMLSpanElement[] = [];
      for (const ch of text) {
        const span = document.createElement("span");
        span.textContent = ch;
        span.style.display = "inline-block";
        span.style.transform = "translateY(-100%)";
        frag.appendChild(span);
        spans.push(span);
      }
      logoEl.appendChild(frag);
      tl.to(spans, { y: 0, stagger: 0.02, duration: 0.45, ease: "power2.out" }, 0);
    }

    // Progress bar grow
    if (barRef.current) {
      gsap.set(barRef.current, { scaleX: 0, transformOrigin: "left" });
      tl.to(barRef.current, { scaleX: 1, duration: 1.8, ease: "power3.inOut" }, 0.1);
    }

    // Mask pulse
    if (maskRef.current) {
      gsap.set(maskRef.current, { scale: 1, transformOrigin: "center" });
      tl.to(maskRef.current, { scale: 3, duration: 0.8, ease: "expo.inOut" }, 0.9);
    }

    // Fade everything out then unmount
    tl.to(wrapRef.current, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, "+=0.2").add(() => {
      setShow(false);
    });

    return () => {
      tl.kill();
    };
  }, [show, gsap]);

  if (!show) return null;

  return (
    <div ref={wrapRef} className="fixed inset-0 z-[200] pointer-events-none">
      {/* Dim BG */}
      <div className="absolute inset-0 bg-[#2D2925]" />

      {/* Progress surface */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Background grow bar */}
          <div ref={barRef} className="absolute inset-0 bg-white/90" />

          {/* Centered logo text */}
          <div className="absolute inset-0 flex items-center justify-center mix-blend-difference">
            <div ref={logoRef} className="text-4xl md:text-6xl font-semibold tracking-tight text-white select-none">
              THRIVE
            </div>
          </div>
        </div>
      </div>

      {/* Circular mask pulse */}
      <div ref={maskRef} className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-[40vw] max-w-[420px] aspect-square rounded-full"
          style={{
            WebkitMaskImage: "radial-gradient(circle, black 60%, transparent 61%)",
            maskImage: "radial-gradient(circle, black 60%, transparent 61%)",
            background:
              "radial-gradient(closest-side, rgba(255,255,255,0.8), rgba(255,255,255,0))",
          }}
        />
      </div>
    </div>
  );
}
