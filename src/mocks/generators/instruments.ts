/**
 * Instrument Generator
 *
 * Generates realistic mock financial instruments including stocks, cryptocurrencies,
 * and forex pairs using Faker.js for realistic names and SeededRandom for reproducibility.
 */

import { faker } from '@faker-js/faker';
import { SeededRandom } from './seed';
import type { Instrument, InstrumentType } from '../../types/trading';

/**
 * Instrument generation constants
 */
const INSTRUMENT_DEFAULTS = {
  stock: {
    spread: { min: 0.0001, max: 0.001 },
    pip_value: 0.01,
    min_trade_size: 1,
    max_trade_size: 10000,
    precision: 2,
  },
  crypto: {
    spread: { min: 0.001, max: 0.01 },
    pip_value: 0.00000001,
    min_trade_size: 0.001,
    max_trade_size: 1000,
    precision: 8,
  },
  forex: {
    spread: { min: 0.00001, max: 0.0001 },
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
  },
} as const;

/**
 * Distribution ratios for instrument types
 */
const DISTRIBUTION_RATIOS = {
  stock: 0.5, // 50% stocks
  crypto: 0.25, // 25% crypto
  forex: 0.25, // 25% forex
} as const;

/**
 * Popular stock ticker symbols
 */
const STOCK_TICKERS = [
  'AAPL',
  'GOOGL',
  'MSFT',
  'TSLA',
  'AMZN',
  'META',
  'NVDA',
  'AMD',
  'INTC',
  'NFLX',
  'DIS',
  'BA',
  'GE',
  'JPM',
  'BAC',
  'WFC',
  'C',
  'GS',
  'MS',
  'V',
  'MA',
  'PYPL',
  'SQ',
  'SHOP',
  'CRM',
  'ORCL',
  'IBM',
  'CSCO',
  'ADBE',
  'NOW',
  'ZM',
  'SPOT',
  'UBER',
  'LYFT',
  'ABNB',
  'COIN',
  'RBLX',
  'SNAP',
  'TWTR',
  'T',
];

/**
 * Popular cryptocurrency symbols
 */
const CRYPTO_SYMBOLS = [
  'BTC',
  'ETH',
  'SOL',
  'DOGE',
  'ADA',
  'XRP',
  'DOT',
  'AVAX',
  'MATIC',
  'LINK',
  'UNI',
  'ATOM',
  'LTC',
  'BCH',
  'XLM',
  'ALGO',
  'VET',
  'FIL',
  'THETA',
  'TRX',
];

/**
 * Popular forex currency pairs (base/quote)
 */
const FOREX_PAIRS = [
  { base: 'EUR', quote: 'USD', name: 'Euro / US Dollar' },
  { base: 'GBP', quote: 'USD', name: 'British Pound / US Dollar' },
  { base: 'USD', quote: 'JPY', name: 'US Dollar / Japanese Yen' },
  { base: 'AUD', quote: 'USD', name: 'Australian Dollar / US Dollar' },
  { base: 'USD', quote: 'CHF', name: 'US Dollar / Swiss Franc' },
  { base: 'NZD', quote: 'USD', name: 'New Zealand Dollar / US Dollar' },
  { base: 'USD', quote: 'CAD', name: 'US Dollar / Canadian Dollar' },
  { base: 'EUR', quote: 'GBP', name: 'Euro / British Pound' },
  { base: 'EUR', quote: 'JPY', name: 'Euro / Japanese Yen' },
  { base: 'GBP', quote: 'JPY', name: 'British Pound / Japanese Yen' },
  { base: 'AUD', quote: 'JPY', name: 'Australian Dollar / Japanese Yen' },
  { base: 'EUR', quote: 'CHF', name: 'Euro / Swiss Franc' },
  { base: 'GBP', quote: 'CHF', name: 'British Pound / Swiss Franc' },
  { base: 'AUD', quote: 'NZD', name: 'Australian Dollar / New Zealand Dollar' },
];

/**
 * Cryptocurrency full names
 */
const CRYPTO_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  DOGE: 'Dogecoin',
  ADA: 'Cardano',
  XRP: 'Ripple',
  DOT: 'Polkadot',
  AVAX: 'Avalanche',
  MATIC: 'Polygon',
  LINK: 'Chainlink',
  UNI: 'Uniswap',
  ATOM: 'Cosmos',
  LTC: 'Litecoin',
  BCH: 'Bitcoin Cash',
  XLM: 'Stellar',
  ALGO: 'Algorand',
  VET: 'VeChain',
  FIL: 'Filecoin',
  THETA: 'Theta Network',
  TRX: 'Tron',
};

/**
 * Generate a single stock instrument
 */
function generateStock(ticker: string, seed: number): Instrument {
  faker.seed(seed);
  const rng = new SeededRandom(seed);

  const defaults = INSTRUMENT_DEFAULTS.stock;
  const companyName = faker.company.name();

  return {
    id: `STOCK_${ticker}`,
    name: companyName,
    symbol: ticker,
    type: 'stock',
    spread: rng.nextFloat(defaults.spread.min, defaults.spread.max),
    pip_value: defaults.pip_value,
    min_trade_size: defaults.min_trade_size,
    max_trade_size: defaults.max_trade_size,
    precision: defaults.precision,
  };
}

/**
 * Generate a single cryptocurrency instrument
 */
function generateCrypto(symbol: string, seed: number): Instrument {
  const rng = new SeededRandom(seed);

  const defaults = INSTRUMENT_DEFAULTS.crypto;
  const name = CRYPTO_NAMES[symbol] || symbol;

  return {
    id: `CRYPTO_${symbol}`,
    name: name,
    symbol: `${symbol}/USD`,
    type: 'crypto',
    spread: rng.nextFloat(defaults.spread.min, defaults.spread.max),
    pip_value: defaults.pip_value,
    min_trade_size: defaults.min_trade_size,
    max_trade_size: defaults.max_trade_size,
    precision: defaults.precision,
  };
}

/**
 * Generate a single forex pair instrument
 */
function generateForexPair(
  base: string,
  quote: string,
  name: string,
  seed: number
): Instrument {
  const rng = new SeededRandom(seed);

  const defaults = INSTRUMENT_DEFAULTS.forex;

  return {
    id: `FOREX_${base}_${quote}`,
    name: name,
    symbol: `${base}/${quote}`,
    type: 'forex',
    spread: rng.nextFloat(defaults.spread.min, defaults.spread.max),
    pip_value: defaults.pip_value,
    min_trade_size: defaults.min_trade_size,
    max_trade_size: defaults.max_trade_size,
    precision: defaults.precision,
  };
}

/**
 * Generate realistic financial instruments
 *
 * Creates a mix of stocks, cryptocurrencies, and forex pairs with realistic
 * properties using Faker.js for names and SeededRandom for reproducibility.
 *
 * @param count - Total number of instruments to generate (minimum 3)
 * @param seed - Optional seed for reproducible generation (default: 42)
 * @returns Array of generated instruments
 *
 * @example
 * ```typescript
 * // Generate 60 instruments with default distribution
 * const instruments = generateInstruments(60);
 *
 * // Generate 100 instruments with custom seed for reproducibility
 * const instruments = generateInstruments(100, 12345);
 * ```
 */
export function generateInstruments(
  count: number,
  seed: number = 42
): Instrument[] {
  const rng = new SeededRandom(seed);
  const instruments: Instrument[] = [];

  // Calculate distribution based on realistic market composition
  const stockCount = Math.floor(count * DISTRIBUTION_RATIOS.stock);
  const cryptoCount = Math.floor(count * DISTRIBUTION_RATIOS.crypto);
  const forexCount = count - stockCount - cryptoCount;

  // Generate stocks
  let generatedStocks = 0;
  for (let i = 0; i < stockCount; i++) {
    const ticker =
      STOCK_TICKERS[i % STOCK_TICKERS.length] || `STK${i.toString(36).toUpperCase()}`;
    const stockSeed = seed + i * 100;
    instruments.push(generateStock(ticker, stockSeed));
    generatedStocks++;
  }

  // Generate cryptocurrencies
  let generatedCrypto = 0;
  for (let i = 0; i < cryptoCount; i++) {
    const symbol =
      CRYPTO_SYMBOLS[i % CRYPTO_SYMBOLS.length] ||
      `CRY${i.toString(36).toUpperCase()}`;
    const cryptoSeed = seed + stockCount * 100 + i * 100;
    instruments.push(generateCrypto(symbol, cryptoSeed));
    generatedCrypto++;
  }

  // Generate forex pairs
  for (let i = 0; i < forexCount; i++) {
    const pair = FOREX_PAIRS[i % FOREX_PAIRS.length] || {
      base: 'XXX',
      quote: 'YYY',
      name: 'Unknown / Unknown',
    };
    const forexSeed = seed + (stockCount + cryptoCount) * 100 + i * 100;
    instruments.push(
      generateForexPair(pair.base, pair.quote, pair.name, forexSeed)
    );
  }

  // Shuffle instruments for more realistic order
  for (let i = instruments.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [instruments[i], instruments[j]] = [instruments[j]!, instruments[i]!];
  }

  return instruments;
}
