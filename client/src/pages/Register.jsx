import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Lock,
  GraduationCap,
  Building,
  Layers,
  Calendar,
  Hash,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Cog,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    rollNo: '',
    college: '',
    branch: 'Mechanical Engineering',
    year: '1',
    semester: '1',
  });

  const [errors, setErrors] = useState({});

  // Password strength calculator
  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const getStrengthLabel = (score) => {
    if (score === 0) return { text: 'Empty', color: 'bg-slate-700' };
    if (score <= 25) return { text: 'Weak', color: 'bg-rose-500' };
    if (score <= 50) return { text: 'Fair', color: 'bg-amber-500' };
    if (score <= 75) return { text: 'Good', color: 'bg-sky-500' };
    return { text: 'Strong', color: 'bg-emerald-500' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      errs.mobile = 'Must be exactly 10 digits';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.rollNo.trim()) errs.rollNo = 'Roll number is required';
    if (!formData.college.trim()) errs.college = 'College/University name is required';
    if (!formData.year) errs.year = 'Please select your study year';
    if (!formData.semester) errs.semester = 'Please select your semester';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      await register({
        name: formData.name,
        rollNo: formData.rollNo,
        college: formData.college,
        branch: formData.branch,
        year: Number(formData.year),
        semester: Number(formData.semester),
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      });
      navigate('/');
    } catch (err) {
      // Backend error toast already displayed by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-grid-pattern relative overflow-hidden">
      {/* Background Soft Glow Blobs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#ff6b2c]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#ffb020]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch z-10">
        {/* Left Branding Panel (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 rounded-3xl glass-panel border-white/10 relative overflow-hidden bg-gradient-to-b from-[#0f172a]/90 via-[#0a0e1a]/90 to-[#0a0e1a]/95">
          {/* Subtle Background Gears Animation */}
          <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none">
            <Cog className="w-72 h-72 text-white animate-spin-slow" />
          </div>
          <div className="absolute -left-12 bottom-12 opacity-5 pointer-events-none">
            <Cog className="w-48 h-48 text-[#ff6b2c] animate-spin-reverse-slow" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b2c]/15 text-[#ff8c2b] border border-[#ff6b2c]/30 text-xs font-mono mb-6">
              <Wrench className="w-3.5 h-3.5" />
              <span>OFFICIAL STUDENT PORTAL</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white leading-tight font-heading">
              Engineered for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b2c] via-[#ff8c2b] to-[#ffb020]">
                Tomorrow’s Pioneers.
              </span>
            </h1>

            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Join the Association of Mechanical Engineering (AME). Access exclusive technical workshops, research symposia, industrial visits, and a passionate student network.
            </p>
          </div>

          {/* Features highlight */}
          <div className="space-y-4 my-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ff6b2c]/20 text-[#ff8c2b] flex items-center justify-center shrink-0 border border-[#ff6b2c]/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Verified Member Access</h4>
                <p className="text-[11px] text-slate-400">Exclusive entry to club hackathons and labs.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffb020]/20 text-[#ffb020] flex items-center justify-center shrink-0 border border-[#ffb020]/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Department Archive</h4>
                <p className="text-[11px] text-slate-400">Curated study guides, research papers & notes.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Mechanical Dept. Club</span>
            <span className="font-mono text-[#ff8c2b]">EST. 2024</span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 sm:p-8 rounded-3xl border-white/10 shadow-2xl relative">
            {/* Header & Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white font-heading">
                    Create Member Account
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {step === 1
                      ? 'Step 1: Enter your personal and security credentials'
                      : 'Step 2: Enter your academic enrollment details'}
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[#ff8c2b]">
                  {step} / 2
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[#ff6b2c] to-[#ffb020] h-full"
                  initial={{ width: '50%' }}
                  animate={{ width: step === 1 ? '50%' : '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <Input
                      label="Full Name"
                      name="name"
                      placeholder="e.g. Rahul Sharma"
                      icon={User}
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="you@domain.edu"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                      />

                      <Input
                        label="Mobile Number (10 digits)"
                        name="mobile"
                        type="tel"
                        placeholder="9876543210"
                        icon={Phone}
                        value={formData.mobile}
                        onChange={handleChange}
                        error={errors.mobile}
                        maxLength={10}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        required
                      />

                      <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        required
                      />
                    </div>

                    {/* Password Strength Meter */}
                    {formData.password && (
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

                    <div className="pt-2">
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="w-full"
                        size="lg"
                      >
                        <span>Continue to Academic Details</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Roll Number"
                        name="rollNo"
                        placeholder="e.g. ME2024045"
                        icon={Hash}
                        value={formData.rollNo}
                        onChange={handleChange}
                        error={errors.rollNo}
                        required
                      />

                      <Input
                        label="Branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        icon={Layers}
                        disabled
                        className="opacity-80"
                      />
                    </div>

                    <Input
                      label="College / Institute Name"
                      name="college"
                      placeholder="e.g. Delhi Technological University"
                      icon={Building}
                      value={formData.college}
                      onChange={handleChange}
                      error={errors.college}
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Current Year"
                        name="year"
                        icon={GraduationCap}
                        value={formData.year}
                        onChange={handleChange}
                        error={errors.year}
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
                        error={errors.semester}
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

                    <div className="pt-2 flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setStep(1)}
                        className="px-4"
                        size="lg"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        <span>Back</span>
                      </Button>

                      <Button
                        type="submit"
                        isLoading={loading}
                        className="flex-1"
                        size="lg"
                      >
                        <span>Complete Registration</span>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Footer link to Login */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400">
                Already registered with AME?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#ff8c2b] hover:text-[#ffb020] transition-colors ml-1"
                >
                  Sign In here
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
