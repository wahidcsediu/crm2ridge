import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, ChevronDown } from 'lucide-react';
import { Calendar3D } from './Calendar3D';
import { motion, AnimatePresence } from 'framer-motion';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRangeChange = (start: string, end: string) => {
      onStartDateChange(start);
      onEndDateChange(end);
      // Keep open or close based on preference, closing for cleaner UX after selection
      if (start && end) setIsOpen(false);
  };

  const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  return (
    <div className={`relative z-50 ${className}`} ref={containerRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border shadow-lg transition-all duration-300 group ${
            isOpen 
            ? 'bg-zinc-800 border-red-500/50 shadow-red-900/20' 
            : 'bg-zinc-900/80 border-zinc-700 hover:border-zinc-500'
        }`}
      >
        <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400 group-hover:text-white'}`}>
            <Calendar size={16} />
        </div>
        
        <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Date Range</span>
            <span className={`text-xs font-bold font-display ${startDate ? 'text-white' : 'text-zinc-500'}`}>
                {startDate ? `${formatDate(startDate)} - ${endDate ? formatDate(endDate) : '...'}` : 'Select Dates'}
            </span>
        </div>

        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        
        {(startDate || endDate) && (
            <div 
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="ml-2 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-full text-zinc-600 transition-colors"
            >
                <X size={14} />
            </div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
            <Calendar3D 
                startDate={startDate} 
                endDate={endDate} 
                onChange={handleRangeChange}
                onClose={() => setIsOpen(false)}
            />
        )}
      </AnimatePresence>
    </div>
  );
};