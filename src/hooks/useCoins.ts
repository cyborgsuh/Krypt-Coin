import { useState, useEffect } from 'react';
import { Coin } from '../types/coin';
import { coinGeckoApi } from '../services/coinGecko';

export const useCoins = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coinGeckoApi.getCoins();
      setCoins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchCoins, 30000000);
    return () => clearInterval(interval);
  }, []);

  return { coins, loading, error, refetch: fetchCoins };
};