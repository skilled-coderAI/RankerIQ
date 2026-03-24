"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  grade?: number;
  board?: string;
  child_name?: string;
  avatar_initials: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (data: SignupData) => Promise<string | null>;
  logout: () => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: string;
  grade?: number;
  board?: string;
  child_name?: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => null,
  signup: async () => null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("rankeriq_token");
    if (saved) {
      setToken(saved);
      fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((u) => {
          if (u) setUser(u);
          else {
            localStorage.removeItem("rankeriq_token");
            setToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem("rankeriq_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || "Login failed";
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("rankeriq_token", data.token);
      return null;
    } catch {
      return "Network error";
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) return result.error || "Signup failed";
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem("rankeriq_token", result.token);
      return null;
    } catch {
      return "Network error";
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("rankeriq_token");
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
