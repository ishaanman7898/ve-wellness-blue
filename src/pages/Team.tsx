import { useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChevronDown } from "lucide-react";

const allTeamImages = [
  "/team/AliceHo.png", "/team/LilyElsea.png", "/team/HitaKhandelwal.png",
  "/team/MacyEvans.png", "/team/MaryHoward.png", "/team/VinanyaPenumadula.png",
  "/team/AnshJain.png", "/team/SiyanshVirmani.png", "/team/AlexWohlfahrt.png",
  "/team/RonikaGajulapalli.png", "/team/GraceHelbing.png", "/team/EshanKhan.png",
  "/team/DumitruBusuioc.png", "/team/IshaanManoor.png", "/team/ReeceClavey.png",
  "/team/EshanviSharma.png", "/team/CarterShaw.png", "/team/EthanHsu.png",
  "/team/MunisKodirova.png", "/team/RyanLucas.png"
];

const teamData = {
  leadership: [
    { name: "Alice Ho", role: "CEO", img: "/team/AliceHo.png", bio: "Leading Thrive's vision with passion for wellness." },
    { name: "Lily Elsea", role: "CFO", img: "/team/LilyElsea.png", bio: "Overseeing financial strategy and growth." },
    { name: "Hita Khandelwal", role: "CDO", img: "/team/HitaKhandelwal.png", bio: "Shaping visual identity and UX." },
    { name: "Macy Evans", role: "CAO", img: "/team/MacyEvans.png", bio: "Ensuring operational excellence." },
    { name: "Mary Howard", role: "CMO", img: "/team/MaryHoward.png", bio: "Driving brand awareness." },
    { name: "Vinanya Penumadula", role: "CSO", img: "/team/VinanyaPenumadula.png", bio: "Leading sales initiatives." },
  ],
  departments: [
    {
      name: "Accounting",
      members: [
        { name: "Ansh Jain", role: "Financial Analyst", img: "/team/AnshJain.png" },
        { name: "Siyansh Virmani", role: "Accountant", img: "/team/SiyanshVirmani.png" },
        { name: "Alex Wohlfahrt", role: "Financial Associate", img: "/team/AlexWohlfahrt.png" },
      ]
    },
    {
      name: "Creative",
      members: [
        { name: "Ronika Gajulapalli", role: "Graphic Designer", img: "/team/RonikaGajulapalli.png" },
        { name: "Grace Helbing", role: "UX/UI Designer", img: "/team/GraceHelbing.png" },
        { name: "Eshan Khan", role: "Creative Director", img: "/team/EshanKhan.png" },
      ]
    },
    {
      name: "Sales",
      members: [
        { name: "Dumitru Busuioc", role: "Sales Rep", img: "/team/DumitruBusuioc.png" },
        { name: "Ishaan Manoor", role: "Sales Person", img: "/team/IshaanManoor.png" },
      ]
    },
    {
      name: "Marketing",
      members: [
        { name: "Reece Clavey", role: "Marketing Specialist", img: "/team/ReeceClavey.png" },
        { name: "Eshanvi Sharma", role: "Digital Marketer", img: "/team/EshanviSharma.png" },
        { name: "Carter Shaw", role: "Content Strategist", img: "/team/CarterShaw.png" },
      ]
    },
    {
      name: "HR",
      members: [
        { name: "Ethan Hsu", role: "HR Specialist", img: "/team/EthanHsu.png" },
        { name: "Munis Kodirova", role: "Talent Acquisition", img: "/team/MunisKodirova.png" },
        { name: "Ryan Lucas", role: "HR Coordinator", img: "/team/RyanLucas.png" },
      ]
    },
  ]
};

export default function Team() {
  const heroRef = useRef<HTMLElement>(null);
  const trailImagesRef = useRef<HTMLDivElement>(null);

  // Mouse trail effect for hero section - images fall off page
  useEffect(() => {
    const hero = heroRef.current;
    const trailContainer = trailImagesRef.current;
    if (!hero || !trailContainer) return;

    let imageIndex = 0;
    let lastX = 0;
    let lastY = 0;
    const gap = 250; // More spaced out

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const isInHero = e.clientY >= rect.top && e.clientY <= rect.bottom;
      
      if (!isInHero) return;

      const distance = Math.sqrt(
        Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2)
      );

      if (distance > gap) {
        lastX = e.clientX;
        lastY = e.clientY;

        const img = document.createElement('img');
        img.src = allTeamImages[imageIndex % allTeamImages.length];
        img.className = 'trail-image';
        const randomRotation = Math.random() * 30 - 15;
        const fallDistance = window.innerHeight + 200;
        
        img.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: 140px;
          height: 140px;
          object-fit: cover;
          object-position: center 30%;
          pointer-events: none;
          z-index: 50;
          transform: translate(-50%, -50%) scale(0) rotate(0deg);
          opacity: 0;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.6);
        `;

        trailContainer.appendChild(img);
        imageIndex++;

        // Appear animation
        requestAnimationFrame(() => {
          img.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out';
          img.style.transform = `translate(-50%, -50%) scale(1) rotate(${randomRotation}deg)`;
          img.style.opacity = '0.95';
        });

        // Fall off page animation - starts immediately after appearing
        setTimeout(() => {
          img.style.transition = 'transform 2s cubic-bezier(0.4, 0, 0.6, 1), opacity 1.5s ease-in';
          img.style.transform = `translate(-50%, ${fallDistance}px) scale(0.7) rotate(${randomRotation + (Math.random() * 60 - 30)}deg)`;
          img.style.opacity = '0';
          setTimeout(() => img.remove(), 2000);
        }, 100);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <Navbar />
      <div ref={trailImagesRef} className="pointer-events-none" />

      {/* Hero with mouse trail */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-glacier/20 via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-glacier/10 via-transparent to-transparent" />
        
        <div className="relative z-10 text-center px-4">
          <p className="text-glacier text-sm tracking-[0.4em] uppercase mb-6 font-medium">The People Behind</p>
          <h1 className="text-7xl md:text-9xl font-black tracking-[0.08em] mb-8 animate-fade-in">
            THRIVE
          </h1>
          <p className="text-xl text-white/60 max-w-md mx-auto font-light">
            A passionate team dedicated to revolutionizing wellness
          </p>
        </div>

        <button
          onClick={() => document.getElementById('leadership')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20"
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </button>
      </section>

      {/* Leadership */}
      <section id="leadership" className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-wide">Leadership</h2>
            <div className="w-20 h-1 bg-glacier mx-auto" />
          </div>

          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
              {teamData.leadership.map((person, i) => (
                <div 
                  key={person.name} 
                  className="group w-full max-w-[260px] animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/5 hover:border-glacier/30 transition-all duration-300 hover:-translate-y-3 hover:rotate-2">
                    <div className="aspect-square overflow-hidden bg-gray-900">
                      <img
                        src={person.img}
                        alt={person.name}
                        className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                      <h4 className="font-bold text-lg">{person.name}</h4>
                      <p className="text-glacier/80 text-sm">{person.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto">
          {teamData.departments.map((dept, deptIdx) => (
            <div key={dept.name} className="mb-32 last:mb-0">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-6xl font-black text-white/10">{String(deptIdx + 1).padStart(2, '0')}</span>
                  <h3 className="text-3xl md:text-4xl font-bold tracking-wide">{dept.name}</h3>
                </div>
                <p className="text-white/40 text-sm">{dept.members.length} members</p>
              </div>

              <div className="flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
                  {dept.members.map((member, idx) => (
                    <div 
                      key={member.name} 
                      className="group w-full max-w-[260px]"
                    >
                      <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/5 hover:border-glacier/30 transition-all duration-300 hover:-translate-y-3 hover:rotate-2">
                        <div className="aspect-square overflow-hidden bg-gray-900">
                          <img
                            src={member.img}
                            alt={member.name}
                            className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                          <h4 className="font-bold text-lg">{member.name}</h4>
                          <p className="text-glacier/80 text-sm">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
