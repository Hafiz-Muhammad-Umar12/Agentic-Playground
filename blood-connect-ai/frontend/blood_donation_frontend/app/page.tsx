"use client";
import Link from "next/link";
import { Droplets, Heart, Users, Zap, ArrowRight, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-900 overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blood-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blood-950/30 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blood-600 rounded-lg flex items-center justify-center animate-pulse-red">
            <Droplets size={16} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">BloodLink</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn-ghost text-sm py-2 px-4">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-blood-950/60 border border-blood-800/40 rounded-full px-4 py-2 mb-8 text-blood-400 text-sm animate-fade-in">
          <div className="w-2 h-2 bg-blood-500 rounded-full animate-ping" />
          Real-time donor matching across Pakistan
        </div>

        <h1 className="font-display text-6xl md:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
          Every Drop
          <span className="block text-transparent bg-clip-text bg-blood-gradient">
            Saves a Life
          </span>
        </h1>

        <p className="text-white/50 text-lg max-w-xl mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Connect blood donors and receivers in real time. Fast, reliable, and life-saving — when every second counts.
        </p>

        <div className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Link href="/auth/signup" className="btn-primary text-base px-8 py-3 blood-glow">
            Start Donating <ArrowRight size={16} />
          </Link>
          <Link href="/auth/signup" className="btn-ghost text-base px-8 py-3">
            Request Blood
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-10 mt-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {[
            { label: "Lives Saved", value: "10,000+" },
            { label: "Active Donors", value: "5,000+" },
            { label: "Cities", value: "50+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-bold text-blood-400">{stat.value}</div>
              <div className="text-white/40 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-8 pb-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Zap,
              title: "Instant Matching",
              desc: "Our smart system matches donors and receivers in seconds based on blood type and location.",
            },
            {
              icon: Users,
              title: "Verified Donors",
              desc: "All donors on the platform are registered users. Reach hundreds of compatible donors instantly.",
            },
            {
              icon: Shield,
              title: "Secure & Private",
              desc: "Your data stays safe with JWT authentication and encrypted storage. Share only what you choose.",
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className="card hover:border-blood-800/50 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-10 h-10 bg-blood-950/80 border border-blood-800/40 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blood-900/50 transition-colors">
                <f.icon size={18} className="text-blood-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-8 pb-24">
        <div className="max-w-2xl mx-auto text-center glass rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-blood-gradient opacity-5 rounded-2xl" />
          <Heart size={32} className="text-blood-500 mx-auto mb-4 animate-float" />
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            Be a Hero Today
          </h2>
          <p className="text-white/40 mb-8">
            Sign up in 2 minutes and become part of Pakistan's fastest-growing blood donor network.
          </p>
          <Link href="/auth/signup" className="btn-primary mx-auto w-fit blood-glow">
            Join BloodLink <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-6 text-center text-white/30 text-sm">
        © 2025 BloodLink. Built to save lives.
      </footer>
    </main>
  );
}
