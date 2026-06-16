import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../services/apiClient";

export interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatarText: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and check for existing session
  useEffect(() => {
    async function restoreSession() {
      const savedToken = apiClient.getToken();
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(savedToken);
        const profile = await apiClient.get<User>("/auth/me");
        setUser(profile);
      } catch (error) {
        console.error("Failed to restore session node:", error);
        // Clear broken token
        apiClient.clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{ user: User; token: string }>("/auth/login", {
        email,
        password,
      });
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    displayName: string,
    username: string,
    email: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{ user: User; token: string }>("/auth/register", {
        displayName,
        username,
        email,
        password,
      });
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
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
