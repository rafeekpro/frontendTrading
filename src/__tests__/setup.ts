import '@testing-library/jest-dom';

// Mock ResizeObserver for recharts compatibility
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
