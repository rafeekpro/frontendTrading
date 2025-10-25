/**
 * Mock Data Generators - Barrel Export
 *
 * This module provides a centralized export point for all mock data generators.
 * Generators create realistic, reproducible test data for the trading application.
 *
 * Current exports:
 * - SeededRandom: Deterministic random number generator for reproducibility
 *
 * Future exports (to be added by Streams B & C):
 * - Instrument generators (stocks, crypto, forex)
 * - Candlestick/OHLCV data generators
 * - Trade history generators
 * - Position generators
 * - Trading opportunity generators
 */

// Foundation (Stream A)
export * from './seed';

// Instrument generators (Stream B - to be added)
// export * from './instruments';

// Market data generators (Stream C - to be added)
// export * from './candlesticks';
// export * from './trades';
// export * from './positions';
// export * from './opportunities';
