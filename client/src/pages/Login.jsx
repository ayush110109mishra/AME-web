import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  Lock,
  ArrowRight,
  Cog,
  Wrench,
  Shield,
  Sparkles,
} from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errs = {};
    if (!identifier.trim()) {
      errs.identifier = 'Email or Roll number is required';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err) {
      // Handled by toast in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center p-3.5 sm:p-6 lg:p-8 bg-grid-pattern relative overflow-hidden">
      {/* Glow Blobs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#ff6b2c]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ffb020]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch z-10">
        {/* Left Branding Panel (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 rounded-3xl glass-panel border-[var(--border-subtle)] relative overflow-hidden bg-[var(--bg-surface-solid)]">
          <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
            <Cog className="w-80 h-80 text-[var(--text-main)] animate-spin-slow" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b2c]/15 text-[#ff8c2b] border border-[#ff6b2c]/30 text-xs font-mono mb-6">
              <Wrench className="w-3.5 h-3.5" />
              <span>MEMBER AUTHENTICATION</span>
            </div>

            <h1 className="text-3xl font-extrabold text-[var(--text-main)] leading-tight font-heading">
              Powering the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b2c] via-[#ff8c2b] to-[#ffb020]">
                Engineering Spirit.
              </span>
            </h1>

            <p className="mt-4 text-sm text-[var(--text-muted)] leading-relaxed">
              Sign in to manage your club portfolio, register for upcoming design competitions, and explore student updates.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
              <Sparkles className="w-4 h-4 text-[#ffb020]" />
              <span>Single Sign-On Convenience</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Use either your registered college email or your department Roll Number.
            </p>
          </div>

          <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-subtle)]">
            <span>Association of Mechanical Engineering</span>
            <Shield className="w-4 h-4 text-[var(--text-subtle)]" />
          </div>
        </div>

        {/* Right Login Card */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <GlassCard className="p-6 sm:p-10 rounded-3xl border-[var(--border-subtle)] shadow-2xl relative">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
                Welcome back 👋
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Enter your credentials to access your student dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email or Roll Number"
                name="identifier"
                placeholder="e.g. rahul@dtu.ac.in or ME2024001"
                icon={UserCheck}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: null }));
                }}
                error={errors.identifier}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                error={errors.password}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full"
                  size="lg"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-5 border-t border-[var(--border-subtle)] text-center">
              <p className="text-xs text-[var(--text-muted)]">
                Don’t have an account yet?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-[#ff8c2b] hover:text-[#ffb020] transition-colors ml-1"
                >
                  Join AME today
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
