import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = authService.getCurrentUser();
    setUser(session);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const loggedUser = await authService.login(email, password);
    setIsNewUser(false);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const newUser = await authService.register(userData);
    setIsNewUser(true);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    authService.logout();
    setIsNewUser(false);
    setUser(null);
  };

  const switchAccount = (demoUser) => {
    localStorage.setItem('seenta_session', JSON.stringify(demoUser));
    setIsNewUser(false);
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isNewUser,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
