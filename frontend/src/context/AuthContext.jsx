import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    // MOCK LOGIN FOR DEVELOPMENT
    console.warn('Using MOCK authentication');
    
    // Determine role based on email for testing different dashboards
    let role = ROLES.CITIZEN;
    if (credentials.email.includes('admin')) role = ROLES.ADMINISTRATOR;
    if (credentials.email.includes('volunteer')) role = ROLES.VOLUNTEER;
    if (credentials.email.includes('donor')) role = ROLES.DONOR;

    const mockUser = {
      id: 1,
      name: 'Test User',
      email: credentials.email,
      role: role
    };
    
    setToken('mock-jwt-token-123');
    setUser(mockUser);
    localStorage.setItem('token', 'mock-jwt-token-123');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUser;
  }, []);

  const register = useCallback(async (data) => {
    // MOCK REGISTER FOR DEVELOPMENT
    console.warn('Using MOCK authentication');
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const hasRole = useCallback((...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated,
    ROLES,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}