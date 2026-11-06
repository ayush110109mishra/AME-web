import { Link } from 'react-router-dom';
import { Image, ArrowLeft, Camera } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';

/* This page will be replaced by Part B Gallery module */
export default function Gallery() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-grid-pattern">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-mono mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>VISUAL CHRONICLES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Club Gallery & Media
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Photo records and video recaps from mechanical projects and events.
          </p>
        </div>

        <Link to="/">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>

      {/* Premium Empty State */}
      <GlassCard className="p-12 sm:p-16 rounded-3xl text-center border-dashed border-white/15 relative overflow-hidden">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-500/10">
          <Image className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-bold text-white font-heading">
          Gallery Archive Under Curation
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
          Photo highlights from recent aerodynamic wind tunnel tests, robot combats, and CNC workshops are currently being curated by the media team.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 text-xs font-mono text-sky-400 bg-sky-500/10 px-4 py-2 rounded-full border border-sky-500/20">
          {/* B ka GalleryGrid yahan judega */}
          <span>Part B Slot: Lightbox Gallery & Album Category Viewer will integrate here</span>
        </div>
      </GlassCard>
    </div>
  );
}
