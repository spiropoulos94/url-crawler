import React from "react";
import { useAuth } from "./providers/AuthProvider";
import { LogOut, Globe } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                  Sykell Web Crawler
                </h1>
                <p className="text-sm text-gray-600">Advanced Website Analysis Tool</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                <p className="text-sm text-gray-600">{user?.username}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
              >
                <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};
