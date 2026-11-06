import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Sparkles,
  Calendar,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Users,
  Image,
  ArrowRight,
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import AnnouncementsSection from '../components/AnnouncementsSection';

export default function Home() {
  const { user } = useAuth();
  const [clubStats, setClubStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchClubStats = async () => {
      try {
        const response = await api.get('/auth/stats');
        if (response.data && response.data.data) {
          setClubStats(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load club statistics:', err.message);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchClubStats();
  }, []);

  const getYearSuffix = (year) => {
    if (year === 1) return '1st';
    if (year === 2) return '2nd';
    if (year === 3) return '3rd';
    return `${year}th`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-grid-pattern">
      {/* Hero Welcome Banner */}
      <GlassCard className="p-6 sm:p-10 rounded-3xl relative overflow-hidden border-[#ff6b2c]/20 bg-gradient-to-r from-[#0f172a] via-[#131f38] to-[#0f172a]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff6b2c]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b2c]/15 text-[#ff8c2b] border border-[#ff6b2c]/30 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MECHANICAL CLUB PORTAL</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              Welcome, {user?.name || 'Engineer'} 👋
            </h1>

            <p className="mt-2 text-sm sm:text-base text-slate-300 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#ffb020]">
                {getYearSuffix(user?.year)} Year
              </span>
              <span className="text-slate-500">•</span>
              <span>Semester {user?.semester}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10">
                Roll: {user?.rollNo}
              </span>
            </p>

            <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-xl">
              {user?.college} · {user?.branch}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/announcements">
              <Button variant="outline" size="md">
                <span>View Notice Board</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* 3 Metric / Stats Cards (Real database count) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard hoverEffect className="p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Club Status
              </p>
              <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-[#ff8c2b] transition-colors">
                {user?.role === 'admin' ? 'Club Administrator' : 'Active Member'}
              </h3>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Department Credentials</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#ff6b2c]/10 text-[#ff8c2b] flex items-center justify-center border border-[#ff6b2c]/20">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverEffect className="p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Community Size
              </p>
              <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-[#ff8c2b] transition-colors">
                {loadingStats
                  ? '...'
                  : `${clubStats?.totalMembers ?? 1} Engineers`}
              </h3>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Registered in Club Network</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverEffect className="p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Workshops & Events
              </p>
              <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-[#ffb020] transition-colors">
                4 Upcoming
              </h3>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#ffb020]" />
                <span>CAD, CFD & Robotics Design</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#ffb020]/10 text-[#ffb020] flex items-center justify-center border border-[#ffb020]/20">
              <Compass className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ============================================================== */}
      {/* 📢 ANNOUNCEMENTS SECTION (B ka AnnouncementsList yahan judega) */}
      {/* ============================================================== */}
      <AnnouncementsSection year={user?.year} />

      {/* ============================================================== */}
      {/* 🖼️ LATEST FROM GALLERY SECTION (B ka GalleryGrid yahan judega) */}
      {/* ============================================================== */}
      <section id="gallery" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">
                Latest from Gallery
              </h2>
              <p className="text-xs text-slate-400">
                Moments from CAD competitions, industrial visits, and lab sessions
              </p>
            </div>
          </div>

          <Link
            to="/gallery"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
          >
            <span>View Full Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Empty state: B ka GalleryGrid yahan judega */}
        <GlassCard className="p-10 rounded-2xl text-center border-dashed border-white/15">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-sky-400">
            <Image className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">
            Gallery Media Coming Soon
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            High-resolution captures from college exhibitions, fabrication workshops, and guest lectures will be curated and displayed right here.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-mono text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
            {/* B ka GalleryGrid yahan judega */}
            <span>Reserved for Part B Gallery Integration</span>
          </div>
        </GlassCard>
      </section>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <GlassCard className="p-6 rounded-2xl border-white/10 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Student Profile Settings</h4>
            <p className="text-xs text-slate-400 mt-1">
              Keep your contact and semester information up to date.
            </p>
          </div>
          <Link to="/profile">
            <Button variant="secondary" size="sm">
              <span>Update Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </GlassCard>

        <GlassCard className="p-6 rounded-2xl border-white/10 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Annual Tech Magazine</h4>
            <p className="text-xs text-slate-400 mt-1">
              Submit articles, projects, and research papers for AME 2026.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded bg-white/5 border border-white/10">
            Submissions Open Soon
          </span>
        </GlassCard>
      </div>
    </div>
  );
}
