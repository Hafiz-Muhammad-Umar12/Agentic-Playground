"use client";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface ErrorStateProps {
  message: string;
}

export const ErrorState = ({ message }: ErrorStateProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
      <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
        <AlertCircle size={24} />
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold text-lg">Research Failed</h3>
        <p className="text-zinc-400 mt-1">{message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
        >
          <RefreshCcw size={14} />
          Try Again
        </button>
      </div>
    </div>
  );
};
