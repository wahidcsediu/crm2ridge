import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  title?: string;
  delay?: number;
  noTilt?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  contentClassName = '',
  title, 
  delay = 0, 
  noTilt = false 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Mouse position state
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring animation for tilt - adjusted for "heavier" feel
  const mouseX = useSpring(x, { stiffness: 120, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 120, damping: 20 });

  // Transform mouse position to rotation
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

  // Glare Effect - mapping rotation to gradient position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (noTilt || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    
    const xPct = mouseXFromCenter / width;
    const yPct = mouseYFromCenter / height;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, type: "spring", bounce: 0.4 }}
      style={{
        rotateX: noTilt ? 0 : rotateX,
        rotateY: noTilt ? 0 : rotateY,
        transformStyle: noTilt ? "flat" : "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative group rounded-2xl ${className}`}
    >
      {/* Ambient Shadow Layer (Ground Reflection) */}
      <div 
        className="absolute inset-4 bg-red-500/10 blur-2xl rounded-2xl translate-z-[-40px] transition-opacity duration-700 opacity-0 group-hover:opacity-60 pointer-events-none" 
        style={{ transform: noTilt ? 'none' : 'translateZ(-40px) translateY(20px)' }}
      />

      {/* Main Card Container */}
      <div 
        className={`relative h-full bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden ${contentClassName || 'p-6'}`} 
        style={{ transform: noTilt ? 'none' : "translateZ(0)" }}
      >
        
        {/* Top Rim Light */}
        <div className="absolute inset-0 rounded-2xl border-t border-white/10 pointer-events-none z-20 opacity-50" />
        
        {/* Dynamic Glare Gradient (Z-20) */}
        {!noTilt && (
          <motion.div 
            style={{ 
              background: useTransform(
                [glareX, glareY],
                ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.06) 0%, transparent 60%)`
              ),
              opacity: useTransform(mouseX, (latest) => Math.abs(latest) * 1.5) 
            }}
            className="absolute inset-0 pointer-events-none z-20 mix-blend-plus-lighter"
          />
        )}
        
        {/* Animated border glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10">
            <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-br from-red-500/20 via-transparent to-blue-500/20 blur-sm" />
        </div>

        {/* Title with 3D Float Effect */}
        {title && (
          <div style={{ transform: noTilt ? 'none' : "translateZ(20px)" }} className="mb-4 pb-2 border-b border-white/5 relative z-50 pointer-events-none">
             <h3 className="text-xl font-bold text-white font-display tracking-wide drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
              {title}
            </h3>
          </div>
        )}
        
        {/* Content Wrapper - Z-30 to float above glare */}
        <div 
          className="relative z-30 h-full"
          style={{ transform: noTilt ? 'none' : "translateZ(10px)" }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
};