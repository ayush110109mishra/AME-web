import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#ff6b2c]/20 border-t-[#ff6b2c] animate-spin" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest text-[var(--text-subtle)]">
          Checking Admin Privileges...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl text-center border-rose-500/20 shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">Access Denied</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            You need administrator credentials to view this page.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
}
