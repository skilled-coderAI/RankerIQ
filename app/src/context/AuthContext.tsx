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

const BACKEND_URL = "";

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
  loginWithGoogle: (credential: string) => Promise<string | null>;
  loginWithPuter: () => Promise<string | null>;
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
  loginWithGoogle: async () => null,
  loginWithPuter: async () => null,
  logout: () => {},
});

function isSyntheticToken(token: string): boolean {
  return token.startsWith("google.") || token.startsWith("puter.");
}

function decodeSyntheticToken(token: string): User | null {
  try {
    const parts = token.split(".");
    if (parts.length < 3) return null;
    const userJson = atob(parts[1]);
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("rankeriq_token");
    if (!saved) {
      setLoading(false);
      return;
    }

    if (isSyntheticToken(saved)) {
      const decoded = decodeSyntheticToken(saved);
      if (decoded) {
        setToken(saved);
        setUser(decoded);
      } else {
        localStorage.removeItem("rankeriq_token");
      }
      setLoading(false);
      return;
    }

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

  const loginWithGoogle = useCallback(async (credential: string) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || "Google sign-in failed";
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("rankeriq_token", data.token);
      return null;
    } catch {
      return "Google sign-in failed. Please try again.";
    }
  }, []);

  const loginWithPuter = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !window.puter) {
        return "Puter is not available yet. Please try again in a moment.";
      }

      const puterUser = await window.puter.auth.signIn();

      const email = puterUser.email || `${puterUser.username}@puter.local`;
      const displayName = puterUser.username;

      const syntheticUser: User = {
        id: `puter_${puterUser.uuid}`,
        name: displayName,
        email,
        role: "student",
        grade: 9,
        board: "CBSE",
        avatar_initials: displayName[0].toUpperCase(),
      };

      const tokenPayload = btoa(JSON.stringify(syntheticUser));
      const syntheticToken = `puter.${tokenPayload}.v1`;

      setUser(syntheticUser);
      setToken(syntheticToken);
      localStorage.setItem("rankeriq_token", syntheticToken);

      if (window.puter.kv) {
        window.puter.kv
          .set("rankeriq_last_login", new Date().toISOString())
          .catch(() => {});
      }

      return null;
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes("cancel")) return null;
      return "Puter sign-in failed. Please try again.";
    }
  }, []);

  const logout = useCallback(() => {
    if (
      token &&
      token.startsWith("puter.") &&
      typeof window !== "undefined" &&
      window.puter
    ) {
      window.puter.auth.signOut().catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("rankeriq_token");
    router.push("/login");
  }, [router, token]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, loginWithGoogle, loginWithPuter, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
