'use client';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface QuestionCardProps {
  question: string;
}

export const QuestionCard = ({ question }: QuestionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-6 glass-card rounded-2xl mb-6"
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Bot className="w-6 h-6 text-primary" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">AI Interviewer</p>
        <h2 className="text-xl font-semibold leading-relaxed text-foreground">
          {question}
        </h2>
      </div>
    </motion.div>
  );
};
