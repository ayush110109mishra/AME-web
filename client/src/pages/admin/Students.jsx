import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  AlertTriangle,
  ArrowLeft,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';

export default function Students() {
  const { user: currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Role change modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [targetRole, setTargetRole] = useState('student');
  const [updatingRole, setUpdatingRole] = useState(false);

  const fetchStudents = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      try {
        const params = {
          page: pageToLoad,
          limit: 10,
        };
        if (search.trim()) params.search = search.trim();
        if (year) params.year = year;
        if (semester) params.semester = semester;
        if (roleFilter) params.role = roleFilter;

        const response = await api.get('/admin/students', { params });
        if (response.data && response.data.data) {
          setStudents(response.data.data.students);
          setPagination(response.data.data.pagination);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    },
    [search, year, semester, roleFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/admin/students/export', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `ame_students_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Member database exported to CSV successfully');
    } catch (err) {
      toast.error('Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setYear('');
    setSemester('');
    setRoleFilter('');
  };

  // Open Role Change Confirmation Modal
  const openRoleModal = (student, newRole) => {
    setSelectedStudent(student);
    setTargetRole(newRole);
    setModalOpen(true);
  };

  const closeRoleModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
    setTargetRole('student');
  };

  // Execute Role Update via API
  const handleRoleChangeConfirm = async () => {
    if (!selectedStudent) return;
    setUpdatingRole(true);
    try {
      const response = await api.put(
        `/admin/students/${selectedStudent._id}/role`,
        { role: targetRole }
      );

      toast.success(
        response.data?.message ||
          `Role updated to ${targetRole.toUpperCase()} successfully`
      );

      // Update student row in local state without full reload
      setStudents((prev) =>
        prev.map((s) =>
          s._id === selectedStudent._id ? { ...s, role: targetRole } : s
        )
      );

      closeRoleModal();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to update member role'
      );
    } finally {
      setUpdatingRole(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-grid-pattern">
      {/* Header and Actions */}
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
            Student & Member Directory
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Browse registered mechanical engineering undergraduates and manage roles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchStudents(pagination.page)}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            isLoading={exporting}
            icon={Download}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 sm:p-5 rounded-2xl border-[var(--border-subtle)] space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-subtle)]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, roll number, or email..."
              className="w-full rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm glass-input transition-all"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-auto text-xs rounded-xl px-3 py-2.5 glass-input border border-[var(--border-input)] bg-[var(--bg-surface-solid)] text-[var(--text-main)] cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          {/* Year Filter */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full md:w-auto text-xs rounded-xl px-3 py-2.5 glass-input border border-[var(--border-input)] bg-[var(--bg-surface-solid)] text-[var(--text-main)] cursor-pointer"
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          {/* Semester Filter */}
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full md:w-auto text-xs rounded-xl px-3 py-2.5 glass-input border border-[var(--border-input)] bg-[var(--bg-surface-solid)] text-[var(--text-main)] cursor-pointer"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>

          {(search || year || semester || roleFilter) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-500 hover:text-rose-400 px-2 py-1 font-medium transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </GlassCard>

      {/* Data Table */}
      <GlassCard className="rounded-2xl overflow-hidden border-[var(--border-subtle)] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-main)]">
            <thead className="bg-[var(--bg-surface-solid)] text-[11px] uppercase tracking-wider font-semibold text-[var(--text-subtle)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-5 py-4">Member</th>
                <th className="px-5 py-4">Roll Number</th>
                <th className="px-5 py-4">Year & Sem</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading && students.length === 0 ? (
                // 5 Skeleton rows for loading state
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton width="36px" height="36px" rounded="rounded-xl" />
                        <div className="space-y-1.5">
                          <Skeleton width="120px" height="16px" />
                          <Skeleton width="80px" height="12px" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton width="80px" height="20px" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton width="60px" height="20px" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton width="70px" height="24px" rounded="rounded-full" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        <Skeleton width="130px" height="14px" />
                        <Skeleton width="90px" height="12px" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Skeleton width="90px" height="28px" rounded="rounded-xl" className="ml-auto" />
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-[var(--text-muted)]"
                  >
                    <Users className="w-8 h-8 mx-auto mb-2 text-[var(--text-subtle)]" />
                    <p className="font-medium text-[var(--text-main)]">
                      No members matched criteria
                    </p>
                    <p className="text-xs text-[var(--text-subtle)] mt-1">
                      Try adjusting your search query or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const isSelf = currentUser?._id === student._id;
                  const isAdminUser = student.role === 'admin';

                  return (
                    <tr
                      key={student._id}
                      className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                              isAdminUser
                                ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                                : 'bg-[#ff6b2c]/15 text-[#ff8c2b] border-[#ff6b2c]/30'
                            }`}
                          >
                            {student.name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-[var(--text-main)]">
                                {student.name}
                              </p>
                              {isSelf && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-solid)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-subtle)]">
                              {student.branch}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] text-[#ff8c2b]">
                          {student.rollNo}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-medium">
                            Y{student.year}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-medium">
                            S{student.semester}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {isAdminUser ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            <ShieldCheck className="w-3 h-3 text-amber-500" />
                            <span>ADMIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--bg-surface-solid)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                            <GraduationCap className="w-3 h-3 text-[var(--text-subtle)]" />
                            <span>STUDENT</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 text-[var(--text-main)]">
                            <Mail className="w-3 h-3 text-[var(--text-subtle)]" />
                            <span className="truncate max-w-[150px]">
                              {student.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                            <Phone className="w-3 h-3 text-[var(--text-subtle)]" />
                            <span>{student.mobile}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isSelf ? (
                          <span className="text-xs text-[var(--text-subtle)] font-mono italic">
                            Current User
                          </span>
                        ) : isAdminUser ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => openRoleModal(student, 'student')}
                            className="text-xs"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                            <span>Remove Admin</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleModal(student, 'admin')}
                            className="text-xs"
                          >
                            <Shield className="w-3.5 h-3.5 mr-1" />
                            <span>Make Admin</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div>
            Showing{' '}
            <span className="font-semibold text-[var(--text-main)]">
              {students.length > 0
                ? (pagination.page - 1) * pagination.limit + 1
                : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-[var(--text-main)]">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-[var(--text-main)]">
              {pagination.total}
            </span>{' '}
            records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStudents(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg glass-panel hover:bg-[var(--bg-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono">
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              onClick={() => fetchStudents(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || loading}
              className="p-1.5 rounded-lg glass-panel hover:bg-[var(--bg-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Role Change Confirmation Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl glass-panel p-6 border border-[var(--border-subtle)] shadow-2xl relative bg-[var(--dropdown-bg)]"
            >
              <button
                type="button"
                onClick={closeRoleModal}
                className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    targetRole === 'admin'
                      ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                  }`}
                >
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] font-heading">
                    {targetRole === 'admin'
                      ? 'Promote to Administrator'
                      : 'Demote to Student Member'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                    Are you sure you want to change role for{' '}
                    <strong className="text-[var(--text-main)] font-semibold">
                      {selectedStudent?.name}
                    </strong>{' '}
                    (Roll:{' '}
                    <span className="font-mono text-[#ff8c2b]">
                      {selectedStudent?.rollNo}
                    </span>
                    ) to{' '}
                    <span
                      className={`font-bold uppercase ${
                        targetRole === 'admin'
                          ? 'text-amber-500'
                          : 'text-sky-500'
                      }`}
                    >
                      {targetRole}
                    </span>
                    ?
                  </p>
                  <p className="text-[11px] text-[var(--text-subtle)] mt-2">
                    {targetRole === 'admin'
                      ? 'This member will receive full access to view and edit student roles.'
                      : 'This member will lose all administrator portal privileges immediately.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={closeRoleModal}
                  disabled={updatingRole}
                >
                  Cancel
                </Button>

                <Button
                  variant={targetRole === 'admin' ? 'primary' : 'danger'}
                  size="sm"
                  onClick={handleRoleChangeConfirm}
                  isLoading={updatingRole}
                >
                  {targetRole === 'admin' ? 'Confirm Promotion' : 'Confirm Demotion'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
