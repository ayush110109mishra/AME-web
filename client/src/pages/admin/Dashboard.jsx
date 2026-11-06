import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Users,
  ShieldCheck,
  GraduationCap,
  Bell,
  Image,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/stats');
      if (response.data && response.data.data) {
        setStats(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to load administrator statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-grid-pattern">
      {/* Header Banner */}
      <GlassCard className="p-6 sm:p-8 rounded-3xl relative overflow-hidden border-[#ff6b2c]/20 bg-gradient-to-r from-[#0f172a] via-[#15233e] to-[#0f172a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b2c]/15 text-[#ff8c2b] border border-[#ff6b2c]/30 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Real-time member demographics, role management, and club system metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </Button>

            <Link to="/admin/students">
              <Button size="sm">
                <span>Manage Students</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <GlassCard hoverEffect className="p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Total Registered Members
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-[#ff8c2b] transition-colors">
                {loading ? '...' : stats?.totalMembers ?? 0}
              </h3>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified in MongoDB Database</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#ff6b2c]/10 text-[#ff8c2b] flex items-center justify-center border border-[#ff6b2c]/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverEffect className="p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Active Student Members
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-[#ffb020] transition-colors">
                {loading ? '...' : stats?.totalStudents ?? 0}
              </h3>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#ffb020]" />
                <span>Eligible for Events & Voting</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#ffb020]/10 text-[#ffb020] flex items-center justify-center border border-[#ffb020]/20">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverEffect className="p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Authorized Administrators
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-amber-400 transition-colors">
                {loading ? '...' : stats?.totalAdmins ?? 0}
              </h3>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Elevated System Privileges</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Year-Wise Distribution */}
      <GlassCard className="p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-heading">
            Year-Wise Academic Distribution
          </h3>
          <span className="text-xs font-mono text-slate-400">1st - 4th Year</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: '1st Year', count: stats?.yearWise?.year1 ?? 0, color: 'from-blue-500 to-cyan-500' },
            { label: '2nd Year', count: stats?.yearWise?.year2 ?? 0, color: 'from-emerald-500 to-teal-500' },
            { label: '3rd Year', count: stats?.yearWise?.year3 ?? 0, color: 'from-amber-500 to-orange-500' },
            { label: '4th Year', count: stats?.yearWise?.year4 ?? 0, color: 'from-purple-500 to-pink-500' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between"
            >
              <span className="text-xs text-slate-400 font-medium">{item.label}</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">
                  {loading ? '...' : item.count}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {stats?.totalMembers > 0
                    ? `${Math.round((item.count / stats.totalMembers) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${item.color}`}
                  style={{
                    width: stats?.totalMembers > 0 ? `${(item.count / stats.totalMembers) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link to="/admin/students" className="block group">
          <GlassCard hoverEffect className="p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#ff6b2c]/10 text-[#ff8c2b] flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-[#ff8c2b] transition-colors">
                Student Directory & Roles
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Filter students by semester, promote or demote administrator privileges, and export CSV files.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#ff8c2b]">
              <span>Open Student Manager</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>
        </Link>

        <Link to="/announcements" className="block group">
          <GlassCard hoverEffect className="p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#ffb020]/10 text-[#ffb020] flex items-center justify-center mb-3">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-[#ffb020] transition-colors">
                Club Announcements
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                View published student circulars and prepare broadcasts for upcoming workshops.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#ffb020]">
              <span>View Circulars</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>
        </Link>

        <Link to="/gallery" className="block group">
          <GlassCard hoverEffect className="p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
                <Image className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                Photo Gallery Archive
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Manage mechanical symposium galleries, industrial tour pictures, and event highlights.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-sky-400">
              <span>Explore Gallery</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>
        </Link>
      </div>
    </div>
  );
}
