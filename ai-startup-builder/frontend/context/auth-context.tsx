"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth, api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from storage on mount
  const checkAuth = useCallback(() => {
    const storedUser = auth.getUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login Logic
 const login = async (email: string, password: string) => {
  try {
    const data = await api.login(email, password);

    // backend directly returns user
    if (data) {
      setUser(data);

      localStorage.setItem("user", JSON.stringify(data));

      router.push("/");
      router.refresh();
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

  // Logout Logic
  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
