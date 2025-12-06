import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Truck, Package, Clock, MapPin } from "lucide-react";

const shippingInfo = [
    {
        icon: Truck,
        title: "Standard Shipping",
        time: "5-7 Business Days",
        price: "Free on orders $50+",
        description: "Our reliable standard shipping option. Orders are processed within 1-2 business days."
    },
    {
        icon: Package,
        title: "Express Shipping",
        time: "2-3 Business Days",
        price: "$9.99",
        description: "Need it faster? Express shipping gets your order to you in no time."
    },
    {
        icon: Clock,
        title: "Same-Day Processing",
        time: "Orders by 2PM EST",
        price: "Included",
        description: "Orders placed before 2PM EST on business days are processed the same day."
    }
];

export default function Shipping() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 pt-44 pb-20">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                                Shipping <span className="text-glacier">Information</span>
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                                Fast, reliable shipping to get your wellness products to your door.
                            </p>
                        </div>

                        {/* Shipping Options */}
                        <div className="grid md:grid-cols-3 gap-6 mb-16">
                            {shippingInfo.map((option) => (
                                <div key={option.title} className="glass rounded-xl p-6 border border-border text-center">
                                    <option.icon className="w-10 h-10 text-glacier mx-auto mb-4" />
                                    <h3 className="font-display text-xl font-bold mb-2">{option.title}</h3>
                                    <p className="text-glacier font-semibold mb-1">{option.time}</p>
                                    <p className="text-sm text-muted-foreground mb-4">{option.price}</p>
                                    <p className="text-sm text-muted-foreground">{option.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Additional Info */}
                        <div className="glass rounded-xl p-8 border border-border">
                            <h2 className="font-display text-2xl font-bold mb-6">Shipping Details</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-glacier" />
                                        Shipping Locations
                                    </h3>
                                    <p className="text-muted-foreground">
                                        We currently ship to all 50 US states. International shipping is coming soon!
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Order Tracking</h3>
                                    <p className="text-muted-foreground">
                                        Once your order ships, you'll receive an email with tracking information. You can track your package directly from the carrier's website.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Delivery Issues</h3>
                                    <p className="text-muted-foreground">
                                        If your package is lost, damaged, or hasn't arrived within the expected timeframe, please contact us at{" "}
                                        <a href="/contact" className="text-glacier hover:underline">our contact page</a> and we'll resolve the issue promptly.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Holiday Shipping</h3>
                                    <p className="text-muted-foreground">
                                        During peak holiday seasons, shipping times may be slightly longer. We recommend ordering early to ensure timely delivery.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
