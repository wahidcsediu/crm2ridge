import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  icon, 
  className = '',
  ...props 
}) => {
  
  const baseStyles = "relative inline-flex items-center justify-center font-bold tracking-wide uppercase font-display transition-all duration-300 rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group active:scale-[0.98]";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  // 3D Button Styles with colored shadow glows
  const variants = {
    primary: "bg-red-700 text-white shadow-[0_4px_0_rgb(100,0,0),0_10px_20px_rgba(220,38,38,0.2)] hover:shadow-[0_4px_0_rgb(100,0,0),0_0_20px_rgba(220,38,38,0.6)] hover:bg-red-600 active:shadow-none active:translate-y-[4px] border-t border-red-500/50",
    secondary: "bg-zinc-800 text-zinc-200 shadow-[0_4px_0_rgb(30,30,30),0_10px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_0_rgb(30,30,30),0_0_20px_rgba(255,255,255,0.1)] hover:bg-zinc-700 active:shadow-none active:translate-y-[4px] border-t border-zinc-600/50",
    danger: "bg-red-600 text-white shadow-[0_4px_0_rgb(100,0,0),0_10px_20px_rgba(220,38,38,0.3)] hover:shadow-[0_4px_0_rgb(100,0,0),0_0_25px_rgba(220,38,38,0.7)] hover:bg-red-500 active:shadow-none active:translate-y-[4px] border-t border-red-400/50",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50 shadow-none active:translate-y-1 border border-transparent hover:border-zinc-700"
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Refined Sheen sweep effect - Glassier look */}
      {variant !== 'ghost' && (
        <motion.div 
          initial={{ x: '-150%', opacity: 0 }}
          whileHover={{ x: '200%', opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-2/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none"
        />
      )}

      {/* Top highlight for glass edge */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50 pointer-events-none" />

      {isLoading ? (
        <div className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Processing</span>
        </div>
      ) : (
        <span className="relative z-10 flex items-center justify-center gap-2">
            {icon && <span className="relative top-[-1px]">{icon}</span>}
            {children}
        </span>
      )}
    </motion.button>
  );
};