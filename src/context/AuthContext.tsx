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
  connections: string[];
  toggleConnection: (username: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (displayName: string, username: string, email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connections, setConnections] = useState<string[]>([]);

  // Synchronize connections from localStorage
  useEffect(() => {
    if (user) {
      const follows = JSON.parse(localStorage.getItem("aether_follows") || "[]");
      setConnections(follows.map((u: string) => u.replace("@", "")));
    } else {
      setConnections([]);
    }
  }, [user]);

  const toggleConnection = (username: string) => {
    const cleanUsername = username.replace("@", "");
    const updated = connections.includes(cleanUsername)
      ? connections.filter(u => u !== cleanUsername)
      : [...connections, cleanUsername];
    
    setConnections(updated);
    localStorage.setItem("aether_follows", JSON.stringify(updated));
  };

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

  const updateProfile = async (displayName: string, username: string, email: string) => {
    setIsLoading(true);
    try {
      const updatedUser = await apiClient.put<User>("/auth/update", {
        displayName,
        username,
        email,
      });
      setUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await apiClient.put<{ message: string }>("/auth/change-password", {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    connections,
    toggleConnection,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
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
