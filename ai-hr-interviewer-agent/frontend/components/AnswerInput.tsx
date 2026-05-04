'use client';

import { useState, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

export const AnswerInput = ({ onSubmit, isLoading }: AnswerInputProps) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim() && !isLoading) {
      onSubmit(answer);
      setAnswer('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative group">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your answer here..."
        rows={3}
        className="w-full p-4 pr-14 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground"
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        disabled={!answer.trim() || isLoading}
        className="absolute right-3 bottom-3 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
      
      {isLoading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-6 left-0 text-xs text-muted-foreground flex items-center gap-1.0"
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          AI is thinking...
        </motion.p>
      )}
    </div>
  );
};
