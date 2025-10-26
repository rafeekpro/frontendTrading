import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver for recharts compatibility
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock lightweight-charts globally for all tests
vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => ({
    addCandlestickSeries: vi.fn(() => ({
      setData: vi.fn(),
      update: vi.fn(),
    })),
    addHistogramSeries: vi.fn(() => ({
      setData: vi.fn(),
      update: vi.fn(),
    })),
    applyOptions: vi.fn(),
    timeScale: vi.fn(() => ({
      fitContent: vi.fn(),
      scrollToPosition: vi.fn(),
    })),
    resize: vi.fn(),
    remove: vi.fn(),
  })),
  ColorType: {
    Solid: 'Solid',
  },
}));
