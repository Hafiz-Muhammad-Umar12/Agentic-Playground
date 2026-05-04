"use client";

import { useState, useEffect, useRef } from "react";
import { HeroInput } from "@/components/HeroInput";
import { PipelineVisualizer } from "@/components/PipelineVisualizer";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Database, TrendingUp, ShieldCheck, Download, RefreshCw, ChevronRight, ArrowRight, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

type AppMode = "landing" | "builder";
type PipelineStatus = "idle" | "running" | "completed" | "error";

export default function Home() {
  const [mode, setMode] = useState<AppMode>("landing");
  const [status, setStatus] = useState<PipelineStatus>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const steps = [
    { id: "context", name: "RAG Context", description: "Mapping market vector space and project history.", icon: Database, status: currentStep > 0 ? "completed" : currentStep === 0 && status === "running" ? "processing" : "waiting" },
    { id: "idea", name: "Neural Idea", description: "Synthesizing core value props and feature architectures.", icon: Sparkles, status: currentStep > 1 ? "completed" : currentStep === 1 && status === "running" ? "processing" : "waiting" },
    { id: "market", name: "Market Ops", description: "Aggregating real-time competitor and trend intelligence.", icon: TrendingUp, status: currentStep > 2 ? "completed" : currentStep === 2 && status === "running" ? "processing" : "waiting" },
    { id: "validation", name: "Validation", description: "Hardening technical blueprints and business logic.", icon: ShieldCheck, status: currentStep > 3 ? "completed" : currentStep === 3 && status === "running" ? "processing" : "waiting" },
  ] as const;

  const handleLaunch = async (idea: string) => {
    setMode("builder");
    setStatus("running");
    setCurrentStep(0);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const { task_id } = await api.generateProject(idea);
      setTaskId(task_id);
    } catch (err: any) {
      setError(err.message || "Failed to start generation");
      setStatus("error");
    }
  };

  // Polling logic
  useEffect(() => {
    if (status === "running" && taskId) {
      pollInterval.current = setInterval(async () => {
        try {
          const task = await api.getTaskStatus(taskId);
          
          if (task.status === "SUCCESS") {
            setStatus("completed");
            setCurrentStep(4);
            if (pollInterval.current) clearInterval(pollInterval.current);
          } else if (task.status === "FAILURE") {
            setError(task.error || "Generation failed");
            setStatus("error");
            if (pollInterval.current) clearInterval(pollInterval.current);
          } else {
            // Logic to move visual steps based on time or mock increments
            // Since Celery doesn't easily report "internal" agent steps without more plumbing,
            // we'll still use a timer to advance the UI steps to keep it looking "alive"
            // while the background task runs.
            setCurrentStep(prev => prev < 3 ? prev + 1 : prev);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [status, taskId]);

  const handleDownload = async () => {
    try {
      // In a real app, we'd get the project_id from the task result
      const projects = await api.listProjects();
      if (projects.length > 0) {
        await api.downloadProject(projects[0].id);
      }
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {mode === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col items-center"
          >
            {/* HERO */}
            <div className="w-full pt-32 pb-40 flex flex-col items-center text-center px-6 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary/5 blur-[160px] rounded-full -z-10" />
              <div className="noise-bg absolute inset-0 -z-10" />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-16 border border-white/10 shadow-glow backdrop-blur-2xl"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Autonomous Protocol v4.0
              </motion.div>
              
              <h1 className="text-8xl md:text-[11rem] font-black tracking-[-0.06em] mb-12 max-w-7xl leading-[0.75] text-white uppercase italic">
                Scale <br />
                <span className="text-primary not-italic tracking-[-0.1em]">Instinct.</span>
              </h1>
              
              <p className="text-2xl md:text-3xl text-white/70 max-w-3xl mb-20 leading-tight font-bold tracking-tight">
                The high-performance orchestration engine for <br className="hidden md:block" />
                autonomous startup validation and technical blueprinting.
              </p>

              <div id="builder-trigger" className="flex flex-col sm:flex-row gap-8 w-full max-w-2xl mb-40">
                <button 
                  onClick={() => setMode("builder")}
                  className="flex-1 emerald-gradient text-background font-black uppercase tracking-[0.2em] text-xs px-12 py-6 rounded-[2rem] hover:scale-105 transition-all flex items-center justify-center gap-4 shadow-glow"
                >
                  Enter Terminal <ArrowRight className="h-5 w-5" />
                </button>
                <button className="flex-1 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs px-12 py-6 rounded-[2rem] hover:bg-white/10 transition-all backdrop-blur-3xl">
                  Documentation
                </button>
              </div>

              {/* LOGOS */}
              <div className="w-full max-w-6xl">
                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.6em] mb-16">Propelling Enterprise Innovation</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 grayscale invert opacity-30 hover:opacity-100 transition-all duration-700 cursor-default">
                  {['Y-COMBINATOR', 'SEQUOIA', 'ANDREESSEN', 'INDEX'].map((brand) => (
                    <div key={brand} className="text-3xl font-black tracking-[-0.1em]">{brand}</div>
                  ))}
                </div>
              </div>
            </div>

            <Features />
            <Pricing />
          </motion.div>
        ) : (
          <motion.div
            key="builder"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center py-32 px-6 min-h-screen relative"
          >
            <div className="absolute inset-0 noise-bg -z-10" />
            
            <AnimatePresence mode="wait">
              {status === "idle" ? (
                <div className="w-full flex justify-center py-12">
                  <HeroInput onSubmit={handleLaunch} />
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-8 border border-primary/20">
                      {status === "running" ? "Orchestrator Executing" : status === "error" ? "System Failure" : "Terminal Phase Ready"}
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 uppercase italic">
                      {status === "running" ? "Processing" : status === "error" ? "Abort" : "Resolved"}
                    </h2>
                    {error && (
                      <div className="flex items-center gap-2 text-red-400 font-bold bg-red-400/10 px-4 py-2 rounded-xl border border-red-400/20">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}
                  </div>
                  
                  <PipelineVisualizer steps={[...steps]} />

                  {status === "completed" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-20 flex flex-col sm:flex-row gap-8 w-full max-w-lg"
                    >
                      <button 
                        onClick={() => { setStatus("idle"); setCurrentStep(0); setTaskId(null); }}
                        className="flex-1 flex items-center justify-center gap-4 px-10 py-6 rounded-[2rem] border border-white/10 bg-white/5 font-black uppercase tracking-widest text-xs text-white hover:bg-white/10 transition-all shadow-2xl backdrop-blur-3xl"
                      >
                        <RefreshCw className="h-5 w-5" />
                        Reset Ops
                      </button>
                      <button 
                        onClick={handleDownload}
                        className="flex-1 flex items-center justify-center gap-4 px-10 py-6 rounded-[2rem] emerald-gradient text-background font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-glow"
                      >
                        <Download className="h-5 w-5" />
                        Export ZIP
                      </button>
                    </motion.div>
                  )}

                  {status === "error" && (
                    <button 
                      onClick={() => { setStatus("idle"); setCurrentStep(0); setTaskId(null); }}
                      className="mt-12 px-8 py-4 rounded-xl border border-white/10 text-white font-bold"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </AnimatePresence>
            
            <button 
              onClick={() => { setMode("landing"); setStatus("idle"); setTaskId(null); }}
              className="mt-32 text-[11px] font-black text-white/40 hover:text-primary uppercase tracking-[0.5em] transition-all flex items-center gap-4 group"
            >
              <span className="group-hover:-translate-x-3 transition-transform text-lg">←</span> Home Protocol
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
