import React from "react";
import { LogOut } from "lucide-react";

export interface UserMenuProps {
  username?: string;
  onLogout: () => void;
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  username,
  onLogout,
  className = "",
}) => {
  return (
    <div className={`flex items-center space-x-2 sm:space-x-4 ${className}`}>
      <div className="text-right hidden sm:block">
        <p className="text-xs font-medium text-gray-900">Welcome back!</p>
        <p className="text-xs text-gray-600">{username}</p>
      </div>
      <button
        onClick={onLogout}
        className="flex cursor-pointer items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group text-xs sm:text-sm"
      >
        <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
        <span className="font-medium hidden sm:inline">Logout</span>
      </button>
    </div>
  );
};
