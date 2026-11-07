import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  ArrowLeft,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/common/GlassCard';
import Skeleton from '../components/common/Skeleton';

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/gallery/${id}`);
        if (isMounted && response.data?.data) {
          setAlbum(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load album:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAlbum();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const photos = album?.images || [];
  const isOpen = lightboxIndex !== null && photos.length > 0;

  const nextPhoto = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev + 1) % photos.length);
    }
  }, [lightboxIndex, photos.length]);

  const prevPhoto = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  }, [lightboxIndex, photos.length]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextPhoto, prevPhoto, closeLightbox]);

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) nextPhoto(); // Swiped left -> next
    if (diff < -50) prevPhoto(); // Swiped right -> prev
    setTouchStartX(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-grid-pattern">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[#ff8c2b] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Albums</span>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton width="300px" height="36px" />
              <Skeleton width="200px" height="18px" />
            </div>
          ) : (
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
                {album?.eventName}
              </h1>

              <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-muted)] flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#ff8c2b]" />
                  <span>
                    {new Date(album?.eventDate || album?.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-[var(--text-subtle)]">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{photos.length} Captured Photos</span>
                </span>
              </div>

              {album?.description && (
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 max-w-3xl leading-relaxed">
                  {album.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} width="100%" height="220px" rounded="rounded-2xl" />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo._id || photo.publicId || index}
              whileHover={{ scale: 1.02 }}
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-square rounded-2xl overflow-hidden glass-panel border-[var(--border-subtle)] cursor-pointer bg-[var(--bg-surface-solid)]"
            >
              <img
                src={photo.url}
                alt={`${album?.eventName} photo ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                <div className="p-2.5 rounded-full bg-black/60 border border-white/20 shadow-lg">
                  <Maximize2 className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty Album State */
        <GlassCard className="p-16 rounded-3xl text-center border-dashed border-[var(--border-subtle)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] flex items-center justify-center text-sky-400">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)] font-heading">
            No Photos Uploaded to this Album
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 max-w-md mx-auto">
            Photos from this mechanical event haven’t been uploaded yet. Check back soon!
          </p>
        </GlassCard>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Bar: Title & Close Button */}
            <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-50 text-white">
              <div>
                <p className="text-sm font-semibold truncate max-w-md">
                  {album?.eventName}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Photo {lightboxIndex + 1} of {photos.length}
                </p>
              </div>

              <button
                type="button"
                onClick={closeLightbox}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Previous Button */}
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 transition-colors z-50 cursor-pointer hidden sm:flex items-center justify-center"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Main Image Container */}
            <div className="relative max-w-5xl max-h-[80vh] p-4 flex items-center justify-center">
              <motion.img
                key={photos[lightboxIndex]?.url}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                src={photos[lightboxIndex]?.url}
                alt={`${album?.eventName} preview`}
                className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
              />
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 transition-colors z-50 cursor-pointer hidden sm:flex items-center justify-center"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Bottom thumbnail strip / instruction */}
            <div className="absolute bottom-4 inset-x-0 text-center text-xs text-slate-400 font-mono pointer-events-none">
              Use Left / Right arrow keys to navigate · Esc to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

