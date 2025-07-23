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
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl shadow-lg">
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent truncate">
                  Sykell Web Crawler
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Advanced Website Analysis Tool
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  Welcome back!
                </p>
                <p className="text-sm text-gray-600">{user?.username}</p>
              </div>
              <button
                onClick={logout}
                className="flex cursor-pointer items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group text-sm"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">{children}</div>
      </main>
    </div>
  );
};
