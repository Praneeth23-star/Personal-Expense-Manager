
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  loginApi,
  registerApi,
  getMeApi,
  updateMeApi,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      const savedToken = localStorage.getItem('token');

      if (!savedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const res = await getMeApi();
        if (cancelled) return;

        const userData = res?.data?.data;

        if (!userData) {
          throw new Error('Invalid user session');
        }

        setToken(savedToken);
        setUser(userData);
      } catch (error) {
        if (cancelled) return;

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener(
        'auth:session-expired',
        handleSessionExpired
      );
    };
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    const responseData = res?.data?.data;

    if (!responseData?.token) {
      throw new Error('Login response did not contain a token');
    }

    const { token: newToken, ...userData } = responseData;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);

    return res.data;
  };

  const loginAsDemo = () =>
    login('demo@expensemanager.com', 'password123');

  const register = async (name, email, password, currency) => {
    const res = await registerApi(name, email, password, currency);
    const responseData = res?.data?.data;

    if (!responseData?.token) {
      throw new Error('Registration response did not contain a token');
    }

    const { token: newToken, ...userData } = responseData;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);

    return res.data;
  };

  const updateProfile = async (data) => {
    const res = await updateMeApi(data);
    setUser((prev) => ({ ...prev, ...res.data.data }));
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        loginAsDemo,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
