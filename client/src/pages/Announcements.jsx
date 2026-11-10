import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  ArrowLeft,
  Calendar,
  Tag,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';

export default function Announcements() {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 1 });

  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Workshops', value: 'workshop' },
    { label: 'Seminars', value: 'seminar' },
    { label: 'Intro Sessions', value: 'intro' },
    { label: 'General Notices', value: 'general' },
  ];

  const fetchAnnouncements = useCallback(async (pageNumber = 1, cat = category) => {
    setLoading(true);
    try {
      const params = {
        page: pageNumber,
        limit: 9,
      };
      if (cat) params.category = cat;

      const response = await api.get('/announcements', { params });
      if (response.data?.data) {
        setAnnouncements(response.data.data.announcements);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchAnnouncements(page, category);
  }, [page, category, fetchAnnouncements]);

  const handleCategoryChange = (val) => {
    setCategory(val);
    setPage(1);
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'seminar':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'workshop':
        return 'bg-[#ff6b2c]/15 text-[#ff8c2b] border-[#ff6b2c]/30';
      case 'intro':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    }
  };

  const backTarget = isAdmin ? '/admin' : '/';
  const backLabel = isAdmin ? 'Back to Admin' : 'Back to Home';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-grid-pattern">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to={backTarget}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[#ff8c2b] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{backLabel}</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
            Department Notice Board & Broadcasts
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Official announcements, workshop calendars, and technical competition circulars.
          </p>
        </div>

        {isAdmin && (
          <Link to="/admin/announcements">
            <Button size="sm">
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Manage Announcements</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Category Filter Chips - Edge-to-edge scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((c) => {
          const isActive = category === c.value;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => handleCategoryChange(c.value)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[#ff6b2c] to-[#ffb020] text-slate-950 shadow-md shadow-[#ff6b2c]/20'
                  : 'glass-panel text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} className="p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton width="80px" height="24px" rounded="rounded-full" />
                <Skeleton width="60px" height="18px" />
              </div>
              <Skeleton width="100%" height="28px" />
              <div className="space-y-2">
                <Skeleton width="100%" height="16px" />
                <Skeleton width="85%" height="16px" />
                <Skeleton width="60%" height="16px" />
              </div>
              <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between">
                <Skeleton width="90px" height="16px" />
                <Skeleton width="70px" height="16px" />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {announcements.map((item) => (
            <GlassCard
              key={item._id}
              hoverEffect
              className="p-6 rounded-2xl flex flex-col justify-between group"
            >
              <div>
                {/* Badges & Meta */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${getCategoryBadgeClass(
                      item.category
                    )}`}
                  >
                    <Tag className="w-3 h-3" />
                    {item.category}
                  </span>

                  <span className="text-[11px] text-[var(--text-subtle)] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getRelativeTime(item.createdAt)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text-main)] group-hover:text-[#ffb020] transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2.5 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* Footer Meta */}
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-subtle)]">
                <span className="font-mono px-2 py-0.5 rounded bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  {item.targetYear === 0
                    ? 'Target: All Years'
                    : `Target: Year ${item.targetYear}`}
                </span>

                <div className="flex items-center gap-1 text-[var(--text-subtle)]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        /* Empty State */
        <GlassCard className="p-8 sm:p-16 rounded-3xl text-center border-dashed border-[var(--border-subtle)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ff6b2c]/20 to-[#ffb020]/10 border border-[#ff6b2c]/30 flex items-center justify-center text-[#ff8c2b]">
            <Bell className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#ff6b2c]/10 text-[#ff8c2b] border border-[#ff6b2c]/20 mb-2">
            Stay Tuned
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] font-heading">
            Official Announcements Coming Soon
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 max-w-md mx-auto leading-relaxed">
            {category
              ? `There are currently no circulars in the "${category}" category.`
              : 'Official circulars, workshop schedules, and technical competition circulars for the upcoming session will be published here soon.'}
          </p>
          {category && (
            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCategory('')}
              >
                Clear Category Filter
              </Button>
            </div>
          )}
        </GlassCard>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Previous</span>
          </Button>

          <span className="text-xs font-mono text-[var(--text-muted)] px-3">
            Page {pagination.page} of {pagination.pages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages || loading}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
