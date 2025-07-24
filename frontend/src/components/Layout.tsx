import React from "react";
import { useAuth } from "./providers/AuthProvider";
import { NavigationBar } from "./layout/NavigationBar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <NavigationBar username={user?.username} onLogout={logout} />

      <main className="max-w-7xl mx-auto py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-6">
        <div className="space-y-4 sm:space-y-6">{children}</div>
      </main>
    </div>
  );
};
