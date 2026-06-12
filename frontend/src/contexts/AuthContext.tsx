"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  clearToken,
  getToken,
  login as apiLogin,
  logout as apiLogout,
  setToken,
  signup as apiSignup,
} from "@/lib/api";
import type { User } from "@/lib/types";

const USER_KEY = "apc_user";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const userRaw = localStorage.getItem(USER_KEY);

    if (storedToken && userRaw) {
      try {
        // Hydrate from localStorage after mount to avoid SSR/client mismatch.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only hydration
        setTokenState(storedToken);
        setUser(JSON.parse(userRaw) as User);
      } catch {
        clearToken();
      }
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setTokenState(res.token);
    setUser(res.user);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const res = await apiSignup(email, password);
    setToken(res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setTokenState(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setTokenState(null);
    setUser(null);
    router.replace("/");
  }, [router]);

  const value = useMemo(
    () => ({ token, user, isLoading, login, signup, logout }),
    [token, user, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
