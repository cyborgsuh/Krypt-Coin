import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceData } from '../types/coin';

interface PriceChartProps {
  data: PriceData;
  coinName: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, coinName }) => {
  const [days, setDays] = useState<number>(7);

  const chartData = useMemo(() => (
    data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      price: price,
      timestamp: timestamp,
    }))
  ), [data]);

  // Auto-zoom the Y axis with padding to focus on the series' actual range
  const { minY, maxY } = useMemo(() => {
    if (!chartData.length) return { minY: 0, maxY: 0 };
    let min = chartData[0].price;
    let max = chartData[0].price;
    for (const d of chartData) {
      if (d.price < min) min = d.price;
      if (d.price > max) max = d.price;
    }
    // Add 2% padding on both ends; ensure non-zero range
    if (min === max) {
      const pad = min === 0 ? 1 : min * 0.02;
      return { minY: min - pad, maxY: max + pad };
    }
    const padding = (max - min) * 0.1; // 10% breathing room for nicer view
    return { minY: min - padding, maxY: max + padding };
  }, [chartData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatPrice(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const lineColor = chartData.length > 1 && chartData[chartData.length - 1].price > chartData[0].price
    ? '#10b981' : '#ef4444';
  const areaGradientId = `priceArea-${coinName.replace(/\s+/g, '-')}`;

  return (
    <div className="h-64 w-full pb-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {coinName} Price Chart
        </h3>
        <div className="flex space-x-2">
          {[7].map((period) => (
            <button
              key={period}
              onClick={() => setDays(period)}
              className={`px-3 py-1 rounded text-sm ${
                days === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {period}D
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 16, bottom: 12, left: 8 }}>
          <defs>
            <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" opacity={0.2} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickMargin={12}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={{ stroke: '#E5E7EB' }}
            minTickGap={24}
          />
          <YAxis
            domain={[minY, maxY]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickMargin={12}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => `$${Number(value).toFixed(Number(value) < 1 ? 4 : 2)}`}
            width={76}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9CA3AF', strokeDasharray: '3 3', opacity: 0.6 }} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${areaGradientId})`}
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-out"
            dot={false}
            activeDot={{ r: 4, stroke: lineColor, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};