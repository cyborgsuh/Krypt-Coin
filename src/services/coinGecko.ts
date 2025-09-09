import axios from 'axios';
import { Coin, CoinDetail, PriceData } from '../types/coin';

// Configure plan and base URL per CoinGecko docs
const isPro = (import.meta.env.VITE_COINGECKO_PRO as string | undefined) === 'true';
const PUBLIC_BASE_URL = 'https://api.coingecko.com/api/v3';
const PRO_BASE_URL = 'https://pro-api.coingecko.com/api/v3';
const BASE_URL = isPro ? PRO_BASE_URL : PUBLIC_BASE_URL;

// Use Vite env for browser builds
const apiKey = import.meta.env.VITE_COINGECKO_API_KEY as string | undefined;
const vsCurrency = (import.meta.env.VITE_VS_CURRENCY as string | undefined)?.toLowerCase() || 'usd';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  // Set the appropriate header key per plan
  headers: apiKey
    ? (isPro ? { 'x-cg-pro-api-key': apiKey } : { 'x-cg-demo-api-key': apiKey })
    : {},
});

// Simple retry with exponential backoff for 429/5xx
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const cfg = error.config || {};
    const status: number | undefined = error?.response?.status;
    const maxRetries = 3;
    cfg.__retryCount = cfg.__retryCount || 0;

    const retryable = status === 429 || (status && status >= 500);
    if (retryable && cfg.__retryCount < maxRetries) {
      cfg.__retryCount += 1;
      // Respect Retry-After if provided (seconds)
      const retryAfterHeader = error?.response?.headers?.['retry-after'];
      const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : undefined;
      // Exponential backoff: 500ms, 1000ms, 2000ms...
      const backoffMs = retryAfterMs ?? 500 * Math.pow(2, cfg.__retryCount - 1);
      await new Promise((r) => setTimeout(r, backoffMs));
      return api(cfg);
    }
    return Promise.reject(error);
  }
);

export const coinGeckoApi = {
  getCoins: async (): Promise<Coin[]> => {
    try {
      const response = await api.get<Coin[]>('/coins/markets', {
        params: {
          vs_currency: vsCurrency,
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: true,
          // Include API key as query param as well per docs
          ...(apiKey && (isPro ? { x_cg_pro_api_key: apiKey } : { x_cg_demo_api_key: apiKey })),
        },
      });
      
      // Pin Vanry to the front if present
      const coins = response.data;
      const vanryIndex = coins.findIndex(
        (coin) => coin.id?.toLowerCase() === 'vanry' || coin.symbol?.toLowerCase() === 'vanry'
      );
      if (vanryIndex > -1) {
        const [vanryCoin] = coins.splice(vanryIndex, 1);
        coins.unshift(vanryCoin);
      } else {
        // If Vanry is not returned in the top list, fetch it explicitly and prepend
        try {
          // 1) Try direct by id
          let vanryCoin: Coin | undefined;
          try {
            const byIdResp = await api.get<Coin[]>('/coins/markets', {
              params: {
                vs_currency: vsCurrency,
                ids: 'vanry',
                sparkline: true,
                ...(apiKey && (isPro ? { x_cg_pro_api_key: apiKey } : { x_cg_demo_api_key: apiKey })),
              },
            });
            vanryCoin = byIdResp.data?.[0];
          } catch {}

          // 2) If empty, search to discover the correct id
          if (!vanryCoin) {
            const searchResp = await api.get('/search', {
              params: {
                query: 'vanry',
                ...(apiKey && (isPro ? { x_cg_pro_api_key: apiKey } : { x_cg_demo_api_key: apiKey })),
              },
            });
            const match = (searchResp.data?.coins || []).find((c: any) =>
              (c.id && String(c.id).toLowerCase().includes('vanry')) ||
              (c.symbol && String(c.symbol).toLowerCase() === 'vanry') ||
              (c.name && String(c.name).toLowerCase().includes('vanry'))
            );
            const resolvedId = match?.id;
            if (resolvedId) {
              const byResolvedResp = await api.get<Coin[]>('/coins/markets', {
                params: {
                  vs_currency: vsCurrency,
                  ids: resolvedId,
                  sparkline: true,
                  ...(apiKey && (isPro ? { x_cg_pro_api_key: apiKey } : { x_cg_demo_api_key: apiKey })),
                },
              });
              vanryCoin = byResolvedResp.data?.[0];
            }
          }

          if (vanryCoin) {
            // Remove any duplicate by id just in case
            const deduped = coins.filter((c) => c.id?.toLowerCase() !== vanryCoin!.id.toLowerCase());
            deduped.unshift(vanryCoin);
            return deduped;
          }
        } catch (e) {
          // Silently ignore if Vanry fetch fails; we still return the main list
        }
      }
      
      return coins;
    } catch (error) {
      // Surface server message if present to aid debugging
      const msg = (error as any)?.response?.data?.error || (error as any)?.response?.data?.status?.error_message;
      console.error('Error fetching coins:', msg || error);
      throw new Error('Failed to fetch cryptocurrency data');
    }
  },

  getCoinDetail: async (coinId: string): Promise<CoinDetail> => {
    try {
      const response = await api.get<CoinDetail>(`/coins/${coinId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coin detail:', error);
      throw new Error('Failed to fetch coin details');
    }
  },

  getCoinPriceHistory: async (coinId: string, days: number = 7): Promise<PriceData> => {
    try {
      const response = await api.get<PriceData>(`/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw new Error('Failed to fetch price history');
    }
  },
};