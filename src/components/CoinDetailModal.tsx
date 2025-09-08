import React, { useState, useEffect } from 'react';
import { X, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { CoinDetail, PriceData } from '../types/coin';
import { coinGeckoApi } from '../services/coinGecko';
import { PriceChart } from './PriceChart';

interface CoinDetailModalProps {
  coinId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CoinDetailModal: React.FC<CoinDetailModalProps> = ({
  coinId,
  isOpen,
  onClose,
}) => {
  const [coinDetail, setCoinDetail] = useState<CoinDetail | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && coinId) {
      fetchCoinData();
    }
  }, [isOpen, coinId]);

  const fetchCoinData = async () => {
    try {
      setLoading(true);
      const [detail, prices] = await Promise.all([
        coinGeckoApi.getCoinDetail(coinId),
        coinGeckoApi.getCoinPriceHistory(coinId, 7)
      ]);
      setCoinDetail(detail);
      setPriceData(prices);
    } catch (error) {
      console.error('Error fetching coin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {coinDetail && (
              <>
                <img
                  src={coinDetail.image.small}
                  alt={coinDetail.name}
                  className="w-8 h-8 rounded-full"
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {coinDetail.name}
                </h2>
                <span className="text-gray-500 dark:text-gray-400 uppercase">
                  {coinDetail.symbol}
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
              <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                ))}
              </div>
            </div>
          ) : coinDetail && priceData ? (
            <div className="space-y-8">
              {/* Price Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(coinDetail.market_data.current_price.usd)}
                  </h3>
                  <div className={`flex items-center space-x-1 mt-1 ${
                    coinDetail.market_data.price_change_percentage_24h > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {coinDetail.market_data.price_change_percentage_24h > 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    <span className="text-lg font-medium">
                      {Math.abs(coinDetail.market_data.price_change_percentage_24h).toFixed(2)}%
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">(24h)</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Rank #{coinDetail.market_cap_rank}
                  </span>
                </div>
              </div>

              {/* Chart */}
              <PriceChart data={priceData} coinName={coinDetail.name} />

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Market Cap
                  </h4>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    ${formatNumber(coinDetail.market_data.market_cap.usd)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    24h Volume
                  </h4>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    ${formatNumber(coinDetail.market_data.total_volume.usd)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Circulating Supply
                  </h4>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {formatNumber(coinDetail.market_data.circulating_supply)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {coinDetail.symbol.toUpperCase()}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    24h High
                  </h4>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(coinDetail.market_data.high_24h.usd)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    24h Low
                  </h4>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {formatPrice(coinDetail.market_data.low_24h.usd)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Total Supply
                  </h4>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {coinDetail.market_data.total_supply ? 
                      formatNumber(coinDetail.market_data.total_supply) : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* Description */}
              {coinDetail.description.en && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    About {coinDetail.name}
                  </h4>
                  <div 
                    className="text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: coinDetail.description.en.split('.')[0] + '.' 
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Failed to load coin details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};