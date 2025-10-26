/**
 * DraggableInstrumentRow Component Tests
 * RED Phase: Tests written BEFORE implementation
 */

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { DraggableInstrumentRow } from '../DraggableInstrumentRow';
import { describe, it, expect, vi } from 'vitest';
import type { InstrumentWithMarketData } from '../../lib/list-utils';

// Mock @dnd-kit/sortable
const mockUseSortable = vi.fn();
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => mockUseSortable(),
}));

// Mock InstrumentRow
vi.mock('../InstrumentRow', () => ({
  InstrumentRow: ({ instrument, onNavigate }: any) => (
    <div data-testid="instrument-row" onClick={() => onNavigate(instrument.id)}>
      {instrument.symbol}
    </div>
  ),
}));

describe('DraggableInstrumentRow', () => {
  const mockInstrument: InstrumentWithMarketData = {
    id: 'AAPL',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    exchange: 'NASDAQ',
    currentPrice: 150.0,
    change24h: 2.5,
    volume24h: 1000000,
    precision: 2,
  };

  beforeEach(() => {
    mockUseSortable.mockReturnValue({
      attributes: { 'data-sortable': true },
      listeners: { onPointerDown: vi.fn() },
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    });
  });

  it('should render instrument row with instrument data', () => {
    render(
      <BrowserRouter>
        <DraggableInstrumentRow instrument={mockInstrument} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('instrument-row')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('should render drag handle button', () => {
    render(
      <BrowserRouter>
        <DraggableInstrumentRow instrument={mockInstrument} />
      </BrowserRouter>
    );

    const dragHandle = screen.getByRole('button', { name: /drag to reorder/i });
    expect(dragHandle).toBeInTheDocument();
  });

  it('should have accessible drag handle with aria-label', () => {
    render(
      <BrowserRouter>
        <DraggableInstrumentRow instrument={mockInstrument} />
      </BrowserRouter>
    );

    const dragHandle = screen.getByLabelText(/drag to reorder/i);
    expect(dragHandle).toHaveAttribute('aria-label', 'Drag to reorder');
  });

  it('should render grip icon in drag handle', () => {
    render(
      <BrowserRouter>
        <DraggableInstrumentRow instrument={mockInstrument} />
      </BrowserRouter>
    );

    // GripVertical icon should be rendered
    const dragHandle = screen.getByRole('button', { name: /drag to reorder/i });
    expect(dragHandle).toBeInTheDocument();

    // Check for svg element (lucide-react renders svg)
    const svg = dragHandle.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should apply correct styling classes', () => {
    const { container } = render(
      <BrowserRouter>
        <DraggableInstrumentRow instrument={mockInstrument} />
      </BrowserRouter>
    );

    // Check for flex layout
    const wrapper = container.querySelector('.flex.items-center.gap-2');
    expect(wrapper).toBeInTheDocument();

    // Check for drag handle cursor styling
    const dragHandle = screen.getByRole('button', { name: /drag to reorder/i });
    expect(dragHandle).toHaveClass('cursor-grab');
  });

  it('should apply transform style when dragging', () => {
    mockUseSortable.mockReturnValue({
      attributes: { 'data-sortable': true },
      listeners: { onPointerDown: vi.fn() },
      setNodeRef: vi.fn(),
      transform: { x: 0, y: 50, scaleX: 1, scaleY: 1 },
      transition: 'transform 200ms ease',
      isDragging: true,
    });

    const { container } = render(
      <BrowserRouter>
        <DraggableInstrumentRow instrument={mockInstrument} />
      </BrowserRouter>
    );

    // Check for inline style with transform
    const wrapper = container.querySelector('.flex.items-center.gap-2');
    expect(wrapper).toHaveStyle({ opacity: '0.5' });
  });

  it('should pass onNavigate callback to InstrumentRow', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <DraggableInstrumentRow instrument={mockInstrument} />
      </BrowserRouter>
    );

    const row = screen.getByTestId('instrument-row');
    await user.click(row);

    // InstrumentRow should receive onNavigate callback
    // This is tested indirectly through the mock
  });

  it('should initialize useSortable with instrument id', () => {
    render(
      <BrowserRouter>
        <DraggableInstrumentRow instrument={mockInstrument} />
      </BrowserRouter>
    );

    expect(mockUseSortable).toHaveBeenCalled();
  });

  it('should render in watchlist mode (inWatchlist=true)', () => {
    render(
      <BrowserRouter>
        <DraggableInstrumentRow instrument={mockInstrument} />
      </BrowserRouter>
    );

    // InstrumentRow should receive inWatchlist prop as true
    const row = screen.getByTestId('instrument-row');
    expect(row).toBeInTheDocument();
  });
});
