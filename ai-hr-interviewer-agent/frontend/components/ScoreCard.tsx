'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Award, Zap, BarChart3, ChevronRight } from 'lucide-react';
import { ScoreData } from '../store/interviewStore';

interface ScoreCardProps {
  data: ScoreData;
}

export const ScoreCard = ({ data }: ScoreCardProps) => {
  const metrics = [
    { label: 'Correctness', value: data.score.correctness, icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Clarity', value: data.score.clarity, icon: Zap, color: 'text-blue-400' },
    { label: 'Depth', value: data.score.depth, icon: BarChart3, color: 'text-purple-400' },
    { label: 'Technical Accuracy', value: data.score.technical_accuracy, icon: Award, color: 'text-yellow-400' },
  ];

  const feedbackSections = [
    { label: 'Strengths', items: data.feedback.strengths, color: 'text-green-400' },
    { label: 'Weaknesses', items: data.feedback.weaknesses, color: 'text-red-400' },
    { label: 'Improvements', items: data.feedback.improvements, color: 'text-blue-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full space-y-8 py-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
          Interview Complete
        </h2>
        <p className="text-muted-foreground">Here is your performance breakdown. Total Score: {data.score.total}/40</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 glass-card rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-secondary/50 ${metric.color}`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <span className="font-medium text-foreground">{metric.label}</span>
            </div>
            <div className="text-2xl font-bold">{metric.value}/10</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        {feedbackSections.map((section, sIndex) => (
          <motion.div
            key={section.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + sIndex * 0.1 }}
            className="p-8 glass-card rounded-3xl space-y-6"
          >
            <h3 className={`text-xl font-semibold flex items-center gap-2 ${section.color}`}>
              <Award className="w-5 h-5" />
              {section.label}
            </h3>
            <div className="space-y-4">
              {section.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex gap-3 group"
                >
                  <ChevronRight className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
