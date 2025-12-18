import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Heart, Leaf, Shield, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function About() {
  const [productCount, setProductCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        setProductCount(count || 0);
      } catch (error) {
        console.error('Error fetching product count:', error);
        setProductCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProductCount();
  }, []);

  const values = [
    { icon: Leaf, title: "Pure & Natural", desc: "Only the finest natural ingredients" },
    { icon: Shield, title: "Lab Tested", desc: "Third-party verified quality" },
    { icon: Heart, title: "Customer First", desc: "Your wellness is our priority" },
    { icon: Zap, title: "Real Results", desc: "Science-backed formulas" },
  ];

  const stats = [
    { value: loading ? "..." : productCount.toString(), label: "Products Available" },
    { value: "1500+", label: "Products Sold" },
    { value: "500+", label: "Customers Served" },
    { value: "1", label: "Year Strong" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-glacier/20 via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-glacier/10 via-transparent to-transparent" />

        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-wide mb-6">About Us</h1>
          <p className="text-xl text-white/60 max-w-md mx-auto">
            We dreamt it, we built it, and we shipped it.
          </p>
        </div>

        <button
          onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </button>
      </section>

      {/* Stats Section */}
      <section id="story" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl md:text-5xl font-black text-glacier mb-2">{stat.value}</div>
                <div className="text-white/50 text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8">Our Story</h2>
          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Thrive started with a simple frustration: the wellness industry was full of empty promises.
          </p>
          <p className="text-lg text-white/60 leading-relaxed mb-6">
            We set out to create something different—pure ingredients, real science, actual results. 
            No shortcuts, no compromises.
          </p>
          <p className="text-lg text-white/60 leading-relaxed">
            Based in Aurora, Illinois, we've been here for one year and counting, building a wellness revolution one product at a time.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">What We Stand For</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div 
                key={value.title}
                className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-glacier/30 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-glacier/20 flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-glacier" />
                </div>
                <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-white/50 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Thrive?</h2>
          <p className="text-white/60 mb-10">
            Join thousands who've made the switch to wellness that works.
          </p>
          <Button 
            variant="hero" 
            size="lg" 
            className="rounded-full px-10 py-6 bg-glacier text-black font-bold hover:bg-glacier/90" 
            asChild
          >
            <Link to="/shop">
              Explore Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
