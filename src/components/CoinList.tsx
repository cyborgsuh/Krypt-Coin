import React, { useState, useMemo } from 'react';
import { Coin, FilterType } from '../types/coin';
import { CoinCard } from './CoinCard';
import { SearchBar } from './SearchBar';
import { FilterTabs } from './FilterTabs';
import { CoinDetailModal } from './CoinDetailModal';

interface CoinListProps {
  coins: Coin[];
}

export const CoinList: React.FC<CoinListProps> = ({ coins }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Featured: Vanry (shown as Vanry/USDT in UI)
  const featuredCoin: Coin | undefined = useMemo(() => {
    return coins.find(
      (c) => c.id?.toLowerCase() === 'vanry' || c.symbol?.toLowerCase() === 'vanry'
    );
  }, [coins]);

  const filteredCoins = useMemo(() => {
    // Exclude featured from the list shown below to avoid duplication
    let filtered = coins.filter((c) => c.id?.toLowerCase() !== 'vanry' && c.symbol?.toLowerCase() !== 'vanry');

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case 'gainers':
        filtered = filtered
          .filter(coin => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        break;
      case 'losers':
        filtered = filtered
          .filter(coin => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
        break;
      default:
        // Keep original order (Vanry first)
        break;
    }

    return filtered;
  }, [coins, searchTerm, activeFilter]);

  const handleCoinClick = (coinId: string) => {
    setSelectedCoinId(coinId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCoinId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search cryptocurrencies..."
          />
        </div>
        <FilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredCoins.length} {filteredCoins.length === 1 ? 'cryptocurrency' : 'cryptocurrencies'}
      </div>

      {/* Coin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Always show Featured Vanry card at the top if available */}
        {featuredCoin && (
          <CoinCard
            key={`featured-${featuredCoin.id}`}
            coin={featuredCoin}
            onClick={() => handleCoinClick(featuredCoin.id)}
            isFirst={true}
          />
        )}
        {filteredCoins.map((coin) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            onClick={() => handleCoinClick(coin.id)}
            isFirst={false}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredCoins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No cryptocurrencies found matching your criteria.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Try adjusting your search or filter settings.
          </p>
        </div>
      )}

      {/* Coin Detail Modal */}
      {selectedCoinId && (
        <CoinDetailModal
          coinId={selectedCoinId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};