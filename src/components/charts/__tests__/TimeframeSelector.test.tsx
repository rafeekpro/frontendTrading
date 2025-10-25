/**
 * TimeframeSelector Component Tests (RED PHASE)
 * Tests for timeframe selection button group
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TimeframeSelector } from '../TimeframeSelector';
import type { Timeframe } from '@/types/trading';

describe('TimeframeSelector', () => {
  const TIMEFRAMES: Timeframe[] = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];

  describe('Component Rendering', () => {
    it('should render all timeframe buttons', () => {
      render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      TIMEFRAMES.forEach((timeframe) => {
        expect(screen.getByRole('button', { name: timeframe })).toBeInTheDocument();
      });
    });

    it('should render timeframes in correct order', () => {
      render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
      expect(buttons[0]).toHaveTextContent('M1');
      expect(buttons[1]).toHaveTextContent('M5');
      expect(buttons[2]).toHaveTextContent('M15');
      expect(buttons[3]).toHaveTextContent('H1');
      expect(buttons[4]).toHaveTextContent('H4');
      expect(buttons[5]).toHaveTextContent('D1');
    });

    it('should render as button group with role', () => {
      render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      const buttonGroup = screen.getByRole('group', { name: /timeframe/i });
      expect(buttonGroup).toBeInTheDocument();
    });
  });

  describe('Selected State', () => {
    it('should highlight the selected timeframe', () => {
      render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      const h1Button = screen.getByRole('button', { name: 'H1' });
      expect(h1Button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should not highlight non-selected timeframes', () => {
      render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      const m1Button = screen.getByRole('button', { name: 'M1' });
      const m5Button = screen.getByRole('button', { name: 'M5' });
      expect(m1Button).toHaveAttribute('aria-pressed', 'false');
      expect(m5Button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should apply visual styling to selected button', () => {
      const { container } = render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      const h1Button = screen.getByRole('button', { name: 'H1' });
      // Selected button should have different background (testing via class)
      expect(h1Button).toHaveClass(/bg-blue/);
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when a timeframe is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimeframeSelector
          selected="H1"
          onChange={onChange}
        />
      );

      const m5Button = screen.getByRole('button', { name: 'M5' });
      await user.click(m5Button);

      expect(onChange).toHaveBeenCalledWith('M5');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with correct timeframe for each button', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimeframeSelector
          selected="H1"
          onChange={onChange}
        />
      );

      for (const timeframe of TIMEFRAMES) {
        const button = screen.getByRole('button', { name: timeframe });
        await user.click(button);
        expect(onChange).toHaveBeenLastCalledWith(timeframe);
      }

      expect(onChange).toHaveBeenCalledTimes(TIMEFRAMES.length);
    });

    it('should allow clicking already selected timeframe', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimeframeSelector
          selected="H1"
          onChange={onChange}
        />
      );

      const h1Button = screen.getByRole('button', { name: 'H1' });
      await user.click(h1Button);

      // Should still call onChange even if already selected
      expect(onChange).toHaveBeenCalledWith('H1');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard Enter key', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimeframeSelector
          selected="H1"
          onChange={onChange}
        />
      );

      const m5Button = screen.getByRole('button', { name: 'M5' });
      m5Button.focus();
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith('M5');
    });

    it('should support keyboard Space key', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimeframeSelector
          selected="H1"
          onChange={onChange}
        />
      );

      const m15Button = screen.getByRole('button', { name: 'M15' });
      m15Button.focus();
      await user.keyboard(' ');

      expect(onChange).toHaveBeenCalledWith('M15');
    });

    it('should allow Tab navigation between buttons', async () => {
      const user = userEvent.setup();

      render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      const m1Button = screen.getByRole('button', { name: 'M1' });
      const m5Button = screen.getByRole('button', { name: 'M5' });

      m1Button.focus();
      expect(document.activeElement).toBe(m1Button);

      await user.keyboard('{Tab}');
      expect(document.activeElement).toBe(m5Button);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible group label', () => {
      render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      const buttonGroup = screen.getByRole('group', { name: /timeframe/i });
      expect(buttonGroup).toHaveAttribute('aria-label');
    });

    it('should have accessible button labels', () => {
      render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      TIMEFRAMES.forEach((timeframe) => {
        const button = screen.getByRole('button', { name: timeframe });
        expect(button).toHaveAccessibleName();
      });
    });

    it('should use aria-pressed for toggle state', () => {
      render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      const h1Button = screen.getByRole('button', { name: 'H1' });
      const m1Button = screen.getByRole('button', { name: 'M1' });

      expect(h1Button).toHaveAttribute('aria-pressed', 'true');
      expect(m1Button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Styling and Design', () => {
    it('should apply button group container styling', () => {
      const { container } = render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      const buttonGroup = container.querySelector('[role="group"]');
      expect(buttonGroup).toHaveClass(/flex/);
    });

    it('should apply dark theme styling to buttons', () => {
      render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        // Should have dark background when not selected
        if (button.getAttribute('aria-pressed') === 'false') {
          expect(button).toHaveClass(/bg-gray/);
        }
      });
    });

    it('should apply hover effects', () => {
      render(
        <TimeframeSelector
          selected="H1"
          onChange={vi.fn()}
        />
      );

      const m1Button = screen.getByRole('button', { name: 'M1' });
      expect(m1Button).toHaveClass(/hover/);
    });
  });
});
