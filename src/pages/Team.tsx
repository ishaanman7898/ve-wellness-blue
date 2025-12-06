import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const teamMembers = [
    {
        name: "Team Member 1",
        role: "CEO & Founder",
        image: "/placeholder.svg",
        bio: "Passionate about wellness and sustainability, leading Thrive's vision."
    },
    {
        name: "Team Member 2",
        role: "CFO",
        image: "/placeholder.svg",
        bio: "Managing finances and ensuring Thrive's growth and stability."
    },
    {
        name: "Team Member 3",
        role: "CMO",
        image: "/placeholder.svg",
        bio: "Crafting the Thrive brand story and connecting with our community."
    },
    {
        name: "Team Member 4",
        role: "COO",
        image: "/placeholder.svg",
        bio: "Overseeing operations to deliver the best products to you."
    },
    {
        name: "Team Member 5",
        role: "Head of Product",
        image: "/placeholder.svg",
        bio: "Designing innovative products that make wellness simple."
    },
    {
        name: "Team Member 6",
        role: "Head of Sales",
        image: "/placeholder.svg",
        bio: "Building relationships and growing the Thrive family."
    },
];

export default function Team() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 pt-44 pb-20">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                                Meet the <span className="text-glacier">Team</span>
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                The passionate individuals behind Thrive, working together to make wellness simple and sustainable.
                            </p>
                        </div>

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
