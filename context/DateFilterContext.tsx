
import React, { createContext, useContext, useState, useMemo } from 'react';

interface DateFilterContextType {
  startDate: string;
  endDate: string;
  activeMonthName: string;
  isCurrentMonth: boolean;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  resetToCurrent: () => void;
  activeDate: Date;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export const DateFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with current date
  const [activeDate, setActiveDate] = useState(new Date());

  // Helper to get Bangladesh Timezone Date components
  const getBDDateParts = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1; // JS months are 0-indexed
    return { year, month };
  };

  // Calculate Start of Month in GMT+6
  const getMonthStart = (date: Date) => {
    const { year, month } = getBDDateParts(date);
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    
    // Adjust to ensure it matches BD midnight
    // We use string manipulation to force the offset for ISO consistency in DB comparisons
    const offset = 6 * 60; // GMT+6 in minutes
    const startUTC = new Date(start.getTime() - offset * 60 * 1000);
    return startUTC.toISOString();
  };

  // Calculate End of Month in GMT+6
  const getMonthEnd = (date: Date) => {
    const { year, month } = getBDDateParts(date);
    // Day 0 of next month is last day of current month
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    const offset = 6 * 60;
    const endUTC = new Date(end.getTime() - offset * 60 * 1000);
    return endUTC.toISOString();
  };

  const startDate = useMemo(() => getMonthStart(activeDate), [activeDate]);
  const endDate = useMemo(() => getMonthEnd(activeDate), [activeDate]);

  const activeMonthName = useMemo(() => {
    return activeDate.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' });
  }, [activeDate]);

  const isCurrentMonth = useMemo(() => {
    const { year: activeYear, month: activeMonth } = getBDDateParts(activeDate);
    const { year: currentYear, month: currentMonth } = getBDDateParts(new Date());
    return activeYear === currentYear && activeMonth === currentMonth;
  }, [activeDate]);

  const goToPreviousMonth = () => {
    setActiveDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setActiveDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const resetToCurrent = () => {
    setActiveDate(new Date());
  };

  return (
    <DateFilterContext.Provider value={{ 
      startDate, 
      endDate, 
      activeMonthName, 
      isCurrentMonth, 
      goToPreviousMonth, 
      goToNextMonth, 
      resetToCurrent,
      activeDate 
    }}>
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) throw new Error('useDateFilter must be used within a DateFilterProvider');
  return context;
};
