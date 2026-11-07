import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Image,
  Plus,
  UploadCloud,
  Trash2,
  Edit2,
  ArrowLeft,
  Calendar,
  Layers,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Camera,
  Star,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Skeleton from '../../components/common/Skeleton';

export default function AdminGallery() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  // Album creation / edit form state
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    eventDate: new Date().toISOString().slice(0, 10),
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submittingAlbum, setSubmittingAlbum] = useState(false);

  // Active Album Manager for multi-photo uploads
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef(null);

  // Modals state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: null, // 'album' | 'photo'
    item: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/gallery');
      if (response.data?.data) {
        setAlbums(response.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch albums');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Load single album details when opening photo manager
  const openPhotoManager = async (albumSummary) => {
    try {
      const response = await api.get(`/gallery/${albumSummary._id}`);
      setActiveAlbum(response.data.data);
      setSelectedFiles([]);
      setFilePreviews([]);
    } catch (err) {
      toast.error('Failed to load album photos');
    }
  };

  const closePhotoManager = () => {
    setActiveAlbum(null);
    setSelectedFiles([]);
    setFilePreviews([]);
    fetchAlbums(); // refresh counts
  };

  // Cover image selection for album creation
  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Cover image cannot exceed 5 MB');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const clearCoverSelect = () => {
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
  };

  const handleAlbumFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateAlbumForm = () => {
    const errs = {};
    if (!formData.eventName.trim()) {
      errs.eventName = 'Event name is required';
    } else if (formData.eventName.trim().length > 150) {
      errs.eventName = 'Event name cannot exceed 150 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    if (!validateAlbumForm()) return;

    setSubmittingAlbum(true);
    try {
      const data = new FormData();
      data.append('eventName', formData.eventName.trim());
      data.append('description', formData.description.trim());
      data.append('eventDate', formData.eventDate);
      if (coverFile) {
        data.append('coverImage', coverFile);
      }

      if (editingAlbumId) {
        const response = await api.put(`/gallery/${editingAlbumId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Album updated successfully');
        resetAlbumForm();
        fetchAlbums();
      } else {
        const response = await api.post('/gallery', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('New album created successfully');
        resetAlbumForm();
        fetchAlbums();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save album');
    } finally {
      setSubmittingAlbum(false);
    }
  };

  const startEditAlbum = (album) => {
    setEditingAlbumId(album._id);
    setFormData({
      eventName: album.eventName,
      description: album.description || '',
      eventDate: album.eventDate ? album.eventDate.slice(0, 10) : '',
    });
    setCoverFile(null);
    setCoverPreview(album.coverImage?.url || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAlbumForm = () => {
    setEditingAlbumId(null);
    setFormData({
      eventName: '',
      description: '',
      eventDate: new Date().toISOString().slice(0, 10),
    });
    clearCoverSelect();
    setErrors({});
  };

  // Multi-photo File Picker Handlers
  const handleFilesChosen = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (files.length + selectedFiles.length > 10) {
      toast.error('You can upload a maximum of 10 photos in one batch');
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} is larger than 5 MB`);
        continue;
      }
      validFiles.push(f);
      newPreviews.push({
        name: f.name,
        url: URL.createObjectURL(f),
      });
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index) => {
    URL.revokeObjectURL(filePreviews[index].url);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload Batch to Cloudinary
  const handleUploadPhotos = async () => {
    if (!selectedFiles.length || !activeAlbum) return;

    setUploadingPhotos(true);
    try {
      const data = new FormData();
      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      const response = await api.post(`/gallery/${activeAlbum._id}/images`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`${selectedFiles.length} photo(s) uploaded successfully!`);
      setActiveAlbum(response.data.data);
      setSelectedFiles([]);
      setFilePreviews([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Photo upload failed');
    } finally {
      setUploadingPhotos(false);
    }
  };

  // Set Photo as Cover Image
  const handleSetCover = async (publicId) => {
    if (!activeAlbum) return;
    try {
      const response = await api.put(`/gallery/${activeAlbum._id}`, {
        coverPublicId: publicId,
      });
      toast.success('Album cover updated');
      setActiveAlbum(response.data.data);
    } catch (err) {
      toast.error('Failed to update album cover');
    }
  };

  // Confirm Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;

    setDeleting(true);
    try {
      if (deleteModal.type === 'album') {
        await api.delete(`/gallery/${deleteModal.item._id}`);
        toast.success('Album and all photos deleted successfully');
        setAlbums((prev) => prev.filter((a) => a._id !== deleteModal.item._id));
        if (activeAlbum?._id === deleteModal.item._id) {
          setActiveAlbum(null);
        }
      } else if (deleteModal.type === 'photo') {
        const encoded = encodeURIComponent(deleteModal.item.publicId);
        const response = await api.delete(
          `/gallery/${activeAlbum._id}/images/${encoded}`
        );
        toast.success('Photo removed from album and storage');
        setActiveAlbum(response.data.data);
      }
      setDeleteModal({ open: false, type: null, item: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete operation failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-grid-pattern">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[#ff8c2b] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
            Gallery & Media Management
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Create event albums, upload high-resolution photos with auto-optimization, and organize captures.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchAlbums}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Album Creation / Edit Card */}
      <GlassCard className="p-6 sm:p-8 rounded-2xl border-[var(--border-subtle)] shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b2c]/15 text-[#ff8c2b] flex items-center justify-center">
              {editingAlbumId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">
                {editingAlbumId ? 'Edit Event Album' : 'Create New Event Album'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {editingAlbumId
                  ? 'Update album metadata and cover'
                  : 'Add a new collection for event photographs'}
              </p>
            </div>
          </div>

          {editingAlbumId && (
            <Button variant="ghost" size="sm" onClick={resetAlbumForm}>
              <X className="w-4 h-4 mr-1" />
              <span>Cancel</span>
            </Button>
          )}
        </div>

        <form onSubmit={handleAlbumSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Event Name"
              name="eventName"
              placeholder="e.g. Aerodynamic Wind Tunnel Testing 2026"
              value={formData.eventName}
              onChange={handleAlbumFormChange}
              error={errors.eventName}
              maxLength={150}
              required
            />

            <Input
              label="Event Date"
              name="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={handleAlbumFormChange}
              required
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Album Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief summary of the exhibition, participants, and achievements..."
              value={formData.description}
              onChange={handleAlbumFormChange}
              maxLength={2000}
              className="w-full rounded-xl px-4 py-2.5 text-sm glass-input border-[var(--border-input)] transition-all"
            />
          </div>

          {/* Optional Cover Image Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Cover Image (Optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] cursor-pointer inline-flex items-center gap-2 text-[var(--text-main)]">
                <Camera className="w-4 h-4 text-[#ff8c2b]" />
                <span>Choose Cover Image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverSelect}
                  className="hidden"
                />
              </label>

              {coverPreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-12 h-12 object-cover rounded-lg border border-[var(--border-subtle)]"
                  />
                  <button
                    type="button"
                    onClick={clearCoverSelect}
                    className="p-1 rounded-full text-rose-500 hover:bg-rose-500/10"
                    title="Remove preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <span className="text-[11px] text-[var(--text-subtle)] mt-1 block">
              JPG, PNG, or WebP up to 5 MB. If omitted, the first photo uploaded will become the cover.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {editingAlbumId && (
              <Button variant="secondary" size="md" onClick={resetAlbumForm}>
                Discard
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submittingAlbum}
              icon={editingAlbumId ? Edit2 : Plus}
              className="px-6"
            >
              {editingAlbumId ? 'Update Album' : 'Create Album'}
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Album List */}
      <GlassCard className="rounded-2xl overflow-hidden border-[var(--border-subtle)] shadow-2xl">
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--text-main)] font-heading">
            Event Albums ({albums.length})
          </h3>
          <span className="text-xs font-mono text-[var(--text-subtle)]">
            Click 'Manage Photos' to upload or edit images
          </span>
        </div>

        <div className="p-5">
          {loading && albums.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} width="100%" height="160px" rounded="rounded-xl" />
              ))}
            </div>
          ) : albums.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)]">
              <Camera className="w-8 h-8 mx-auto mb-2 text-[var(--text-subtle)]" />
              <p className="font-medium text-[var(--text-main)]">No albums created yet</p>
              <p className="text-xs text-[var(--text-subtle)] mt-1">
                Use the form above to establish your first event photo gallery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {albums.map((album) => {
                const hasCover = album.coverImage?.url;
                return (
                  <GlassCard
                    key={album._id}
                    className="rounded-2xl overflow-hidden border-[var(--border-subtle)] flex flex-col justify-between"
                  >
                    <div className="relative h-40 bg-[var(--bg-surface-solid)] overflow-hidden">
                      {hasCover ? (
                        <img
                          src={album.coverImage.url}
                          alt={album.eventName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-subtle)]">
                          <Image className="w-8 h-8 opacity-40" />
                        </div>
                      )}

                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-black/60 text-white backdrop-blur-md">
                        {album.photoCount} Photos
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-subtle)]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(album.eventDate || album.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[var(--text-main)] mt-1 line-clamp-1">
                          {album.eventName}
                        </h4>
                        {album.description && (
                          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                            {album.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openPhotoManager(album)}
                          icon={UploadCloud}
                          className="text-xs flex-1"
                        >
                          Manage Photos
                        </Button>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => startEditAlbum(album)}
                            className="p-1.5"
                            title="Edit Album Metadata"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                type: 'album',
                                item: album,
                              })
                            }
                            className="p-1.5"
                            title="Delete Entire Album"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Photo Manager Modal for Selected Album */}
      <AnimatePresence>
        {activeAlbum && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl glass-panel p-6 border border-[var(--border-subtle)] shadow-2xl bg-[var(--dropdown-bg)] my-auto overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-main)] font-heading">
                    {activeAlbum.eventName}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {activeAlbum.images?.length || 0} Photos currently in album
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePhotoManager}
                  className="p-2 rounded-full hover:bg-[var(--bg-surface-hover)] text-[var(--text-subtle)] hover:text-[var(--text-main)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
                {/* Upload Section (Drag & Drop or Pick) */}
                <div className="p-6 rounded-2xl border-2 border-dashed border-[var(--border-subtle)] text-center bg-[var(--bg-surface-solid)] space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#ff6b2c]/15 text-[#ff8c2b] flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-main)]">
                      Upload Photos to this Album
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Drag and drop up to 10 images, or choose from files (JPG, PNG, WebP up to 5 MB each)
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFilesChosen}
                    className="hidden"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Photos
                  </Button>

                  {/* Staged Previews */}
                  {filePreviews.length > 0 && (
                    <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-main)]">
                          Ready to Upload ({selectedFiles.length}/10):
                        </span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleUploadPhotos}
                          isLoading={uploadingPhotos}
                        >
                          Upload All to Cloudinary
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {filePreviews.map((preview, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-[var(--border-subtle)]">
                            <img
                              src={preview.url}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(idx)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Existing Photos in Album */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[var(--text-main)] font-heading">
                    Existing Album Photos
                  </h4>

                  {activeAlbum.images?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {activeAlbum.images.map((photo) => {
                        const isCover = activeAlbum.coverImage?.publicId === photo.publicId;
                        return (
                          <div
                            key={photo._id || photo.publicId}
                            className="group relative aspect-square rounded-xl overflow-hidden glass-panel border-[var(--border-subtle)]"
                          >
                            <img
                              src={photo.url}
                              alt="album asset"
                              className="w-full h-full object-cover"
                            />

                            {/* Cover Badge */}
                            {isCover && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6b2c] text-slate-950 flex items-center gap-1 shadow-md">
                                <Star className="w-3 h-3 fill-current" />
                                <span>Cover</span>
                              </div>
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteModal({
                                      open: true,
                                      type: 'photo',
                                      item: photo,
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white transition-colors"
                                  title="Delete Photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCover(photo.publicId)}
                                  className="w-full py-1 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-[10px] font-semibold text-white transition-colors"
                                >
                                  Set as Cover
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-subtle)] py-4 text-center">
                      No photos uploaded to this album yet. Use the upload box above.
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
                <Button variant="secondary" size="md" onClick={closePhotoManager}>
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl glass-panel p-6 border border-[var(--border-subtle)] shadow-2xl relative bg-[var(--dropdown-bg)]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] font-heading">
                    {deleteModal.type === 'album'
                      ? 'Delete Album & All Media?'
                      : 'Delete Photo?'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                    {deleteModal.type === 'album'
                      ? `Are you sure you want to delete "${deleteModal.item?.eventName}"? All photos associated with this album will be permanently deleted from Cloudinary storage and database.`
                      : 'Are you sure you want to delete this photo from the album and Cloudinary?'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeleteModal({ open: false, type: null, item: null })}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteConfirm}
                  isLoading={deleting}
                >
                  Confirm Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

