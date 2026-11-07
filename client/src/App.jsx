/* Crafted by Ayush Mishra */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Announcements from './pages/Announcements';
import Gallery from './pages/Gallery';
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import NotFound from './pages/NotFound';

// Public Route wrapper that redirects logged-in users away from /login & /register
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#ff6b2c]/20 border-t-[#ff6b2c] animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans selection:bg-[#ff6b2c]/30 selection:text-white transition-colors duration-200">
            <Navbar />

            <main className="flex-1">
              <Routes>
                {/* Public Auth Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />

                {/* Protected Member Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/announcements"
                  element={
                    <ProtectedRoute>
                      <Announcements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gallery"
                  element={
                    <ProtectedRoute>
                      <Gallery />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/students"
                  element={
                    <AdminRoute>
                      <Students />
                    </AdminRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Standard Footer */}
            <Footer />

            {/* Theme-Adaptive Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-surface-solid)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '14px',
                  fontSize: '13px',
                  boxShadow: 'var(--card-shadow)',
                },
                success: {
                  iconTheme: {
                    primary: '#ff8c2b',
                    secondary: 'var(--bg-main)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#f43f5e',
                    secondary: 'var(--bg-main)',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
