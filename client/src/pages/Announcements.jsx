import { Link } from 'react-router-dom';
import { Bell, ArrowLeft, Sparkles } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';

/* This page will be replaced by Part B Announcements module */
export default function Announcements() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-grid-pattern">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b2c]/15 text-[#ff8c2b] border border-[#ff6b2c]/30 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL CIRCULARS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Department Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Important notices, upcoming technical talks, and competition deadlines.
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
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-[#ff6b2c]/10 border border-[#ff6b2c]/20 flex items-center justify-center text-[#ff8c2b] shadow-xl shadow-[#ff6b2c]/10">
          <Bell className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-bold text-white font-heading">
          No Announcements Published Yet
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
          The Department of Mechanical Engineering and AME core committee haven’t released any new broadcasts today. Check back regularly or watch your college email!
        </p>

        <div className="mt-6 inline-flex items-center gap-2 text-xs font-mono text-[#ffb020] bg-[#ffb020]/10 px-4 py-2 rounded-full border border-[#ffb020]/20">
          {/* B ka AnnouncementsList yahan judega */}
          <span>Part B Slot: Full Announcements Feed & Filter UI will integrate here</span>
        </div>
      </GlassCard>
    </div>
  );
}
