import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrentUser } from '../lib/types';
import * as api from '../lib/api';

interface AuthContextType {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<CurrentUser | null>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 로드 시 저장된 사용자 확인
    const currentUser = api.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);

    // 뉴비 → 일반 자동 승급 체크 (가입 후 2개월 경과 시)
    api.checkAndUpgradeNewbies();
  }, []);

  const login = async (email: string, password: string): Promise<CurrentUser | null> => {
    const loggedInUser = api.login(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return loggedInUser;
    }
    return null;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const refreshUser = () => {
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      // 최신 회원 정보로 업데이트
      const member = api.getMemberById(currentUser.id);
      if (member) {
        const { password: _, ...updatedUser } = member;
        setUser(updatedUser);
        localStorage.setItem('zlsu_current_user', JSON.stringify(updatedUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
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
