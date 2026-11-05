import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  CheckCircle,
} from 'lucide-react';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    year: String(user?.year || '1'),
    semester: String(user?.semester || '1'),
    mobile: user?.mobile || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await updateProfile({
        name: formData.name,
        college: formData.college,
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-grid-pattern">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal and academic credentials within AME.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <CheckCircle className="w-3.5 h-3.5" />
          <span className="uppercase">{user?.role} Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Summary Card */}
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
              <span className="text-slate-200 font-medium">{user?.branch}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Current Year</span>
              <span className="text-slate-200 font-medium">Year {user?.year}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Semester</span>
              <span className="text-slate-200 font-medium">Sem {user?.semester}</span>
            </div>
          </div>
        </GlassCard>

        {/* Right Edit Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 sm:p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>Editable Details</span>
              <span className="text-xs text-slate-400 font-normal">
                (Changes reflect immediately)
              </span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

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
                  Save Changes
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

