"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      // Auth context handles redirection internally
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-glow"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="bg-primary p-3 rounded-2xl mb-6 shadow-glow">
            < Zap className="h-6 w-6 text-background fill-background" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            Welcome <span className="text-primary not-italic">Back.</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 font-medium">Access your startup workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Email Terminal</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-white/20"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Authorization Code</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full emerald-gradient text-background font-black uppercase tracking-widest text-xs py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize Access"}
            <LogIn className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
            New to the protocol?{" "}
            <Link href="/signup" className="text-primary hover:underline ml-1">
              Join Flow
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
