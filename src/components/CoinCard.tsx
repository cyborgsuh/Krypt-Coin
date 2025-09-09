import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Coin } from '../types/coin';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

interface CoinCardProps {
  coin: Coin;
  onClick: () => void;
  isFirst?: boolean;
}

export const CoinCard: React.FC<CoinCardProps> = ({ coin, onClick, isFirst = false }) => {
  const isPositive = coin.price_change_percentage_24h > 0;
  const vsCurrency = (import.meta.env.VITE_VS_CURRENCY as string | undefined)?.toUpperCase() || 'USD';
  const formatPrice = (price: number) => {
    const minFrac = price < 1 ? 6 : 2;
    if (vsCurrency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: minFrac,
      }).format(price);
    }
    // Fallback for non-ISO like USDT: plain number + code
    const num = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minFrac,
      maximumFractionDigits: Math.max(minFrac, 6),
    }).format(price);
    return `${num} ${vsCurrency}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  };

  // Prepare sparkline data for mini chart (7D series from markets endpoint)
  const sparkData = useMemo(() => {
    const arr = coin.sparkline_in_7d?.price || [];
    return arr.map((p, i) => ({ x: i, y: p }));
  }, [coin.sparkline_in_7d]);

  const { minY, maxY } = useMemo(() => {
    if (!sparkData.length) return { minY: 0, maxY: 0 };
    let min = sparkData[0].y;
    let max = sparkData[0].y;
    for (const d of sparkData) {
      if (d.y < min) min = d.y;
      if (d.y > max) max = d.y;
    }
    if (min === max) {
      const pad = min === 0 ? 1 : min * 0.02;
      return { minY: min - pad, maxY: max + pad };
    }
    const padding = (max - min) * 0.1;
    return { minY: min - padding, maxY: max + padding };
  }, [sparkData]);

  const lineColor = useMemo(() => {
    if (sparkData.length < 2) return '#6b7280';
    return sparkData[sparkData.length - 1].y >= sparkData[0].y ? '#10b981' : '#ef4444';
  }, [sparkData]);

  return (
    <div
      onClick={onClick}
      className={`h-full bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer ${
        isFirst ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={coin.image}
            alt={coin.name}
            className="w-12 h-12 rounded-full object-contain shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="truncate">{coin.name}</span>
              {isFirst && (
                <span className="hidden md:inline-flex items-center md:text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                  FEATURED
                </span>
              )}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
              {isFirst ? 'VANRY/USDT' : coin.symbol}
            </p>
          </div>
        </div>
        <div className="text-right ml-auto">
          <p className="font-bold text-lg text-gray-900 dark:text-gray-100 font-mono tabular-nums whitespace-nowrap">
            {formatPrice(coin.current_price)}
          </p>
          <div className={`flex items-center justify-end gap-1 ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-medium font-mono tabular-nums">
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      {/* Mini Sparkline Chart */}
      {sparkData.length > 0 && (
        <div className="mt-4 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`spark-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="x" hide={true} />
              <YAxis domain={[minY, maxY]} hide={true} />
              <Area
                type="monotone"
                dataKey="y"
                stroke={lineColor}
                strokeWidth={2}
                fill={`url(#spark-${coin.id})`}
                isAnimationActive={true}
                animationDuration={500}
                animationEasing="ease-out"
                dot={false}
                activeDot={{ r: 2, stroke: lineColor, strokeWidth: 1 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Market Cap</p>
          <p className="font-medium text-gray-900 dark:text-gray-100 font-mono tabular-nums">
            ${formatNumber(coin.market_cap)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-right">24h Volume</p>
          <p className="font-medium text-gray-900 dark:text-gray-100 font-mono tabular-nums text-right">
            ${formatNumber(coin.total_volume)}
          </p>
        </div>
      </div>
    </div>
  );
};