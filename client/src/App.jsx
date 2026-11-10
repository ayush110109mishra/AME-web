/* Crafted by Ayush Mishra */
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Lazy-loaded route chunks for mobile performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Gallery = lazy(() => import('./pages/Gallery'));
const AlbumDetail = lazy(() => import('./pages/AlbumDetail'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Students = lazy(() => import('./pages/admin/Students'));
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'));
const AdminGallery = lazy(() => import('./pages/admin/Gallery'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div className="min-h-[50dvh] flex items-center justify-center">
      <div className="w-9 h-9 rounded-full border-2 border-[#ff6b2c]/20 border-t-[#ff6b2c] animate-spin" />
    </div>
  );
}

// Public Route wrapper that redirects logged-in users away from /login & /register
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[var(--bg-main)] flex items-center justify-center">
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
          <div className="min-h-[100dvh] bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans selection:bg-[#ff6b2c]/30 selection:text-white transition-colors duration-200">
            <Navbar />

            <main className="flex-1">
              <Suspense fallback={<PageFallback />}>
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
                  <Route
                    path="/gallery/:id"
                    element={
                      <ProtectedRoute>
                        <AlbumDetail />
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
                  <Route
                    path="/admin/announcements"
                    element={
                      <AdminRoute>
                        <AdminAnnouncements />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/gallery"
                    element={
                      <AdminRoute>
                        <AdminGallery />
                      </AdminRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>

            {/* Standard Footer */}
            <Footer />

            {/* Theme-Adaptive Toast notifications */}
            <Toaster
              position="top-center"
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
                  maxWidth: '92vw',
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
