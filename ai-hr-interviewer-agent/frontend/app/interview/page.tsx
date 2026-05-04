'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronLeft, RotateCcw, MessageSquare } from 'lucide-react';
import { useInterviewStore } from '../../store/interviewStore';
import { useInterviewFlow } from '../../lib/interviewFlow';
import { InterviewChat } from '../../components/InterviewChat';
import { AnswerInput } from '../../components/AnswerInput';
import { ScoreCard } from '../../components/ScoreCard';

export default function InterviewPage() {
  const router = useRouter();
  const { 
    messages, 
    currentQuestion, 
    isLoading, 
    isEnded, 
    scoreData, 
    topic,
    sessionId,
    resetInterview 
  } = useInterviewStore();
  
  const { initiateInterview, handleAnswerSubmit } = useInterviewFlow();

  useEffect(() => {
    // If no topic and no active session, go back
    if (!topic && !sessionId) {
      router.push('/');
      return;
    }

    // Start interview if we have a topic but no session yet
    if (topic && !sessionId && !isLoading) {
      initiateInterview(topic);
    }
  }, [topic, sessionId, initiateInterview, isLoading, router]);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the interview? All progress will be lost.')) {
      resetInterview();
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background selection:bg-primary/30">
      {/* Header */}
      <header className="h-16 border-b border-border/50 glass px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none">AI Interview Session</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{topic}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-xs font-medium transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!isEnded ? (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Messages Area */}
              <InterviewChat messages={messages} />

              {/* Bottom Input Area */}
              <div className="p-6 border-t border-border/30 glass-card mx-4 mb-4 rounded-3xl">
                <div className="space-y-4">
                  <AnswerInput 
                    onSubmit={handleAnswerSubmit} 
                    isLoading={isLoading} 
                  />
                  <p className="text-[10px] text-center text-muted-foreground/60">
                    Pro-tip: You can use Shift + Enter for new lines. Press Enter to submit.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="score"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 overflow-y-auto px-6 custom-scrollbar"
            >
              {scoreData && <ScoreCard data={scoreData} />}
              <div className="flex justify-center pb-12">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Start New Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-screen -z-10 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
