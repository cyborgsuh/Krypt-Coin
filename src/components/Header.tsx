import React from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading }) => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Krypt Coin
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Live cryptocurrency prices
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};