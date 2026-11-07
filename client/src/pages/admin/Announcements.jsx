import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Calendar,
  Tag,
  AlertTriangle,
  X,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Skeleton from '../../components/common/Skeleton';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    targetYear: '0',
  });
  const [errors, setErrors] = useState({});

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/announcements', {
        params: { limit: 50 },
      });
      if (response.data?.data) {
        setAnnouncements(response.data.data.announcements);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length > 120) {
      errs.title = 'Title cannot exceed 120 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required';
    } else if (formData.description.trim().length > 2000) {
      errs.description = 'Description cannot exceed 2000 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        targetYear: parseInt(formData.targetYear, 10),
      };

      if (editingId) {
        const response = await api.put(`/announcements/${editingId}`, payload);
        toast.success('Announcement updated successfully');
        setAnnouncements((prev) =>
          prev.map((item) =>
            item._id === editingId ? response.data.data : item
          )
        );
        resetForm();
      } else {
        const response = await api.post('/announcements', payload);
        toast.success('Announcement published successfully');
        setAnnouncements((prev) => [response.data.data, ...prev]);
        resetForm();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      targetYear: String(item.targetYear),
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'general',
      targetYear: '0',
    });
    setErrors({});
  };

  const openDeleteModal = (item) => {
    setAnnouncementToDelete(item);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setAnnouncementToDelete(null);
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/announcements/${announcementToDelete._id}`);
      toast.success('Announcement deleted successfully');
      setAnnouncements((prev) =>
        prev.filter((item) => item._id !== announcementToDelete._id)
      );
      closeDeleteModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete announcement');
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
            Manage Announcements & Circulars
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Publish, edit, and organize notices for specific student batches or the entire club.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchAnnouncements}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Form: Create or Edit Announcement */}
      <GlassCard className="p-6 sm:p-8 rounded-2xl border-[var(--border-subtle)] shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b2c]/15 text-[#ff8c2b] flex items-center justify-center">
              {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">
                {editingId ? 'Edit Announcement' : 'Publish New Announcement'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {editingId
                  ? 'Update existing notice details below'
                  : 'Broadcast circulars to students with batch targeting'}
              </p>
            </div>
          </div>

          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4 mr-1" />
              <span>Cancel Edit</span>
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Announcement Title"
            name="title"
            placeholder="e.g. Annual CAD Modeling Championship 2026 - Registration Open"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            maxLength={120}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={[
                { value: 'workshop', label: 'Workshop' },
                { value: 'seminar', label: 'Seminar' },
                { value: 'intro', label: 'Intro Session' },
                { value: 'general', label: 'General Notice' },
              ]}
              required
            />

            <Select
              label="Target Student Batch"
              name="targetYear"
              value={formData.targetYear}
              onChange={handleChange}
              options={[
                { value: '0', label: 'All Years (1st to 4th)' },
                { value: '1', label: '1st Year Students Only' },
                { value: '2', label: '2nd Year Students Only' },
                { value: '3', label: '3rd Year Students Only' },
                { value: '4', label: '4th Year Students Only' },
              ]}
              required
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Notice Content / Description <span className="text-[#ff6b2c]">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Provide full details, venue, dates, prerequisites, and registration links..."
              value={formData.description}
              onChange={handleChange}
              maxLength={2000}
              className={`w-full rounded-xl px-4 py-3 text-sm glass-input transition-all ${
                errors.description
                  ? 'border-rose-500/80 focus:border-rose-500'
                  : 'border-[var(--border-input)] hover:border-[var(--border-hover)]'
              }`}
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-rose-500">{errors.description}</p>
            ) : (
              <div className="flex justify-between text-[11px] text-[var(--text-subtle)] mt-1">
                <span>Supports multi-line descriptions and links</span>
                <span>{formData.description.length}/2000</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {editingId && (
              <Button variant="secondary" size="md" onClick={resetForm}>
                Discard Changes
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              icon={editingId ? Edit2 : Plus}
              className="px-6"
            >
              {editingId ? 'Update Announcement' : 'Publish Circular'}
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Announcements Table */}
      <GlassCard className="rounded-2xl overflow-hidden border-[var(--border-subtle)] shadow-2xl">
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--text-main)] font-heading">
            Live Announcements Directory ({announcements.length})
          </h3>
          <span className="text-xs font-mono text-[var(--text-subtle)]">
            Sorted latest first
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-main)]">
            <thead className="bg-[var(--bg-surface-solid)] text-[11px] uppercase tracking-wider font-semibold text-[var(--text-subtle)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-5 py-4">Title & Details</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Target Audience</th>
                <th className="px-5 py-4">Published Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading && announcements.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <Skeleton width="180px" height="18px" />
                      <Skeleton width="120px" height="12px" className="mt-1" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton width="70px" height="22px" rounded="rounded-full" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton width="80px" height="20px" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton width="90px" height="16px" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Skeleton width="80px" height="28px" className="ml-auto" />
                    </td>
                  </tr>
                ))
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)]">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-[var(--text-subtle)]" />
                    <p className="font-medium text-[var(--text-main)]">
                      No announcements published yet
                    </p>
                    <p className="text-xs text-[var(--text-subtle)] mt-1">
                      Use the form above to post your first club circular.
                    </p>
                  </td>
                </tr>
              ) : (
                announcements.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <td className="px-5 py-4 max-w-sm">
                      <p className="font-semibold text-[var(--text-main)] line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#ff6b2c]/15 text-[#ff8c2b] border border-[#ff6b2c]/30">
                        <Tag className="w-3 h-3" />
                        {item.category}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                        {item.targetYear === 0
                          ? 'All Years'
                          : `Year ${item.targetYear}`}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-[var(--text-subtle)]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(item)}
                          className="p-1.5"
                          title="Edit Announcement"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(item)}
                          className="p-1.5"
                          title="Delete Announcement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl glass-panel p-6 border border-[var(--border-subtle)] shadow-2xl relative bg-[var(--dropdown-bg)]"
            >
              <button
                type="button"
                onClick={closeDeleteModal}
                className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] font-heading">
                    Delete Announcement?
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                    Are you sure you want to delete{' '}
                    <strong className="text-[var(--text-main)]">
                      "{announcementToDelete?.title}"
                    </strong>
                    ? This action will permanently remove it from the student notice board.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
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

