import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChevronDown } from "lucide-react";

const fallbackPlaceholder = "/placeholder.svg";

// Expect converted PNGs in /public/team/*.png. Fallback to placeholder until provided.
const teamImages = [
  "/team/IMG_3614.png",
  "/team/IMG_3615.png",
  "/team/IMG_3618.png",
  "/team/IMG_3619.png",
  "/team/IMG_3620.png",
  "/team/IMG_3622.png",
  "/team/IMG_3623.png",
  "/team/IMG_3624.png",
  "/team/IMG_3626.png",
  "/team/IMG_3627.png",
  "/team/IMG_3629.png",
  "/team/IMG_3630.png",
  "/team/IMG_3631.png",
  "/team/IMG_3633.png",
  "/team/IMG_3636.png",
  "/team/IMG_3637.png",
  "/team/IMG_3639.png",
  "/team/IMG_3640.png",
  "/team/IMG_3642.png",
  "/team/IMG_3643.png",
];

const teamMembers = [
  {
    name: "Team Member 1",
    role: "CEO & Founder",
    image: teamImages[0],
    bio: "Passionate about wellness and sustainability, leading Thrive's vision."
  },
  {
    name: "Team Member 2",
    role: "CFO",
    image: teamImages[1],
    bio: "Managing finances and ensuring Thrive's growth and stability."
  },
  {
    name: "Team Member 3",
    role: "CMO",
    image: teamImages[2],
    bio: "Crafting the Thrive brand story and connecting with our community."
  },
  {
    name: "Team Member 4",
    role: "COO",
    image: teamImages[3],
    bio: "Overseeing operations to deliver the best products to you."
  },
  {
    name: "Team Member 5",
    role: "Head of Product",
    image: teamImages[4],
    bio: "Designing innovative products that make wellness simple."
  },
  {
    name: "Team Member 6",
    role: "Head of Sales",
    image: teamImages[5],
    bio: "Building relationships and growing the Thrive family."
  },
];

export default function Team() {
  useEffect(() => {
    let gsapInstance: any = null;
    let tickerAdded = false;
    let onMove: ((e: MouseEvent) => void) | null = null;

    const ensureGsap = () =>
      new Promise<void>((resolve, reject) => {
        if ((window as any).gsap) return resolve();
        const existing = document.querySelector('script[data-gsap-inline="true"]');
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject(new Error("Failed to load GSAP")));
          return;
        }
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
        s.async = true;
        s.setAttribute("data-gsap-inline", "true");
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load GSAP"));
        document.head.appendChild(s);
      });

    ensureGsap()
      .then(() => {
        gsapInstance = (window as any).gsap;
        if (!gsapInstance) return;

        const images = gsapInstance.utils.toArray(".hero-trail-image") as HTMLElement[];
        if (!images.length) return;

        const gap = 200;
        let index = 0;
        const wrapper = gsapInstance.utils.wrap(0, images.length);
        gsapInstance.defaults({ duration: 1 });

        let mousePos = { x: 0, y: 0 };
        let lastMousePos = { x: 0, y: 0 };
        let cachedMousePos = { x: 0, y: 0 };

        onMove = (e: MouseEvent) => {
          mousePos = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener("mousemove", onMove);

        const playAnimation = (img: HTMLElement) => {
          const tl = gsapInstance.timeline();
          tl.from(img, { scale: 0.8, duration: 2 }, "<").to(
            img,
            {
              y: "120vh",
              rotation: gsapInstance.utils.random([360, -360]),
              ease: "back.in(.4)",
              duration: 1,
              filter: "blur(5px)",
            },
            0
          );
        };

        const animateImage = () => {
          const wrappedIndex = wrapper(index);
          const img = images[wrappedIndex] as HTMLElement;
          gsapInstance.killTweensOf(img);
          gsapInstance.set(img, { clearProps: "all" });
          gsapInstance.set(img, {
            opacity: 1,
            left: mousePos.x,
            top: mousePos.y,
            xPercent: -50,
            yPercent: -50,
          });
          playAnimation(img);
          index++;
        };

        const imageTrail = () => {
          const travelDistance = Math.hypot(lastMousePos.x - mousePos.x, lastMousePos.y - mousePos.y);
          cachedMousePos.x = gsapInstance.utils.interpolate(cachedMousePos.x || mousePos.x, mousePos.x, 0.1);
          cachedMousePos.y = gsapInstance.utils.interpolate(cachedMousePos.y || mousePos.y, mousePos.y, 0.1);

          if (travelDistance > gap) {
            animateImage();
            lastMousePos = { ...mousePos };
          }
        };

        gsapInstance.ticker.add(imageTrail);
        tickerAdded = true;
        // store for cleanup
        (window as any).__teamImageTrail = imageTrail;
      })
      .catch(() => {
        // silently ignore if GSAP fails to load
      });

    return () => {
      if (onMove) window.removeEventListener("mousemove", onMove);
      if (gsapInstance && tickerAdded && (window as any).__teamImageTrail) {
        gsapInstance.ticker.remove((window as any).__teamImageTrail);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section with GSAP image trail */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-[#0b1b3f] to-background text-white">
        <style>{`
          .hero-trail {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            position: relative;
          }
          .hero-trail-title {
            font-size: clamp(2.25rem, 9vw, 6.5rem);
            font-weight: 700;
            line-height: 1.05;
            text-align: center;
            letter-spacing: -0.02em;
          }
          .hero-trail-image {
            position: fixed;
            opacity: 0;
            width: 140px;
            aspect-ratio: 1 / 1;
            object-fit: cover;
            pointer-events: none;
            border-radius: 18px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.35);
          }
          @media (max-width: 640px) {
            .hero-trail-image { width: 100px; }
          }
        `}</style>

        {/* Gradient and dots background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 matrix-dots opacity-5" aria-hidden="true"></div>
        </div>

        {/* Content */}
        <div className="hero-trail relative z-10 px-4">
          <h1 className="hero-trail-title">Our Team</h1>
          <div className="hero-trail-images" aria-hidden="true">
            {teamImages.map((src, idx) => (
              <img
                key={idx}
                className="hero-trail-image"
                src={src}
                alt=""
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== window.location.origin + fallbackPlaceholder) {
                    target.src = fallbackPlaceholder;
                  }
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Scroll Indicator */}
      <button
        type="button"
        aria-label="Scroll down"
        onClick={() => window.scrollTo({ behavior: 'smooth', top: window.innerHeight })}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce z-20 hover:opacity-90 focus:outline-none"
      >
        <ChevronDown className="w-8 h-8 text-white/80" />
      </button>

      <main className="flex-1 pt-20 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {teamMembers.map((member) => (
                                <div key={member.name} className="glass rounded-xl p-6 border border-border text-center">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-glacier/30 to-primary/30 mx-auto mb-6 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="font-display text-xl font-bold mb-1">{member.name}</h3>
                                    <p className="text-glacier font-medium mb-3">{member.role}</p>
                                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                                </div>
                            ))}
                        </div>

                        {/* Join Us CTA */}
                        <div className="mt-16 glass rounded-xl p-8 border border-border text-center">
                            <h2 className="font-display text-2xl font-bold mb-4">Join Our Team</h2>
                            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                                Interested in being part of Thrive? We're always looking for passionate individuals
                                to join our Virtual Enterprise team.
                            </p>
                            <a
                                href="/contact"
                                className="inline-flex items-center gap-2 text-glacier hover:underline font-medium"
                            >
                                Get in touch →
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
