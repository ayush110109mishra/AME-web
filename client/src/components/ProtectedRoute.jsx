import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-[#ff6b2c]/20 border-t-[#ff6b2c] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#ffb020] animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-xs font-mono uppercase tracking-widest text-slate-400">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
