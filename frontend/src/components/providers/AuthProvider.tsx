import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, LoginRequest, RegisterRequest } from "../../types";
import { authAPI } from "../../services/api";
import { useLocalStorage } from "../../hooks";

const isValidUser = (obj: unknown): obj is User => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as User).id === "number" &&
    typeof (obj as User).username === "string" &&
    typeof (obj as User).created_at === "string" &&
    typeof (obj as User).updated_at === "string"
  );
};

interface AuthContextType {
  user: User | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [storedUser, setStoredUser, removeStoredUser] = useLocalStorage<User | null>("user", null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (storedUser && isValidUser(storedUser)) {
      setUser(storedUser);
    } else if (storedUser) {
      removeStoredUser();
    }
    setIsLoading(false);
  }, [storedUser, removeStoredUser]);

  const login = async (data: LoginRequest) => {
    const response = await authAPI.login(data);
    const { user: newUser } = response;

    setUser(newUser);
    setStoredUser(newUser);
  };

  const register = async (data: RegisterRequest) => {
    await authAPI.register(data);
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    removeStoredUser();
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
