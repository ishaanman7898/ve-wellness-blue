import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Heart, Leaf, Target, Users, ChevronDown } from "lucide-react";

const missionPillars = [
    {
        icon: Heart,
        title: "Health First",
        description: "Every product we create is designed with your health and wellness at the forefront. No compromises, no shortcuts."
    },
    {
        icon: Leaf,
        title: "Sustainability",
        description: "We're committed to reducing our environmental impact through sustainable materials, packaging, and practices."
    },
    {
        icon: Target,
        title: "Quality",
        description: "From sourcing to manufacturing, we maintain the highest standards to deliver products you can trust."
    },
    {
        icon: Users,
        title: "Community",
        description: "We believe in building a community of wellness-minded individuals who support and inspire each other."
    }
];

export default function Mission() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-[#050b1e] to-background text-white pt-16">
                {/* Background dots */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 matrix-dots opacity-15" aria-hidden="true"></div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
                    <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                        Our <span className="text-gradient hover:text-glacier transition-colors cursor-default">Mission</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md">
                        At Thrive, we believe that wellness should be simple, accessible, and sustainable.
                        Our mission is to create innovative products that empower you to live your best life
                        while caring for the planet we all share.
                    </p>
                </div>

                {/* Scroll Indicator */}
                <button
                    type="button"
                    aria-label="Scroll down"
                    onClick={() => window.scrollTo({ behavior: 'smooth', top: window.innerHeight })}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20 hover:opacity-90 focus:outline-none"
                >
                    <ChevronDown className="w-8 h-8 text-white/60" />
                </button>
            </section>

            {/* Pillars Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {missionPillars.map((pillar, index) => (
                            <div key={index} className="glass rounded-2xl p-8 hover:bg-white/5 transition-colors border border-white/10">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                    <pillar.icon className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="font-display text-2xl font-bold mb-4">{pillar.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    {pillar.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
