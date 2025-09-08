import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { CoinList } from './components/CoinList';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { useCoins } from './hooks/useCoins';
import { AlertCircle } from 'lucide-react';

function App() {
  const { coins, loading, error, refetch } = useCoins();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <Header onRefresh={refetch} isLoading={loading} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">
                    Error Loading Data
                  </h3>
                  <p className="text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                  <button
                    onClick={refetch}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : loading ? (
            <LoadingSkeleton rows={9} />
          ) : (
            <CoinList coins={coins} />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">
                Powered by{' '}
                <a
                  href="https://www.coingecko.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  CoinGecko API
                </a>
              </p>
              <p className="text-xs mt-2">
                Data updates every 30 seconds • Built with React & Tailwind CSS
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;