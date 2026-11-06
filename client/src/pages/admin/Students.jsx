import { useState, useEffect, useCallback } from 'react';
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
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';

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

      toast.success('Directory exported to CSV!');
    } catch (err) {
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const openRoleModal = (student, newRole) => {
    setSelectedStudent(student);
    setTargetRole(newRole);
    setModalOpen(true);
  };

  const closeRoleModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };

  const handleRoleChangeConfirm = async () => {
    if (!selectedStudent) return;
    setUpdatingRole(true);
    try {
      const response = await api.put(
        `/admin/students/${selectedStudent._id}/role`,
        { role: targetRole }
      );
      toast.success(
        response.data.message || `Role updated to ${targetRole} successfully!`
      );
      closeRoleModal();
      fetchStudents(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change user role');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setYear('');
    setSemester('');
    setRoleFilter('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-grid-pattern">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b2c]/15 text-[#ff8c2b] border border-[#ff6b2c]/30 text-xs font-mono mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>ROLE & MEMBER DIRECTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Student & Admin Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage member roles, assign administrative rights, and export records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => fetchStudents(pagination.page)}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleExportCSV}
            isLoading={exporting}
            icon={Download}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 rounded-2xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-xl border border-white/10"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 glass-input border border-white/10 bg-[#0f172a] text-slate-200 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>

          {/* Year Filter */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 glass-input border border-white/10 bg-[#0f172a] text-slate-200 cursor-pointer"
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
            className="text-xs rounded-xl px-3 py-2 glass-input border border-white/10 bg-[#0f172a] text-slate-200 cursor-pointer"
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
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 font-medium transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </GlassCard>

      {/* Data Table */}
      <GlassCard className="rounded-2xl overflow-hidden border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0f172a]/90 text-[11px] uppercase tracking-wider font-semibold text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-5 py-4">Member</th>
                <th className="px-5 py-4">Roll Number</th>
                <th className="px-5 py-4">Year & Sem</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && students.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full border-2 border-[#ff6b2c]/20 border-t-[#ff6b2c] animate-spin" />
                    <span>Loading member directory...</span>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-medium text-slate-300">
                      No members matched criteria
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
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
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                              isAdminUser
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
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
                              <p className="font-semibold text-white">
                                {student.name}
                              </p>
                              {isSelf && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {student.branch}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#ff8c2b]">
                          {student.rollNo}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-medium">
                            Y{student.year}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                            S{student.semester}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {isAdminUser ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            <span>ADMIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                            <GraduationCap className="w-3 h-3 text-slate-400" />
                            <span>STUDENT</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[150px]">
                              {student.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{student.mobile}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isSelf ? (
                          <span className="text-xs text-slate-500 font-mono italic">
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
        <div className="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-200">
              {students.length > 0
                ? (pagination.page - 1) * pagination.limit + 1
                : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-200">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-200">
              {pagination.total}
            </span>{' '}
            records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStudents(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg glass-panel hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
              className="p-1.5 rounded-lg glass-panel hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl glass-panel p-6 border border-white/10 shadow-2xl relative bg-[#0f172a]/95"
            >
              <button
                type="button"
                onClick={closeRoleModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    targetRole === 'admin'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {targetRole === 'admin'
                      ? 'Promote to Administrator'
                      : 'Demote to Student Member'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Are you sure you want to change role for{' '}
                    <strong className="text-white font-semibold">
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
                          ? 'text-amber-400'
                          : 'text-sky-400'
                      }`}
                    >
                      {targetRole}
                    </span>
                    ?
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {targetRole === 'admin'
                      ? 'This member will receive full access to view, edit student roles, and publish announcements.'
                      : 'This member will lose all administrator portal privileges immediately.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
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
