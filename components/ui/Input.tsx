import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full mb-4 relative z-50">
      {label && <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">{label}</label>}
      <div className="relative group">
        
        {/* Ambient Glow Container */}
        <motion.div 
            animate={{ 
                opacity: isFocused ? 1 : 0,
                scale: isFocused ? 1.02 : 0.98
            }}
            transition={{ duration: 0.3 }}
            className="absolute -inset-1 bg-gradient-to-r from-red-600/50 via-maroon-600/30 to-red-900/50 rounded-2xl blur-md pointer-events-none z-0"
        />
        
        <div className="relative overflow-hidden rounded-xl z-10">
            <input
              className={`relative w-full bg-[#0F0F0F] border border-zinc-800 text-white px-4 py-3.5 outline-none transition-all duration-300 placeholder-zinc-700 font-sans z-20 focus:bg-black/80 ${className}`}
              onFocus={(e) => {
                  setIsFocused(true);
                  props.onFocus && props.onFocus(e);
              }}
              onBlur={(e) => {
                  setIsFocused(false);
                  props.onBlur && props.onBlur(e);
              }}
              {...props}
            />
            
            {/* Animated Bottom Border Line */}
            <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isFocused ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-red-400 to-red-700 origin-left pointer-events-none z-30"
            />

            {/* Inner Shadow for depth */}
            <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none z-20 rounded-xl" />
        </div>
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 ml-1 text-xs text-red-500 font-medium flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shadow-[0_0_5px_red]" />
          {error}
        </motion.p>
      )}
    </div>
  );
};