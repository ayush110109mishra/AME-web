import { Bell, Calendar, Tag, ArrowRight } from 'lucide-react';
import GlassCard from './common/GlassCard';
import { USE_MOCK_DATA, MOCK_ANNOUNCEMENTS } from '../mocks/announcements';

export default function AnnouncementsSection({ year }) {
  // Flag toggle: USE_MOCK_DATA is false in production/final state
  const announcements = USE_MOCK_DATA ? MOCK_ANNOUNCEMENTS : [];

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

        {USE_MOCK_DATA && (
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
            MOCK PREVIEW
          </span>
        )}
      </div>

      {/* ============================================================== */}
      {/* 📢 ANNOUNCEMENTS FEED SLOT (B ka AnnouncementsList yahan judega) */}
      {/* ============================================================== */}
      {announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((item) => (
            <GlassCard
              key={item._id}
              hoverEffect
              className="p-5 rounded-2xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ff6b2c]/15 text-[#ff8c2b] border border-[#ff6b2c]/30">
                    <Tag className="w-3 h-3" />
                    {item.category}
                  </span>
                  <span className="text-[11px] text-[var(--text-subtle)] font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text-main)] group-hover:text-[#ffb020] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-subtle)]">
                <span>
                  {item.targetYear === 0
                    ? 'Target: All Years'
                    : `Target: Year ${item.targetYear}`}
                </span>
                <span className="text-[#ff8c2b] flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform">
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        /* Clean empty state: B ka AnnouncementsList yahan judega */
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

          {import.meta.env.DEV && (
            <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-mono text-[#ffb020] bg-[#ffb020]/10 px-3 py-1 rounded-full border border-[#ffb020]/20">
              {/* B ka AnnouncementsList yahan judega */}
              <span>Reserved for Part B Announcements Integration</span>
            </div>
          )}
        </GlassCard>
      )}
    </section>
  );
}
