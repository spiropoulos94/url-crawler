import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, LoginRequest, RegisterRequest } from "../../types";
import { authAPI } from "../../services/api";

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (isValidUser(parsedUser)) {
          setUser(parsedUser);
        } else {
          throw new Error("Invalid user data");
        }
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authAPI.login(data);
    const { user: newUser } = response;

    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const register = async (data: RegisterRequest) => {
    await authAPI.register(data);
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    localStorage.removeItem("user");
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
