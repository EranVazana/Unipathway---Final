import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { usersService } from '../services/usersService';

const STORAGE_KEY = 'unipathway_user';

const AuthContext = createContext(null);

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
}

function readStoredUser() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    applyTheme(user?.theme);

  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    const fullUser = await usersService.getCurrentUser();
    setUser(fullUser);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fullUser));
    applyTheme(fullUser?.theme);
    return fullUser;
  }, []);

  const register = useCallback(async (firstName, lastName, username, email, password) => {
    const data = await authService.register(firstName, lastName, username, email, password);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    const fullUser = await usersService.getCurrentUser();
    setUser(fullUser);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fullUser));
    applyTheme(fullUser?.theme);
    return fullUser;
  }, []);


  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (partial.theme) applyTheme(next.theme);
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      sessionStorage.removeItem(STORAGE_KEY);
      applyTheme('light'); 
    }
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    register,
    updateUser,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}