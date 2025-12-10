import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Leaf, Shield, Award, Users, Target, ChevronDown } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Leaf,
      title: "Natural Ingredients",
      description: "We source only the purest, highest-quality natural ingredients from trusted suppliers around the world."
    },
    {
      icon: Shield,
      title: "Third-Party Tested",
      description: "Every batch is rigorously tested by independent laboratories to ensure safety and potency."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your wellness journey is our priority. We're here to support you every step of the way."
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "GMP certified facilities and strict quality control measures guarantee product excellence."
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "27", label: "Premium Products" },
    { number: "99%", label: "Satisfaction Rate" },
    { number: "5+", label: "Years of Excellence" }
  ];

  const team = [
    {
      name: "Mission",
      icon: Target,
      description: "To empower individuals to achieve their peak potential through premium, science-backed wellness solutions."
    },
    {
      name: "Vision",
      icon: Users,
      description: "A world where everyone has access to the tools they need to thrive physically, mentally, and emotionally."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-[#050b1e] to-background">
        {/* Background dots */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 matrix-dots opacity-10" aria-hidden="true"></div>
        </div>
        {/* Content */}
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            About us
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
            Learn about Thrive's journey, mission, and values.
          </p>
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

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Born in the Mountains
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Thrive was founded with a simple yet powerful mission: to bring the purity and strength of nature to your daily wellness routine.
                Inspired by the pristine peaks and crystal-clear waters of mountain landscapes, our products embody the essence of natural vitality.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We started with a small team of health enthusiasts, scientists, and athletes who shared a common frustration—the wellness industry was flooded with products that promised everything but delivered little.
                We set out to change that by creating supplements that are as pure as they are effective.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, Thrive has grown into a trusted name in wellness, but our core values remain unchanged.
                Every product we create is a testament to our commitment to quality, transparency, and your well-being.
              </p>
            </div>
            <div className="glass rounded-2xl p-8 md:p-12">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((item, index) => (
              <div key={index} className="glass rounded-2xl p-8 md:p-10">
                <item.icon className="w-12 h-12 text-primary mb-6" />
                <h3 className="font-display text-2xl font-bold mb-4">{item.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at Thrive.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-muted-foreground mb-8">
              Discover our range of premium wellness products and take the first step towards a healthier, more vibrant you.
            </p>
            <Button variant="hero" size="lg" className="rounded-full px-8 py-6" asChild>
              <Link to="/shop">
                Explore Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
