import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import WaveMarquee from "@/components/WaveMarquee";
import { ChevronDown } from "lucide-react";
import { HeroProductSlideshow } from "@/components/HeroProductSlideshow";

const thriveFactors = [
  {
    title: "MATERIALS",
    content: "We use only premium, food-grade stainless steel and BPA-free materials. Every product is designed with durability and safety in mind, ensuring your wellness journey is built on a solid foundation."
  },
  {
    title: "SUSTAINABILITY",
    content: "Our commitment to the planet drives every decision. From recyclable packaging to carbon-neutral shipping, we're dedicated to reducing our environmental footprint while helping you reduce yours."
  },
  {
    title: "CUSTOMIZATION",
    content: "Your wellness journey is unique, and your products should be too. Choose from a range of colors, sizes, and configurations to find the perfect fit for your lifestyle."
  },
  {
    title: "CONVENIENCE",
    content: "Designed for life on the go. Our products feature easy-clean designs, leak-proof seals, and portable sizes that fit seamlessly into your daily routine."
  },
];

const Index = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <Hero />

      {/* Tagline Section - Navy split layout */}
      <section id="tagline" className="relative bg-navy-medium py-16 md:py-24">
        <div className="absolute inset-0 matrix-dots opacity-20" aria-hidden="true" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 items-center gap-10">
            {/* Left: stacked text */}
            <div className="text-left">
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight space-y-2">
                <div>WE CREATE</div>
                <div>INNOVATIVE</div>
                <div>PRODUCTS THAT</div>
                <div>MAKE WELLNESS</div>
                <div><span className="text-glacier">SIMPLE.</span></div>
              </h2>
            </div>
            {/* Right: product card slideshow */}
            <div className="flex justify-center w-full">
              <HeroProductSlideshow />
            </div>
          </div>
        </div>
      </section>

      {/* Wavy Scrolling Text */}
      <section className="py-12 overflow-hidden bg-navy-medium relative z-10">
        <WaveMarquee speedSeconds={25} amplitudePx={24} tightnessSeconds={-0.04} repeats={4} />
      </section>

      {/* Section Divider - Pure white */}
      <div className="bg-navy-medium pt-12">
        <div className="w-full h-px bg-white relative z-10"></div>
      </div>

      {/* The Thrive Factor - split layout with accordions */}
      <section className="py-16 md:py-24 bg-navy-medium relative overflow-hidden">
        <div className="absolute inset-0 matrix-dots opacity-10" aria-hidden="true" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 items-start gap-12">
            {/* Left: Heading + accordion list */}
            <div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-3">
                THE THRIVE <span className="text-glacier">FACTOR</span>
              </h2>
              <p className="font-display text-xl sm:text-2xl font-extrabold text-white/90 tracking-wide mb-10">
                MADE WITH A CONSCIENCE TO THE WORLD
              </p>

              <div className="divide-y divide-white/20 max-w-xl">
                {thriveFactors.map((item) => (
                  <div key={item.title} className="py-4">
                    <button
                      onClick={() => toggleAccordion(item.title)}
                      className="flex items-center justify-between w-full text-white/90 hover:text-white transition-colors"
                    >
                      <span className="font-display text-xl font-bold tracking-wide">{item.title}</span>
                      <ChevronDown
                        className={`w-6 h-6 transition-transform duration-300 ${openAccordion === item.title ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-700 ease-in-out ${openAccordion === item.title ? "max-h-96 mt-6" : "max-h-0"
                        }`}
                    >
                      <p className="text-white/70 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product card */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-br from-navy-medium via-navy-medium/60 to-white/10 p-6 shadow-2xl overflow-hidden">
                <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-navy-medium/40 via-ocean/30 to-white/40 flex items-center justify-center overflow-hidden">
                  <img src="public/product-images/BO-43.png" alt="Thrive Bottle" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
