import { MarketDataset, PricePoint } from '../types/game';

/**
 * Generates continuous geometric Brownian motion with mean-reversion drift and volatility bursts.
 */
function generateMarketSeries(length: number, startPrice: number, volatility: number, drift: number = 0): PricePoint[] {
  const points: PricePoint[] = [];
  let currentPrice = startPrice;

  for (let i = 0; i < length; i++) {
    // Add micro-noise plus momentum
    const randomShock = (Math.random() - 0.495) * volatility;
    const wave = Math.sin(i / 15) * (volatility * 0.4) + Math.cos(i / 40) * (volatility * 0.7);
    const meanPull = (startPrice - currentPrice) * 0.005;

    currentPrice = Math.max(1, currentPrice + randomShock + wave * 0.2 + drift + meanPull);
    
    points.push({
      time: i,
      price: Number(currentPrice.toFixed(2))
    });
  }

  return points;
}

export const PRESET_DATASETS: MarketDataset[] = [
  {
    id: 'crypto_btc',
    name: 'BTC/USD Volatility',
    description: 'High frequency crypto price action with fast swings and breakouts',
    prices: generateMarketSeries(800, 64200, 45, 0.05)
  },
  {
    id: 'tech_stock',
    name: 'NVDA Micro Trends',
    description: 'Rapid tech equity swings with sharp trend reversals and momentum',
    prices: generateMarketSeries(800, 128.5, 0.65, 0.01)
  },
  {
    id: 'forex_scalp',
    name: 'EUR/USD Scalper',
    description: 'Oscillating currency pair ticks with tight mean-reversion',
    prices: generateMarketSeries(800, 108.2, 0.25, 0)
  }
];

/**
 * Parses user-provided CSV string into PricePoint[]
 * Accepts headers like "time,price" or "timestamp,close" or 2 columns without header.
 */
export function parseCsvPrices(csvText: string): { prices: PricePoint[]; error?: string } {
  try {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return { prices: [], error: 'CSV must contain at least 2 rows of data.' };
    }

    const prices: PricePoint[] = [];
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('time') || firstLine.includes('price') || firstLine.includes('close') || isNaN(Number(lines[0].split(',')[0]));

    const startIndex = hasHeader ? 1 : 0;

    // Detect column indexes
    let timeCol = 0;
    let priceCol = 1;

    if (hasHeader) {
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const pIdx = headers.findIndex(h => h === 'price' || h === 'close' || h === 'val' || h === 'value');
      const tIdx = headers.findIndex(h => h === 'time' || h === 'timestamp' || h === 't' || h === 'date');
      if (pIdx !== -1) priceCol = pIdx;
      if (tIdx !== -1) timeCol = tIdx;
      if (priceCol === timeCol && headers.length > 1) {
        priceCol = 1;
        timeCol = 0;
      }
    }

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 2) continue;

      let timeVal = Number(parts[timeCol]);
      if (isNaN(timeVal)) {
        timeVal = i;
      }

      const priceVal = Number(parts[priceCol]);
      if (isNaN(priceVal)) continue;

      prices.push({
        time: timeVal,
        price: priceVal
      });
    }

    if (prices.length < 2) {
      return { prices: [], error: 'No valid (time, price) numeric rows found in CSV.' };
    }

    return { prices };
  } catch (err) {
    return { prices: [], error: `Failed to parse CSV: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Returns formatted CSV string from prices array to download as Game.csv
 */
export function generateCsvString(prices: PricePoint[]): string {
  let csv = 'time,price\n';
  for (const pt of prices) {
    csv += `${pt.time},${pt.price}\n`;
  }
  return csv;
}
