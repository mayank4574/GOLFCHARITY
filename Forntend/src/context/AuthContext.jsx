import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, re-hydrate user from token
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const { data } = await getMe();
          setUser(data.user);
          setSubscription(data.subscription);
        } catch {
          // Token expired or invalid — clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = (userData, tokenValue, subscriptionData) => {
    setUser(userData);
    setToken(tokenValue);
    setSubscription(subscriptionData || null);
    localStorage.setItem('token', tokenValue);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSubscription(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser) => setUser(updatedUser);
  const updateSubscription = (sub) => setSubscription(sub);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!token && !!user;
  const hasActiveSubscription = subscription?.status === 'active';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        subscription,
        loading,
        isAuthenticated,
        isAdmin,
        hasActiveSubscription,
        login,
        logout,
        updateUser,
        updateSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
