import React from "react";
import { Logo, UserMenu } from "../ui";

export interface NavigationBarProps {
  username?: string;
  onLogout: () => void;
  className?: string;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  username,
  onLogout,
  className = "",
}) => {
  return (
    <nav
      className={`bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Logo />
          <UserMenu username={username} onLogout={onLogout} />
        </div>
      </div>
    </nav>
  );
};
