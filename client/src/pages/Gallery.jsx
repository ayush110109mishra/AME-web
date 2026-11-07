import { Link } from 'react-router-dom';
import { Image, ArrowLeft, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';

/* This page will be replaced by Part B Gallery module */
export default function Gallery() {
  const { isAdmin } = useAuth();
  const backTarget = isAdmin ? '/admin' : '/';
  const backLabel = isAdmin ? 'Back to Admin' : 'Back to Home';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-grid-pattern">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-mono mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>VISUAL CHRONICLES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
            Club Gallery & Media
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Photo records and video recaps from mechanical projects and events.
          </p>
        </div>

        <Link to={backTarget}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>{backLabel}</span>
          </Button>
        </Link>
      </div>

      {/* Clean Empty State */}
      <GlassCard className="p-12 sm:p-16 rounded-3xl text-center border-dashed border-[var(--border-subtle)] relative overflow-hidden">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] flex items-center justify-center text-sky-400 shadow-xl shadow-sky-500/10">
          <Image className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-bold text-[var(--text-main)] font-heading">
          Club Gallery
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 max-w-lg mx-auto leading-relaxed">
          Event photos will appear here soon.
        </p>

        {import.meta.env.DEV && (
          <div className="mt-6 inline-flex items-center gap-2 text-xs font-mono text-sky-400 bg-sky-500/10 px-4 py-2 rounded-full border border-sky-500/20">
            {/* B ka GalleryGrid yahan judega */}
            <span>Part B Slot: Lightbox Gallery & Album Category Viewer will integrate here</span>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
