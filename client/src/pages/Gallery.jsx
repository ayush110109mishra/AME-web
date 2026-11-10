import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Image,
  ArrowLeft,
  Calendar,
  Layers,
  Camera,
  ArrowRight,
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import { getOptimizedImageUrl } from '../utils/cloudinary';

export default function Gallery() {
  const { isAdmin } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAlbums = async () => {
      try {
        const response = await api.get('/gallery');
        if (isMounted && response.data?.data) {
          setAlbums(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load gallery albums:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAlbums();
    return () => {
      isMounted = false;
    };
  }, []);

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
            Club Gallery & Visual Chronicles
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Photo records and event media from symposiums, CAD challenges, and technical tours.
          </p>
        </div>

        {isAdmin && (
          <Link to="/admin/gallery">
            <Button size="sm">
              <Camera className="w-4 h-4 mr-1.5" />
              <span>Manage Gallery</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Albums Grid (2 columns on mobile, 3 on desktop) */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} className="overflow-hidden rounded-2xl space-y-2">
              <Skeleton width="100%" height="140px" rounded="rounded-none" />
              <div className="p-3 sm:p-5 space-y-2">
                <Skeleton width="70%" height="20px" />
                <Skeleton width="90%" height="14px" />
                <div className="flex justify-between pt-1">
                  <Skeleton width="60px" height="14px" />
                  <Skeleton width="40px" height="14px" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : albums.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {albums.map((album) => {
            const hasCover = album.coverImage?.url;
            return (
              <Link
                key={album._id}
                to={`/gallery/${album._id}`}
                className="group block"
              >
                <GlassCard
                  hoverEffect
                  className="overflow-hidden rounded-2xl h-full flex flex-col justify-between border-[var(--border-subtle)]"
                >
                  {/* Album Cover Thumbnail */}
                  <div className="relative aspect-[4/3] sm:h-48 w-full bg-[var(--bg-surface-solid)] overflow-hidden">
                    {hasCover ? (
                      <img
                        src={getOptimizedImageUrl(album.coverImage.url, 500)}
                        alt={album.eventName}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-subtle)] bg-[var(--bg-surface-solid)]">
                        <Image className="w-8 h-8 sm:w-10 sm:h-10 mb-1 opacity-50" />
                        <span className="text-[11px] sm:text-xs">No photos yet</span>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-md">
                      <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff8c2b]" />
                      <span>{album.photoCount} <span className="hidden sm:inline">Photos</span></span>
                    </div>
                  </div>

                  {/* Album Details */}
                  <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[var(--text-subtle)] mb-1">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span className="truncate">
                          {new Date(album.eventDate || album.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-lg font-bold text-[var(--text-main)] group-hover:text-[#ff8c2b] transition-colors line-clamp-1">
                        {album.eventName}
                      </h3>

                      {album.description && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1 sm:line-clamp-2 leading-relaxed hidden sm:block">
                          {album.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[#ff8c2b]">
                      <span className="text-[11px] sm:text-xs">View Album</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <GlassCard className="p-16 rounded-3xl text-center border-dashed border-[var(--border-subtle)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] flex items-center justify-center text-sky-400">
            <Image className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)] font-heading">
            No Event Albums Created Yet
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 max-w-md mx-auto">
            Event photos will appear here soon. Stay tuned for moments from our upcoming departmental workshops and championships!
          </p>
        </GlassCard>
      )}
    </div>
  );
}
