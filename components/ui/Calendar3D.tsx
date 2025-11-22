import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Card } from './Card';

interface Calendar3DProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  onClose: () => void;
}

export const Calendar3D: React.FC<Calendar3DProps> = ({ startDate, endDate, onChange, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);

  useEffect(() => {
      if (startDate) {
          setCurrentDate(new Date(startDate));
          setTempStart(startDate);
      }
      if (endDate) {
          setTempEnd(endDate);
      }
  }, [startDate, endDate]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      if (selectingStart) {
          setTempStart(dateString);
          setTempEnd(''); // Reset end date when picking new start
          setSelectingStart(false);
      } else {
          // If clicked before start date, swap or reset
          if (new Date(dateString) < new Date(tempStart)) {
              setTempStart(dateString);
              setTempEnd('');
              setSelectingStart(false);
          } else {
              setTempEnd(dateString);
              onChange(tempStart, dateString);
              // Optional: Close on complete selection or keep open
              setSelectingStart(true); 
          }
      }
  };

  const isSelected = (day: number) => {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return dateString === tempStart || dateString === tempEnd;
  };

  const isInRange = (day: number) => {
      if (!tempStart || !tempEnd) return false;
      const date = new Date(year, month, day);
      const start = new Date(tempStart);
      const end = new Date(tempEnd);
      return date > start && date < end;
  };

  const renderDays = () => {
      const totalDays = daysInMonth(year, month);
      const startOffset = firstDayOfMonth(year, month);
      const dayElements = [];

      // Empty cells for offset
      for (let i = 0; i < startOffset; i++) {
          dayElements.push(<div key={`empty-${i}`} className="w-full aspect-square" />);
      }

      // Days
      for (let d = 1; d <= totalDays; d++) {
          const selected = isSelected(d);
          const inRange = isInRange(d);
          const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
          
          dayElements.push(
              <motion.button
                  key={d}
                  whileHover={{ scale: 1.1, z: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDateClick(d)}
                  className={`relative w-full aspect-square flex items-center justify-center text-xs font-bold rounded-lg transition-all perspective-500 group ${
                      selected 
                        ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] z-20' 
                        : inRange 
                            ? 'bg-red-900/20 text-red-200 z-10'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  } ${isToday && !selected ? 'border border-red-500/50' : ''}`}
              >
                  {/* 3D Depth Layer */}
                  {selected && (
                      <div className="absolute inset-0 bg-red-700 rounded-lg translate-z-[-5px] opacity-50" />
                  )}
                  <span className="relative z-10">{d}</span>
              </motion.button>
          );
      }
      return dayElements;
  };

  return (
      <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
          className="absolute top-full right-0 mt-4 z-[100]"
      >
          <div className="relative">
              {/* 3D Shadow/Glow */}
              <div className="absolute -inset-4 bg-red-900/20 blur-2xl rounded-3xl" />
              
              <Card className="w-80 bg-[#09090b] border border-zinc-800 shadow-2xl p-0 overflow-hidden" noTilt contentClassName="p-0">
                  {/* Header */}
                  <div className="p-4 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-white/5 flex justify-between items-center">
                      <button onClick={handlePrevMonth} className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                          <ChevronLeft size={18} />
                      </button>
                      <div className="text-sm font-bold text-white font-display tracking-wide">
                          {monthNames[month]} {year}
                      </div>
                      <button onClick={handleNextMonth} className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                          <ChevronRight size={18} />
                      </button>
                  </div>

                  {/* Grid */}
                  <div className="p-4">
                      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                          {days.map(day => (
                              <div key={day} className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{day}</div>
                          ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                          {renderDays()}
                      </div>
                  </div>

                  {/* Footer Info */}
                  <div className="p-3 bg-zinc-950 border-t border-white/5 flex justify-between items-center">
                      <div className="text-[10px] text-zinc-500">
                          {tempStart ? new Date(tempStart).toLocaleDateString() : 'Select Start'} 
                          {' - '}
                          {tempEnd ? new Date(tempEnd).toLocaleDateString() : 'Select End'}
                      </div>
                      <button 
                        onClick={() => { onChange(tempStart, tempEnd); onClose(); }}
                        className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-red-600 text-xs font-bold text-white rounded-lg transition-colors shadow-lg"
                      >
                          <Check size={12} /> Apply
                      </button>
                  </div>
              </Card>
          </div>
      </motion.div>
  );
};