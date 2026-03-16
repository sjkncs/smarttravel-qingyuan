"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  role?: string;
  locale?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  refresh: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("auth-token", newToken);
    localStorage.setItem("auth-user", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(async () => {
    const currentToken = token || localStorage.getItem("auth-token");
    if (currentToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch { /* ignore */ }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth-token");
    localStorage.removeItem("auth-user");
  }, [token]);

  const refresh = useCallback(async () => {
    const storedToken = localStorage.getItem("auth-token");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setToken(storedToken);
        setUser(data.user);
        localStorage.setItem("auth-user", JSON.stringify(data.user));
      } else {
        // Token expired or invalid
        localStorage.removeItem("auth-token");
        localStorage.removeItem("auth-user");
        setToken(null);
        setUser(null);
      }
    } catch {
      // Offline or API error — use cached user
      const cached = localStorage.getItem("auth-user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
          setToken(storedToken);
        } catch { /* ignore */ }
      }
    }
    setLoading(false);
  }, []);

  // Auto-refresh on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refresh, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
