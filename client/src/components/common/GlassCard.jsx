import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  animate = true,
  ...props
}) {
  const Component = animate ? motion.div : 'div';

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      }
    : {};

  return (
    <Component
      {...animationProps}
      className={`rounded-2xl glass-panel ${
        hoverEffect ? 'glass-panel-hover' : ''
      } ${glow ? 'glow-accent border-[#ff6b2c]/30' : ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

