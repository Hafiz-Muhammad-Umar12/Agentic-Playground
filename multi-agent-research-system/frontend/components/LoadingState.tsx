"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const steps = [
  "Initializing AI agents...",
  "Scanning global knowledge base...",
  "Synthesizing sub-topics...",
  "Drafting detailed report...",
  "Reviewing for accuracy...",
];

export const LoadingState = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative">
        <div className="h-24 w-24 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="h-12 w-12 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <motion.p 
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-medium text-white"
        >
          {steps[currentStep]}
        </motion.p>
        <p className="text-zinc-500 text-sm">This usually takes about 15-30 seconds.</p>
      </div>
    </div>
  );
};
