import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getUser());
  const [token, setToken] = useState<string | null>(() => authService.getToken());

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    authService.setToken(response.token);
    authService.setUser(response.user);
    setUser(response.user);
    setToken(response.token);
  };

  const signup = async (email: string, password: string, name: string) => {
    const response = await authService.signup(email, password, name);
    authService.setToken(response.token);
    authService.setUser(response.user);
    setUser(response.user);
    setToken(response.token);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
