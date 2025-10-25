/**
 * Mock Data Generators - Barrel Export
 *
 * This module provides a centralized export point for all mock data generators.
 * Generators create realistic, reproducible test data for the trading application.
 *
 * Current exports:
 * - SeededRandom: Deterministic random number generator for reproducibility
 * - generateInstruments: Generate stocks, crypto, forex instruments
 * - generateCandlesticks: Generate OHLCV candlestick data
 * - generateTrades: Generate historical trade records with realistic P&L
 * - generatePositions: Generate open positions with unrealized P&L
 * - generateOpportunities: Generate trading signals with risk/reward ratios
 */

// Foundation (Stream A)
export * from './seed';

// Instrument & Market Data generators (Stream B)
export * from './instruments';
export * from './candlesticks';

// Trading data generators (Stream C)
export * from './trades';
export * from './positions';
export * from './opportunities';
