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
    const response = await authApi.login(credentials);
    const data = response.data;
    
    const userData = {
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role
    };
    
    setToken(data.token);
    setUser(userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const response = await authApi.register(data);
    const resData = response.data;
    
    const userData = {
      id: resData.userId,
      name: resData.name,
      email: resData.email,
      role: resData.role
    };
    
    setToken(resData.token);
    setUser(userData);
    localStorage.setItem('token', resData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
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