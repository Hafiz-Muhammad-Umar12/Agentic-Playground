"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "waiting" | "processing" | "completed";
}

interface PipelineVisualizerProps {
  steps: Step[];
}

export function PipelineVisualizer({ steps }: PipelineVisualizerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6">
      <div className="relative space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={cn(
              "relative flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all duration-700",
              step.status === "completed" ? "bg-card border-primary/20 shadow-glow" : 
              step.status === "processing" ? "bg-card border-primary shadow-2xl ring-1 ring-primary/30 scale-[1.02]" : 
              "bg-white/5 border-transparent opacity-30"
            )}
          >
            <div className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-700",
              step.status === "completed" ? "bg-primary border-primary shadow-glow" : 
              step.status === "processing" ? "bg-background border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
              "bg-background border-white/10"
            )}>
              {step.status === "completed" ? (
                <Check className="h-6 w-6 text-background font-black" />
              ) : step.status === "processing" ? (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              ) : (
                <step.icon className="h-6 w-6 text-white/70" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  "font-black text-xl uppercase italic tracking-tight transition-colors duration-700",
                  step.status === "waiting" ? "text-white/70" : "text-white"
                )}>
                  {step.name}
                </h3>
                {step.status === "completed" && (
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                    Validated
                  </span>
                )}
              </div>
              <p className="text-sm text-white/70 mt-1 font-medium leading-relaxed">
                {step.description}
              </p>
            </div>

            {step.status === "processing" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
