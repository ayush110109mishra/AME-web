import { Link } from 'react-router-dom';
import { Cog, Home, ArrowLeft } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-grid-pattern">
      <GlassCard className="max-w-md w-full p-8 sm:p-10 text-center rounded-3xl border-[var(--border-subtle)] relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ff6b2c]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Animated Mechanical 404 Visual */}
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#ff6b2c]/20 to-[#ffb020]/20 blur-sm" />
            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
              <Cog className="w-10 h-10 text-[#ff8c2b] animate-spin-slow" />
            </div>
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#ff6b2c]/15 text-[#ff8c2b] border border-[#ff6b2c]/30 mb-3">
            ERROR 404
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading tracking-tight">
            Mechanism Disconnected
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            The page or mechanical component you are searching for might have been shifted, renamed, or is currently undergoing maintenance.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                <span>Return to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
