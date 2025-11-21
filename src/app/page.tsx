import Link from 'next/link';
import { CheckCircle, Clock, Wifi, Coffee, Shield, Zap, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030014] overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 md:pt-40 md:pb-48">
        {/* Background Grid & Glow */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-grid-white opacity-20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-primary mb-8 backdrop-blur-sm hero-text">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now Open 24/7
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 glow-text hero-text">
            Transform How You <br />
            <span className="text-primary">Excellence</span> Your Studies
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed hero-text">
            Join Vats Library today. A peaceful, 24/7 study environment designed for serious students.
            High-speed WiFi, comfortable seating, and zero distractions.
          </p>


        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          Why Choose Vats Library?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BenefitCard
            icon={<Clock className="h-8 w-8 text-primary" />}
            title="24/7 Access"
            description="Study whenever inspiration strikes. Our doors are always open for members."
          />
          <BenefitCard
            icon={<Wifi className="h-8 w-8 text-primary" />}
            title="High-Speed WiFi"
            description="Seamless connectivity for your online lectures and research needs."
          />
          <BenefitCard
            icon={<Coffee className="h-8 w-8 text-primary" />}
            title="Comfortable Environment"
            description="Ergonomic chairs, perfect lighting, and air-conditioned halls."
          />
          <BenefitCard
            icon={<Shield className="h-8 w-8 text-primary" />}
            title="Secure & Safe"
            description="CCTV surveillance and secure entry for your peace of mind."
          />
          <BenefitCard
            icon={<Zap className="h-8 w-8 text-primary" />}
            title="Power Backup"
            description="Uninterrupted study sessions with our 24/7 power backup system."
          />
          <BenefitCard
            icon={<CheckCircle className="h-8 w-8 text-primary" />}
            title="Dedicated Desk"
            description="Choose your spot and make it your own productive corner."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative">
        <div className="absolute inset-0 bg-primary/5 skew-y-3 transform origin-top-left" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Simple Pricing
          </h2>
          <p className="text-gray-400 mb-12">No hidden charges. Just one plan for everything.</p>

          <div className="max-w-md mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 glow-container relative overflow-hidden group hover:border-primary/50 transition-colors duration-500">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>

            {/* Glow effect inside card */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <h3 className="text-2xl font-bold mb-2 text-white">Monthly Pass</h3>
            <div className="text-5xl font-bold text-white mb-6 tracking-tight">
              ₹100 <span className="text-lg font-normal text-gray-400">/ month</span>
            </div>

            <ul className="space-y-4 text-left mb-8 relative z-10">
              <li className="flex items-center gap-3 text-gray-300">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span>Full 24/7 Access</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span>Unlimited WiFi</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span>Reserved Seat</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span>Locker Facility</span>
              </li>
            </ul>

            <Link
              href="/dashboard"
              className="btn-3d bg-white text-black h-12 w-full rounded-xl flex items-center justify-center font-bold transition-all relative z-10 hover:bg-gray-100"
              style={{ boxShadow: '0px 10px 0px 0px #9ca3af, 0px 10px 20px rgba(0,0,0,0.4)' }}
            >
              Join Now
            </Link>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section id="rules" className="container mx-auto px-4 max-w-3xl py-20">
        <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          Library Rules
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 backdrop-blur-sm">
          <RuleItem number={1} text="Maintain complete silence inside the study hall." />
          <RuleItem number={2} text="Mobile phones must be kept on silent mode." />
          <RuleItem number={3} text="Keep your desk clean and tidy after use." />
          <RuleItem number={4} text="Food is not allowed inside the study area (water is allowed)." />
          <RuleItem number={5} text="Respect other members' personal space and belongings." />
          <RuleItem number={6} text="Turn off lights and fans when leaving if you are the last one." />
        </div>
      </section>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
      <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function RuleItem({ number, text }: { number: number, text: string }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="flex-shrink-0 bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-primary/20">
        {number}
      </span>
      <p className="pt-1 text-gray-300">{text}</p>
    </div>
  );
}
