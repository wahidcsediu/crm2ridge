import React, { useState } from 'react';
import { generateAIAnalysis } from '../../services/aiService';
import { Button } from './Button';
import { Card } from './Card';
import { Sparkles, Bot, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsightsProps {
  title: string;
  prompt: string;
  data: any;
  buttonText?: string;
  compact?: boolean;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ 
  title, 
  prompt, 
  data, 
  buttonText = "Generate Analysis",
  compact = false
}) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateAIAnalysis(prompt, data);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-zinc-900 to-blue-950/10 overflow-hidden relative group p-4" noTilt>
      {/* Decorative AI Background */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors duration-500 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
             <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Bot size={16} />
             </div>
             <h3 className="font-bold text-white font-display tracking-wide text-sm">{title}</h3>
          </div>
          {!analysis && (
            <Button 
                variant="ghost" 
                size="sm"
                onClick={handleGenerate} 
                isLoading={loading}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 h-8 text-[10px]"
                icon={<Sparkles size={12} />}
            >
                {compact ? "Analyze" : buttonText}
            </Button>
          )}
          {analysis && (
             <button 
                onClick={handleGenerate}
                disabled={loading}
                className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                title="Regenerate"
             >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
             </button>
          )}
        </div>

        <AnimatePresence mode="wait">
            {!analysis && !loading && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-zinc-500 italic border-l-2 border-blue-900/50 pl-3 py-1"
                >
                    Use Gemini AI to generate deep insights based on internal data.
                </motion.div>
            )}

            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-4 flex flex-col items-center justify-center gap-2"
                >
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
                        <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                    </div>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">Analyzing...</p>
                </motion.div>
            )}

            {analysis && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-invert prose-sm max-w-none mt-2"
                >
                    <div className="text-zinc-300 whitespace-pre-line leading-relaxed p-3 bg-black/20 rounded-xl border border-blue-500/10 text-xs">
                        {analysis}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </Card>
  );
};