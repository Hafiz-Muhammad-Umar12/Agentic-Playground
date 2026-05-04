"use client";

import Link from "next/link";
import { Zap, Menu, ChevronRight, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 lg:px-12 py-4",
      scrolled ? "py-3" : "py-6"
    )}>
      <div className={cn(
        "container mx-auto h-16 flex items-center justify-between px-6 rounded-2xl transition-all duration-300",
        scrolled ? "glass shadow-2xl" : "bg-transparent"
      )}>
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-glow">
              <Zap className="h-5 w-5 text-background fill-background" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white uppercase italic">
              Startup<span className="text-primary">Flow</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {['Features', 'Pricing', 'API'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-xs font-bold text-white/80 hover:text-white transition-colors tracking-widest uppercase"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          {isLoading ? (
            <div className="h-10 w-24 flex items-center justify-center">
               <Loader2 className="h-4 w-4 text-white/20 animate-spin" />
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center shadow-glow">
                  <span className="text-[10px] font-black text-background uppercase">
                    {user?.email?.[0] || "U"}
                  </span>
                </div>
                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest hidden md:block">
                  {user?.email?.split('@')[0]}
                </span>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-red-500/10 rounded-lg group transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4 text-white/40 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          ) : (
            <>
              <Link 
                href="/login" 
                className="hidden sm:block text-xs font-bold text-white/80 hover:text-white transition-colors uppercase tracking-widest"
              >
                Log in
              </Link>
              <Link 
                href="/signup"
                className="emerald-gradient text-background text-[10px] font-black px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-glow uppercase tracking-widest flex items-center gap-2"
              >
                Launch <ChevronRight className="h-3 w-3" />
              </Link>
            </>
          )}
          <button className="lg:hidden p-2 text-white">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
