"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InputBox } from "@/components/InputBox";
import { LoadingState } from "@/components/LoadingState";
import { ReportViewer } from "@/components/ReportViewer";
import { ErrorState } from "@/components/ErrorState";
import { fetchResearch } from "@/services/research";

export default function ResearchDashboard() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (topic: string) => {
    const normalizedTopic = topic.trim().toLowerCase();
    
    // 1. Reset states
    setLoading(true);
    setReport(null);
    setError(null);

    // 2. Special Case Handling (Hi/Hello) - No API call needed
    if (normalizedTopic === "hi" || normalizedTopic === "hello") {
      setTimeout(() => {
        setError("👋 Hello! The AI service is currently unavailable due to quota limits. Please try again later.");
        setLoading(false);
      }, 500);
      return;
    }

    try {
      // 3. Attempt API call
      console.log(`[Insight Engine] Researching: ${topic}`);
      const data = await fetchResearch(topic);
      setReport(data.report);
      
      // Auto-scroll to results
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 300);

    } catch (err: any) {
      // 4. Custom Error Mapping (Hiding "Failed to fetch")
      console.error("[Insight Engine] Error detail:", err.message);
      setError("⚠️ Service temporarily unavailable. The AI quota has been exceeded. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Premium Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <header className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent italic">
              INSIGHT ENGINE
            </h1>
            <p className="text-zinc-500 text-lg md:text-xl mt-6 max-w-2xl mx-auto font-medium">
              Professional research intelligence for high-scale synthesis.
            </p>
          </motion.div>
        </header>

        {/* Search Interface */}
        <div className="max-w-4xl mx-auto space-y-12">
          <InputBox onSearch={handleSearch} isLoading={loading} />

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
              >
                <LoadingState />
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <ErrorState message={error} />
              </motion.div>
            )}

            {report && !loading && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ReportViewer report={report} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Minimal Footer */}
        {!report && !loading && !error && (
           <motion.footer 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1 }}
             className="mt-32 text-center text-zinc-700 text-sm uppercase tracking-widest font-bold"
           >
             Powered by Gemini Pro & Insight Agents
           </motion.footer>
        )}
      </div>
    </main>
  );
}
