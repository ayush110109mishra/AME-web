import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Bell, Calendar, Tag, ArrowRight } from 'lucide-react';
import GlassCard from './common/GlassCard';
import Skeleton from './common/Skeleton';

export default function AnnouncementsSection({ year }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const response = await api.get('/announcements', {
          params: { limit: 3 },
        });
        if (isMounted && response.data?.data?.announcements) {
          setAnnouncements(response.data.data.announcements);
        }
      } catch (err) {
        console.error('Failed to load announcements:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLatest();
    return () => {
      isMounted = false;
    };
  }, [year]);

  const getCategoryColor = (cat) => {
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

  return (
    <section id="announcements" className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff6b2c]/20 text-[#ff8c2b] flex items-center justify-center border border-[#ff6b2c]/30">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-main)] font-heading">
              Club Announcements & Circulars
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Department updates, workshop schedules, and competitions
            </p>
          </div>
        </div>

        <Link
          to="/announcements"
          className="text-xs font-semibold text-[#ff8c2b] hover:text-[#ffb020] flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-5 rounded-2xl space-y-3">
              <div className="flex justify-between">
                <Skeleton width="70px" height="22px" rounded="rounded-full" />
                <Skeleton width="80px" height="18px" />
              </div>
              <Skeleton width="100%" height="24px" />
              <Skeleton width="90%" height="16px" />
              <Skeleton width="70%" height="16px" />
            </GlassCard>
          ))}
        </div>
      ) : announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.map((item) => (
            <GlassCard
              key={item._id}
              hoverEffect
              className="p-5 rounded-2xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${getCategoryColor(
                      item.category
                    )}`}
                  >
                    <Tag className="w-3 h-3" />
                    {item.category}
                  </span>
                  <span className="text-[11px] text-[var(--text-subtle)] font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text-main)] group-hover:text-[#ffb020] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-subtle)]">
                <span>
                  {item.targetYear === 0
                    ? 'Target: All Years'
                    : `Target: Year ${item.targetYear}`}
                </span>
                <Link
                  to="/announcements"
                  className="text-[#ff8c2b] flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform"
                >
                  Read More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        /* Clean empty state */
        <GlassCard className="p-10 rounded-2xl text-center border-dashed border-[var(--border-subtle)]">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] flex items-center justify-center text-[#ff8c2b]">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-main)]">
            No Live Announcements Right Now
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
            Stay tuned! Upcoming mechanical symposium dates, CAD challenge guidelines, and guest lectures will be posted here directly.
          </p>
        </GlassCard>
      )}
    </section>
  );
}
