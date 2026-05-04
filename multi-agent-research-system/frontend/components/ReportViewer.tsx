"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Download, Share2, FileText } from "lucide-react";

interface ReportViewerProps {
  report: string;
}

export const ReportViewer = ({ report }: ReportViewerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mt-12 mb-20"
    >
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
        {/* Header/Toolbar */}
        <div className="border-b border-zinc-800 bg-zinc-900/80 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-400">
            <FileText size={18} />
            <span className="text-sm font-semibold tracking-wide uppercase">Research Analysis</span>
          </div>
          <div className="flex gap-4">
             <button className="text-zinc-400 hover:text-white transition-colors">
               <Download size={18} />
             </button>
             <button className="text-zinc-400 hover:text-white transition-colors">
               <Share2 size={18} />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-10 prose prose-invert prose-blue max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};
