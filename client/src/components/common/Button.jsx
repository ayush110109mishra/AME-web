import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none focus:outline-none';

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-[#ff6b2c] via-[#ff8c2b] to-[#ffb020] text-slate-950 font-semibold shadow-lg shadow-[#ff6b2c]/20 hover:shadow-[#ff6b2c]/40 hover:brightness-105 active:scale-[0.98]',
    secondary:
      'bg-slate-800/80 hover:bg-slate-750 text-slate-100 border border-white/10 hover:border-white/20 active:scale-[0.98]',
    outline:
      'bg-transparent border border-[#ff6b2c]/50 text-[#ff8c2b] hover:bg-[#ff6b2c]/10 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-300 hover:text-white hover:bg-white/5 active:scale-[0.98]',
    danger:
      'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 active:scale-[0.98]',
  };

  return (
    <motion.button
      type={type}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </motion.button>
  );
}
