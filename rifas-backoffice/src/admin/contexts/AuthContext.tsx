import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AdminUser, AdminLoginRequest, AdminLoginResponse } from '@/types';
import { API } from '@/constants/config';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loading: boolean;
  login: (credentials: AdminLoginRequest) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'rifa_admin_auth';
const USER_STORAGE_KEY = 'rifa_admin_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        // Verify token is still valid by calling /admin/me endpoint
        // En desarrollo, siempre usar backend local (ignorar VITE_API_BASE_URL)
        const apiBaseUrl = import.meta.env.DEV 
          ? 'http://localhost:3001' 
          : (import.meta.env.VITE_API_BASE_URL || API.BASE_URL);
        const response = await fetch(`${apiBaseUrl}/admin/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setIsAuthenticated(true);
            setUser(data.user);
            // Update stored user data
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          // Token invalid, clear storage
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: AdminLoginRequest): Promise<boolean> => {
    try {
      // En desarrollo, siempre usar backend local (ignorar VITE_API_BASE_URL)
      const apiBaseUrl = import.meta.env.DEV 
        ? 'http://localhost:3001' 
        : (import.meta.env.VITE_API_BASE_URL || API.BASE_URL);
      console.log('🔐 Attempting login to:', apiBaseUrl);
      const response = await fetch(`${apiBaseUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: AdminLoginResponse = await response.json();

      if (data.success && data.user && data.token) {
        setIsAuthenticated(true);
        setUser(data.user);
        localStorage.setItem(AUTH_STORAGE_KEY, data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        return true;
      } else {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

