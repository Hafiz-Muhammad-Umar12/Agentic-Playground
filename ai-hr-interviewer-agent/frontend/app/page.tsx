'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Sparkles, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useInterviewStore } from '../store/interviewStore';

export default function LandingPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const resetInterview = useInterviewStore((state) => state.resetInterview);
  const setTopicInStore = useInterviewStore((state) => state.setTopic);

  const handleStart = () => {
    if (topic.trim()) {
      resetInterview();
      setTopicInStore(topic);
      router.push('/interview');
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">AI Interviewer</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Features</a>
            <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border text-xs font-medium text-primary mb-4"
          >
            <Sparkles className="w-3 h-3" />
            <span>Next Generation HR Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]"
          >
            Master Your Next <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-muted-foreground bg-clip-text text-transparent">
              Technical Interview
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed"
          >
            Experience realistic, AI-powered HR interviews tailored to your target role. 
            Get instant feedback, score breakdowns, and professional recommendations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto p-2 bg-secondary/30 border border-border rounded-2xl flex flex-col md:flex-row gap-2"
          >
            <input
              type="text"
              placeholder="Enter job role or topic (e.g. Frontend Engineer)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              className="flex-1 px-4 py-3 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={handleStart}
              disabled={!topic.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              Start Interview
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Feature Grid */}
          <div className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Real-time AI", desc: "Dynamic follow-up questions based on your unique responses." },
              { icon: ShieldCheck, title: "HR Compliant", desc: "Evaluations designed by senior recruiters and industry experts." },
              { icon: Globe, title: "Any Domain", desc: "Support for software engineering, product, marketing, and more." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-6 rounded-3xl border border-border/50 bg-secondary/10 text-left space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-screen -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
