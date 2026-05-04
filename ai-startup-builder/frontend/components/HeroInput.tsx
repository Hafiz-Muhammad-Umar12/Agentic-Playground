"use client";

import { useState } from "react";
import { Send, Sparkles, Command, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroInputProps {
  onSubmit: (idea: string) => void;
  isLoading?: boolean;
}

export function HeroInput({ onSubmit, isLoading }: HeroInputProps) {
  const [idea, setIdea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isLoading) return;
    onSubmit(idea);
  };

  return (
    <div className="w-full max-w-4xl px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-primary/20 backdrop-blur-xl">
          <Sparkles className="h-3.5 w-3.5 fill-primary" />
          Quantum Engine Active
        </div>

        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-10 text-white leading-[0.85] uppercase italic">
          Forge <br />
          <span className="text-primary tracking-[-0.08em] not-italic">Reality.</span>
        </h1>

        <p className="text-white/80 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed font-medium">
          The autonomous orchestration layer for next-generation founders. 
          Validated by agents, powered by precision.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto group">
        <div
          className={cn(
            "relative flex items-center rounded-3xl border border-white/5 bg-card/80 backdrop-blur-3xl p-4 shadow-2xl transition-all duration-500",
            "focus-within:border-primary/40 focus-within:ring-8 focus-within:ring-primary/5",
            isLoading && "opacity-60 pointer-events-none"
          )}
        >
          <div className="absolute left-8 text-white/40 group-focus-within:text-primary transition-colors">
            <Command className="h-6 w-6" />
          </div>

          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Initialize your startup sequence..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white text-xl px-12 py-5 resize-none min-h-[100px] max-h-[250px] placeholder:text-white/20 font-bold"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          <button
            type="submit"
            disabled={!idea.trim() || isLoading}
            className={cn(
              "flex items-center gap-3 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
              "emerald-gradient text-background shadow-glow",
              "hover:scale-105 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? "Analyzing" : "Analyze"}
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-10 text-[9px] font-black text-white/60 uppercase tracking-[0.4em]">
          {['Context RAG', 'Multi-Agent', 'Architecting'].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/40 shadow-glow" />
              {item}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
