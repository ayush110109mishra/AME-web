import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  User,
  Mail,
  Hash,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  Shield,
  Save,
  Lock,
  Key,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile details state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    branch: user?.branch || 'Mechanical Engineering',
    year: String(user?.year || '1'),
    semester: String(user?.semester || '1'),
    mobile: user?.mobile || '',
  });

  const [errors, setErrors] = useState({});

  // Password state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passErrors, setPassErrors] = useState({});
  const [changingPass, setChangingPass] = useState(false);

  // Password strength meter
  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Za-z]/.test(pass) && /[0-9]/.test(pass)) score += 50;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(passData.newPassword);

  const getStrengthLabel = (score) => {
    if (score === 0) return { text: 'Empty', color: 'bg-slate-700' };
    if (score < 50) return { text: 'Weak', color: 'bg-rose-500' };
    if (score < 75) return { text: 'Medium', color: 'bg-amber-500' };
    return { text: 'Strong', color: 'bg-emerald-500' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassData((prev) => ({ ...prev, [name]: value }));
    if (passErrors[name]) {
      setPassErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name cannot be empty';
    if (!formData.college.trim()) errs.college = 'College cannot be empty';
    if (!formData.mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      errs.mobile = 'Mobile number must be exactly 10 digits';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = () => {
    const errs = {};
    if (!passData.currentPassword) {
      errs.currentPassword = 'Current password is required';
    }
    if (!passData.newPassword) {
      errs.newPassword = 'New password is required';
    } else if (passData.newPassword.length < 8) {
      errs.newPassword = 'Must be at least 8 characters long';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(passData.newPassword)) {
      errs.newPassword = 'Must contain at least one letter and one number';
    }

    if (passData.newPassword !== passData.confirmNewPassword) {
      errs.confirmNewPassword = 'New passwords do not match';
    }

    setPassErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await updateProfile({
        name: formData.name,
        college: formData.college,
        branch: formData.branch?.trim() || 'Mechanical Engineering',
        year: Number(formData.year),
        semester: Number(formData.semester),
        mobile: formData.mobile,
      });
    } catch (err) {
      // Toast handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setChangingPass(true);
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      toast.success(response.data.message || 'Password changed successfully!');
      setPassData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setPassErrors({});
    } catch (err) {
      const serverMsg =
        err.response?.data?.message || 'Failed to change password';
      toast.error(serverMsg);

      if (serverMsg.toLowerCase().includes('current password')) {
        setPassErrors((prev) => ({
          ...prev,
          currentPassword: 'Incorrect current password',
        }));
      } else if (serverMsg.toLowerCase().includes('same as your current')) {
        setPassErrors((prev) => ({
          ...prev,
          newPassword: serverMsg,
        }));
      }
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-grid-pattern">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal credentials, contact info, and security credentials.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <CheckCircle className="w-3.5 h-3.5" />
          <span className="uppercase">{user?.role} Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Summary Card */}
        <div className="space-y-6">
          <GlassCard className="p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#ff6b2c] to-[#ffb020] text-slate-950 font-bold text-2xl flex items-center justify-center shadow-xl shadow-[#ff6b2c]/20">
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#0a0e1a] border border-white/10 text-[#ff8c2b]">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                {user?.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Roll No: {user?.rollNo}
              </p>
            </div>

            <div className="w-full pt-4 border-t border-white/10 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Department</span>
                <span className="text-slate-200 font-medium">
                  {user?.branch}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Current Year</span>
                <span className="text-slate-200 font-medium">
                  Year {user?.year}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Semester</span>
                <span className="text-slate-200 font-medium">
                  Sem {user?.semester}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 rounded-2xl border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ff8c2b]">
              <ShieldAlert className="w-4 h-4" />
              <span>Security Advisory</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Keep your credentials confidential. Avoid sharing your password or roll number with other members.
            </p>
          </GlassCard>
        </div>

        {/* Right Form Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editable Personal Details */}
          <GlassCard className="p-6 sm:p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>Personal & Academic Details</span>
              <span className="text-xs text-slate-400 font-normal">
                (Saved to database)
              </span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  icon={User}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />

                <Input
                  label="Branch / Department"
                  name="branch"
                  icon={Layers}
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g. Mechanical Engineering"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number"
                  name="mobile"
                  icon={Phone}
                  value={formData.mobile}
                  onChange={handleChange}
                  error={errors.mobile}
                  maxLength={10}
                  required
                />

                <Input
                  label="College / Institute"
                  name="college"
                  icon={Building}
                  value={formData.college}
                  onChange={handleChange}
                  error={errors.college}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Current Year"
                  name="year"
                  icon={GraduationCap}
                  value={formData.year}
                  onChange={handleChange}
                  options={[
                    { value: '1', label: '1st Year' },
                    { value: '2', label: '2nd Year' },
                    { value: '3', label: '3rd Year' },
                    { value: '4', label: '4th Year' },
                  ]}
                  required
                />

                <Select
                  label="Current Semester"
                  name="semester"
                  icon={Calendar}
                  value={formData.semester}
                  onChange={handleChange}
                  options={[
                    { value: '1', label: 'Semester 1' },
                    { value: '2', label: 'Semester 2' },
                    { value: '3', label: 'Semester 3' },
                    { value: '4', label: 'Semester 4' },
                    { value: '5', label: 'Semester 5' },
                    { value: '6', label: 'Semester 6' },
                    { value: '7', label: 'Semester 7' },
                    { value: '8', label: 'Semester 8' },
                  ]}
                  required
                />
              </div>

              {/* Locked System Fields */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Immutable System Records</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-70">
                  <Input
                    label="Official Email"
                    name="email"
                    icon={Mail}
                    value={user?.email || ''}
                    disabled
                  />
                  <Input
                    label="Assigned Roll Number"
                    name="rollNo"
                    icon={Hash}
                    value={user?.rollNo || ''}
                    disabled
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  isLoading={loading}
                  size="md"
                  icon={Save}
                  className="px-6"
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </GlassCard>

          {/* Change Password Card */}
          <GlassCard className="p-6 sm:p-8 rounded-2xl border-white/10">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-[#ff8c2b]" />
                <span>Change Password</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Password must be at least 8 characters long and contain both letters and numbers.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={passData.currentPassword}
                onChange={handlePassChange}
                error={passErrors.currentPassword}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  placeholder="Min. 8 characters"
                  icon={Key}
                  value={passData.newPassword}
                  onChange={handlePassChange}
                  error={passErrors.newPassword}
                  required
                />

                <Input
                  label="Confirm New Password"
                  name="confirmNewPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  icon={Lock}
                  value={passData.confirmNewPassword}
                  onChange={handlePassChange}
                  error={passErrors.confirmNewPassword}
                  required
                />
              </div>

              {/* Password strength indicator */}
              {passData.newPassword && (
                <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password Strength</span>
                    <span className="font-semibold text-slate-200">
                      {getStrengthLabel(passwordStrength).text}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        getStrengthLabel(passwordStrength).color
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  isLoading={changingPass}
                  size="md"
                  icon={Key}
                  className="px-6"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
