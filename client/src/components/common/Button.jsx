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
    sm: 'text-xs px-3.5 py-2 min-h-[40px] gap-1.5',
    md: 'text-sm px-5 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-6 py-3.5 min-h-[48px] gap-2.5 font-semibold',
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-[#ff6b2c] via-[#ff8c2b] to-[#ffb020] text-slate-950 font-semibold shadow-lg shadow-[#ff6b2c]/20 hover:shadow-[#ff6b2c]/40 hover:brightness-105 active:scale-[0.98]',
    secondary:
      'bg-[var(--bg-surface-solid)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] shadow-sm active:scale-[0.98]',
    outline:
      'bg-transparent border border-[#ff6b2c]/60 text-[#ff8c2b] hover:bg-[#ff6b2c]/10 active:scale-[0.98]',
    ghost:
      'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] active:scale-[0.98]',
    danger:
      'bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/25 active:scale-[0.98]',
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
