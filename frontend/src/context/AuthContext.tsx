import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { UserDto } from '@wecode/shared';
import { api } from '../services/api';

interface AuthContextValue {
  user: UserDto | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserDto>;
  register: (email: string, password: string, fullName: string) => Promise<UserDto>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.onUnauthorized(() => setUser(null));

    if (!api.getToken()) {
      setIsLoading(false);
      return;
    }

    api
      .getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const nextUser = await api.login(email, password);
    setUser(nextUser);
    return nextUser;
  };

  const register = async (email: string, password: string, fullName: string) => {
    const nextUser = await api.register(email, password, fullName);
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
