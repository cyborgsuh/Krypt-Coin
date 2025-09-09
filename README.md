# 🚀 Krypt Coin — Crypto Dashboard

A sleek, fast, and responsive cryptocurrency dashboard powered by React + Vite + TypeScript, styled with Tailwind CSS, charted with Recharts, and fueled by the CoinGecko API. It features a persistent, featured Vanry card ("VANRY/USDT"), smooth area charts, and dark mode 🌗.

---

## ✨ Features

- **Featured Vanry/USDT card** pinned to the top of the list (even when filtering/searching)
- **Sparkline charts** on every coin card with a smooth area gradient
- **Detailed area chart** with auto-zoomed Y-axis and polished axes
- **Real-time data** via CoinGecko with robust retry/backoff and API key support
- **Dark mode** toggle and responsive design
- **Search and filter** (Gainers/Losers/All)

---

## 🧱 Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts (AreaChart + gradients + animations)
- **Icons**: lucide-react
- **HTTP**: Axios with retry + exponential backoff
- **API**: CoinGecko (Public Demo/Pro)

---

## 🗂️ Project Structure

- `src/components/`
  - `CoinList.tsx`: Renders search/filters and the coin grid. Always injects the featured Vanry card.
  - `CoinCard.tsx`: Coin tile with price, 24h change, market cap/volume, and a mini area sparkline.
  - `PriceChart.tsx`: Main, larger area chart (used in the detail modal).
  - `Header.tsx`, `ThemeToggle.tsx`, `CoinDetailModal.tsx`, etc.
- `src/services/coinGecko.ts`: All API calls + retries + env-driven auth and currency; ensures Vanry always appears.
- `src/hooks/useCoins.ts`: Fetch loop (auto-refresh) and state management.
- `src/types/coin.ts`: Strongly-typed Coin, CoinDetail, and PriceData; includes `sparkline_in_7d`.
- `public/`: Static assets (e.g., `favicon.svg`, `favicon-32x32.png`).

---

## 🔐 Environment Variables

Create a `.env` (local) or set variables in your hosting provider (e.g., Netlify). A sample is in `.env.txt`:

```
VITE_COINGECKO_API_KEY=your_key_here
VITE_VS_CURRENCY=usd
```

Optional:

```
# Set true if you have a Pro API key (changes base URL to pro-api)
VITE_COINGECKO_PRO=false
```

Notes:
- `VITE_COINGECKO_API_KEY` is used for both Public Demo (`x-cg-demo-api-key`) and Pro (`x-cg-pro-api-key`).
- Restart your dev server after changing `.env`.

---

## 🏃‍♀️ Getting Started

1) Install dependencies

```
npm install
```

2) Add env vars

- Copy `.env.txt` → `.env` and fill in your real values, or set them in Netlify.

3) Run the app (dev)

```
npm run dev
```

Visit: http://localhost:5173

---

## 🏗️ Build & Preview

```
npm run build
npm run preview
```

- Production build is output to `dist/`.

---

## ☁️ Deploy (Netlify)

This repo includes a `netlify.toml` configured for:

- Correct publish directory (`dist`)
- SPA redirects that don’t hijack asset requests (`/assets/*` passthrough)
- Explicit MIME types for JS/MJS/CSS + `X-Content-Type-Options: nosniff`

Netlify settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: add `VITE_COINGECKO_API_KEY`, optionally `VITE_VS_CURRENCY` and `VITE_COINGECKO_PRO`.

---

## 🧪 CoinGecko Integration

- Base URLs (auto-selected):
  - Public/Demo: `https://api.coingecko.com/api/v3`
  - Pro: `https://pro-api.coingecko.com/api/v3`
- Auth headers and query params are set per plan.
- Retries: 429/5xx are retried with exponential backoff; respects `Retry-After`.
- `getCoins()` fetches markets with `sparkline=true` and guarantees Vanry appears (fallback search).

Troubleshooting API issues:
- If you see 400/429, ensure your `VITE_COINGECKO_API_KEY` is set and the dev server restarted.
- Check console: we log the server’s error body when available.

---

## 📈 Charts

- **CoinCard sparkline**: Uses `coin.sparkline_in_7d.price`. Auto-zoomed Y with padding, smooth monotone curve, nice gradient.
- **PriceChart**: Full area chart with auto y-domain, improved axes, and custom tooltip.

---

## 🌟 Featured Card (Vanry/USDT)

- The UI always shows a featured Vanry card at the top of the list.
- Label displays as `VANRY/USDT`. 


## 🙌 Credits

- Data: **CoinGecko API**
- Icons: **lucide-react** + Flaticon (Good Ware) for the favicon
- Built with ❤️ using React, Vite, TypeScript, Tailwind CSS, and Recharts

---

## 📜 License

MIT — do whatever makes awesome things. PRs welcome! ✨
