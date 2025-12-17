import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            console.log(`Saved email to newsletter_subscribers.txt: ${email}`);
            setSubmitted(true);
        }
    };

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
                    {!submitted ? (
                        <div className="max-w-3xl mx-auto animate-fade-in-up">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-glacier to-primary flex items-center justify-center mx-auto mb-8 shadow-lg shadow-glacier/20">
                                <Mail className="w-10 h-10 text-white" />
                            </div>

                            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 tracking-tight drop-shadow-2xl">
                                Stay in the <span className="text-gradient hover:text-glacier transition-colors">Loop</span>
                            </h1>

                            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md">
                                Subscribe to our newsletter for exclusive offers, wellness tips, and be the first to know about new product launches.
                            </p>

                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 h-14 px-6 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-glacier focus:bg-white/15 transition-all text-lg backdrop-blur-sm"
                                    required
                                />
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-14 rounded-full px-8 bg-glacier hover:bg-glacier/90 text-white font-bold text-lg shadow-lg shadow-glacier/20 transition-all hover:scale-105"
                                >
                                    Subscribe
                                </Button>
                            </form>

                            <p className="text-sm text-white/40 mt-6 font-light">
                                No spam, ever. Unsubscribe anytime.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto animate-fade-in-up">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-glacier flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
                                <Check className="w-12 h-12 text-white" />
                            </div>

                            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-glacier drop-shadow-sm">
                                You're In!
                            </h1>

                            <p className="text-xl text-white/90 mb-10 max-w-lg mx-auto leading-relaxed">
                                Thanks for subscribing! Check your inbox for a welcome email with your exclusive perks.
                            </p>

                            <Button
                                variant="outline"
                                onClick={() => { setSubmitted(false); setEmail(""); }}
                                className="rounded-full px-8 py-6 text-lg border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/40"
                            >
                                Subscribe Another Email
                            </Button>
                        </div>
                    )}
                </div>


            </section>

            <Footer />
        </div>
    );
}
