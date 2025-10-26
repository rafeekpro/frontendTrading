import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  describe('strength calculation', () => {
    it('should show "weak" strength for empty password', () => {
      render(<PasswordStrengthIndicator password="" />);

      expect(screen.getByText(/weak/i)).toBeInTheDocument();
    });

    it('should show "weak" strength for password < 8 characters', () => {
      render(<PasswordStrengthIndicator password="Short1" />);

      expect(screen.getByText(/weak/i)).toBeInTheDocument();
    });

    it('should show "medium" strength for password without uppercase but 8+ chars', () => {
      render(<PasswordStrengthIndicator password="lowercase123" />);

      // Has 8+ chars, lowercase, and number (missing uppercase) = medium
      expect(screen.getByText(/medium/i)).toBeInTheDocument();
    });

    it('should show "medium" strength for password without lowercase but 8+ chars', () => {
      render(<PasswordStrengthIndicator password="UPPERCASE123" />);

      // Has 8+ chars, uppercase, and number (missing lowercase) = medium
      expect(screen.getByText(/medium/i)).toBeInTheDocument();
    });

    it('should show "medium" strength for password without number but 8+ chars', () => {
      render(<PasswordStrengthIndicator password="NoNumbersHere" />);

      // Has 8+ chars, uppercase and lowercase (missing number) = medium
      expect(screen.getByText(/medium/i)).toBeInTheDocument();
    });

    it('should show "weak" strength for password missing multiple requirements', () => {
      render(<PasswordStrengthIndicator password="nocaps" />);

      // Has lowercase only, < 8 chars, no uppercase, no number = weak
      expect(screen.getByText(/weak/i)).toBeInTheDocument();
    });

    it('should show "strong" strength for password meeting all requirements', () => {
      render(<PasswordStrengthIndicator password="StrongPass123" />);

      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });
  });

  describe('visual indicator', () => {
    it('should display progress bar or visual element', () => {
      const { container } = render(<PasswordStrengthIndicator password="Test123" />);

      // Check for progress bar, colored indicator, or similar visual element
      const indicator = container.querySelector('[data-testid="strength-indicator"]');
      expect(indicator).toBeInTheDocument();
    });

    it('should apply weak styling for weak passwords', () => {
      const { container } = render(<PasswordStrengthIndicator password="weak" />);

      const indicator = container.querySelector('[data-testid="strength-indicator"]');
      expect(indicator).toHaveClass(/weak|red|danger/i);
    });

    it('should apply medium styling for medium passwords', () => {
      const { container } = render(<PasswordStrengthIndicator password="lowercase123" />);

      const indicator = container.querySelector('[data-testid="strength-indicator"]');
      expect(indicator).toHaveClass(/medium|yellow|warning/i);
    });

    it('should apply strong styling for strong passwords', () => {
      const { container } = render(<PasswordStrengthIndicator password="StrongPass123" />);

      const indicator = container.querySelector('[data-testid="strength-indicator"]');
      expect(indicator).toHaveClass(/strong|green|success/i);
    });
  });

  describe('requirements checklist', () => {
    it('should display password requirements', () => {
      render(<PasswordStrengthIndicator password="" />);

      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/lowercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/number/i)).toBeInTheDocument();
    });

    it('should mark length requirement as met when password is 8+ chars', () => {
      const { container } = render(<PasswordStrengthIndicator password="12345678" />);

      const lengthRequirement = screen.getByText(/at least 8 characters/i).closest('li');
      expect(lengthRequirement).toHaveClass(/met|valid|checked|text-green/i);
    });

    it('should mark uppercase requirement as met when password has uppercase', () => {
      const { container } = render(<PasswordStrengthIndicator password="Uppercase" />);

      const uppercaseRequirement = screen.getByText(/uppercase letter/i).closest('li');
      expect(uppercaseRequirement).toHaveClass(/met|valid|checked|text-green/i);
    });

    it('should mark lowercase requirement as met when password has lowercase', () => {
      const { container } = render(<PasswordStrengthIndicator password="lowercase" />);

      const lowercaseRequirement = screen.getByText(/lowercase letter/i).closest('li');
      expect(lowercaseRequirement).toHaveClass(/met|valid|checked|text-green/i);
    });

    it('should mark number requirement as met when password has number', () => {
      const { container } = render(<PasswordStrengthIndicator password="123" />);

      const numberRequirement = screen.getByText(/number/i).closest('li');
      expect(numberRequirement).toHaveClass(/met|valid|checked|text-green/i);
    });

    it('should mark all requirements as unmet for empty password', () => {
      render(<PasswordStrengthIndicator password="" />);

      const lengthReq = screen.getByText(/at least 8 characters/i).closest('li');
      const uppercaseReq = screen.getByText(/uppercase letter/i).closest('li');
      const lowercaseReq = screen.getByText(/lowercase letter/i).closest('li');
      const numberReq = screen.getByText(/number/i).closest('li');

      expect(lengthReq).not.toHaveClass(/met|valid|checked|text-green/i);
      expect(uppercaseReq).not.toHaveClass(/met|valid|checked|text-green/i);
      expect(lowercaseReq).not.toHaveClass(/met|valid|checked|text-green/i);
      expect(numberReq).not.toHaveClass(/met|valid|checked|text-green/i);
    });
  });

  describe('real-time feedback', () => {
    it('should update strength when password prop changes', () => {
      const { rerender } = render(<PasswordStrengthIndicator password="weak" />);
      expect(screen.getByText(/weak/i)).toBeInTheDocument();

      rerender(<PasswordStrengthIndicator password="StrongPass123" />);
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });

    it('should update requirements checklist when password prop changes', () => {
      const { rerender } = render(<PasswordStrengthIndicator password="" />);

      const numberReq = screen.getByText(/number/i).closest('li');
      expect(numberReq).not.toHaveClass(/met|valid|checked|text-green/i);

      rerender(<PasswordStrengthIndicator password="123" />);
      expect(numberReq).toHaveClass(/met|valid|checked|text-green/i);
    });
  });

  describe('accessibility', () => {
    it('should have appropriate ARIA labels', () => {
      render(<PasswordStrengthIndicator password="Test123" />);

      const component = screen.getByRole('region', { name: /password strength/i });
      expect(component).toBeInTheDocument();
    });

    it('should announce strength level for screen readers', () => {
      render(<PasswordStrengthIndicator password="StrongPass123" />);

      const strengthText = screen.getByText(/strong/i);
      expect(strengthText).toHaveAttribute('aria-live', 'polite');
    });
  });
});
