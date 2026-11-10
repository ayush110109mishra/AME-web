import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ame_token'));
  const [loading, setLoading] = useState(true);

  // Restore session from token on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('ame_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.data?.user) {
          setUser(response.data.data.user);
        } else {
          localStorage.removeItem('ame_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session restore failed:', err.message);
        localStorage.removeItem('ame_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // Listen for axios 401 auto logout
    const handleAutoLogout = () => {
      setUser(null);
      setToken(null);
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('ame_auth_logout', handleAutoLogout);
    return () => {
      window.removeEventListener('ame_auth_logout', handleAutoLogout);
    };
  }, []);

  // Login handler
  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { token: receivedToken, user: receivedUser } = response.data.data;

      localStorage.setItem('ame_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      toast.success(`Welcome back, ${receivedUser.name}!`);
      return receivedUser;
    } catch (error) {
      let msg = 'Login failed. Please check credentials.';
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        msg = import.meta.env.DEV
          ? 'Cannot connect to backend server. Make sure server is running on port 5000.'
          : 'Cannot connect to backend server. Please check backend URL and server status.';
      }
      toast.error(msg);
      throw error;
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: receivedToken, user: receivedUser } = response.data.data;

      localStorage.setItem('ame_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      toast.success('Registration successful! Welcome to AME.');
      return receivedUser;
    } catch (error) {
      let msg = error.response?.data?.message;
      if (!msg) {
        if (error.code === 'ERR_NETWORK' || !error.response) {
          msg = import.meta.env.DEV
            ? 'Cannot connect to backend server. Make sure server is running on port 5000.'
            : 'Cannot connect to backend server. Please check backend URL and server status.';
        } else {
          msg = 'Registration failed. Please check your inputs.';
        }
      }
      toast.error(msg);
      throw error;
    }
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
      throw error;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('ame_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

