import React from 'react';
import { motion } from 'framer-motion';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-80 perspective-1000">
      <div className="relative w-20 h-20 transform-style-preserve-3d">
        
        {/* Central Nucleus */}
        <motion.div 
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[30%] bg-red-600 rounded-full shadow-[0_0_30px_red]"
        />

        {/* Ring 1 - X Axis */}
        <motion.div
          className="absolute inset-0 border-2 border-red-500/60 rounded-full border-t-transparent border-b-transparent"
          animate={{ rotateX: 360, rotateY: 180 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ boxShadow: "0 0 10px rgba(220, 38, 38, 0.2)" }}
        />
        
        {/* Ring 2 - Y Axis */}
        <motion.div
          className="absolute inset-[-4px] border border-white/20 rounded-full border-r-transparent border-l-transparent"
          animate={{ rotateY: -360, rotateZ: 45 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Ring 3 - Z Axis/Wobble */}
        <motion.div
          className="absolute inset-[-8px] border border-red-900/40 rounded-full border-t-transparent"
          animate={{ rotateZ: 360, rotateX: 45 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="mt-10 flex flex-col items-center gap-1">
          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500"
          >
            Initializing
          </motion.p>
          <p className="text-xs text-zinc-600 font-mono">Loading System Data...</p>
      </div>
    </div>
  );
};