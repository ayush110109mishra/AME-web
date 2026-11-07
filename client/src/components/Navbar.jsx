import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Menu,
  X,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Cog,
  Home,
  Image,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Gallery', path: '/gallery', icon: Image },
    { name: 'Announcements', path: '/announcements', icon: Bell },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[var(--border-subtle)] bg-[var(--nav-bg)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b2c] to-[#ffb020] p-[1.5px] shadow-lg shadow-[#ff6b2c]/20 group-hover:shadow-[#ff6b2c]/40 transition-shadow">
              <div className="w-full h-full bg-[var(--bg-main)] rounded-[10px] flex items-center justify-center">
                <Cog className="w-6 h-6 text-[#ff8c2b] group-hover:rotate-45 transition-transform duration-500 ease-out" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl tracking-wider text-[var(--text-main)]">
                  AME
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#ff6b2c]/15 text-[#ff8c2b] border border-[#ff6b2c]/30">
                  MECH
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-subtle)] font-medium tracking-tight -mt-0.5 hidden sm:block">
                Association of Mechanical Engineering
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Logged-in users only) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--text-main)] bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] font-semibold shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[var(--text-subtle)]" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Desktop Actions Section */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4 text-[#ffb020]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4 text-[#ff6b2c]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full glass-panel hover:border-[#ff6b2c]/40 transition-colors cursor-pointer focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff6b2c] to-[#ffb020] text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm">
                    {getInitials(user?.name)}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-[var(--text-main)] line-clamp-1 max-w-[120px]">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-subtle)] uppercase tracking-wider font-mono">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl border border-[var(--border-subtle)] py-1.5 z-50 bg-[var(--dropdown-bg)] backdrop-blur-2xl"
                    >
                      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                        <p className="text-xs font-semibold text-[var(--text-main)] truncate">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {user?.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#ff6b2c]/10 text-[#ff8c2b] border border-[#ff6b2c]/20">
                          Roll: {user?.rollNo}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                        >
                          <User className="w-4 h-4 text-[var(--text-subtle)]" />
                          <span>My Profile</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#ff8c2b] hover:bg-[#ff6b2c]/10 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-[#ff8c2b]" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-[var(--border-subtle)] pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#ff6b2c] to-[#ffb020] text-slate-950 hover:brightness-105 transition-all shadow-md shadow-[#ff6b2c]/20"
                >
                  Join AME
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions: Theme toggle + Hamburger */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] focus:outline-none"
              aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#ffb020]" />
              ) : (
                <Moon className="w-4 h-4 text-[#ff6b2c]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--dropdown-bg)] backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3"
          >
            {isAuthenticated && (
              <div className="p-3 rounded-xl glass-panel flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff6b2c] to-[#ffb020] text-slate-950 font-bold text-sm flex items-center justify-center">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-main)]">{user?.name}</p>
                  <p className="text-xs text-[var(--text-subtle)]">
                    Roll: {user?.rollNo} · {user?.role}
                  </p>
                </div>
              </div>
            )}

            {isAuthenticated ? (
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-[var(--text-main)] bg-[var(--bg-surface-hover)] font-semibold'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[var(--text-subtle)]" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  <User className="w-4 h-4 text-[var(--text-subtle)]" />
                  <span>My Profile</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#ff8c2b] bg-[#ff6b2c]/10 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-[var(--text-main)] glass-panel hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full py-2.5 rounded-xl text-center text-sm font-bold bg-gradient-to-r from-[#ff6b2c] to-[#ffb020] text-slate-950 shadow-lg shadow-[#ff6b2c]/20 hover:brightness-105 transition-all"
                >
                  Join AME
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
