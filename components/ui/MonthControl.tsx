import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, History, Radio } from 'lucide-react';
import { useDateFilter } from '../../context/DateFilterContext';
import { motion } from 'framer-motion';

export const MonthControl: React.FC = () => {
  const { activeMonthName, isCurrentMonth, goToPreviousMonth, goToNextMonth, resetToCurrent } = useDateFilter();

  return (
    <div className="flex items-center gap-3">
        {!isCurrentMonth && (
            <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={resetToCurrent}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-bold uppercase tracking-wider"
            >
                <Radio size={14} className="animate-pulse" /> Back to Live
            </motion.button>
        )}

        <div className="relative group perspective-1000">
            {/* 3D Glow */}
            <div className={`absolute inset-2 blur-xl rounded-full opacity-40 transition-colors duration-500 ${isCurrentMonth ? 'bg-red-500/30' : 'bg-blue-500/30'}`} />

            <div className={`relative flex items-center gap-1 bg-zinc-900 border rounded-2xl p-1 shadow-xl transition-colors ${isCurrentMonth ? 'border-red-500/30' : 'border-blue-500/30'}`}>
                
                <button 
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors"
                    title="Previous Month"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="px-4 py-1 flex flex-col items-center min-w-[160px]">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5 flex items-center gap-1.5 ${isCurrentMonth ? 'text-red-500' : 'text-blue-400'}`}>
                        {isCurrentMonth ? <Radio size={10} className="animate-pulse" /> : <History size={10} />}
                        {isCurrentMonth ? 'Live Data' : 'Archived'}
                    </span>
                    <span className="text-white font-bold font-display text-lg whitespace-nowrap">
                        {activeMonthName}
                    </span>
                </div>

                <button 
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors"
                    title="Next Month"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};