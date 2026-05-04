"use client";
import React, { useState } from "react";
import { Search, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputBoxProps {
  onSearch: (topic: string) => void;
  isLoading: boolean;
}

export const InputBox = ({ onSearch, isLoading }: InputBoxProps) => {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSearch(topic);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="relative w-full max-w-3xl mx-auto group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
      <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="pl-5 text-zinc-500">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What would you like to research today?"
          className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-zinc-500 py-5 px-4 text-lg outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className={cn(
            "mr-3 p-3 rounded-xl transition-all flex items-center gap-2",
            topic.trim() && !isLoading 
              ? "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline text-sm font-medium">Generate</span>
              <Send size={18} />
            </>
          )}
        </button>
      </div>
      <div className="mt-3 flex gap-2 justify-center text-xs text-zinc-500 italic">
        <Sparkles size={12} className="text-blue-400" />
        <span>Try: "Future of Neural Networks in Medicine"</span>
      </div>
    </form>
  );
};
