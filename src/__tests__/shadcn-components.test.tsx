/**
 * TDD RED PHASE: Tests for shadcn/ui components
 * These tests MUST FAIL until shadcn/ui components are installed
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

describe('shadcn/ui Button Component', () => {
  it('should render Button component', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should render Button with variant prop', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button', { name: /secondary button/i });
    expect(button).toBeInTheDocument();
  });

  it('should render Button with size prop', () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByRole('button', { name: /large button/i });
    expect(button).toBeInTheDocument();
  });
});

describe('shadcn/ui Card Component', () => {
  it('should render Card component with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card Title</CardTitle>
          <CardDescription>Test card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content goes here</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Test Card Title')).toBeInTheDocument();
    expect(screen.getByText('Test card description')).toBeInTheDocument();
    expect(screen.getByText('Card content goes here')).toBeInTheDocument();
  });

  it('should render Card with custom className', () => {
    const { container } = render(
      <Card className="custom-card">
        <CardContent>Content</CardContent>
      </Card>
    );

    const card = container.querySelector('.custom-card');
    expect(card).toBeInTheDocument();
  });
});

describe('shadcn/ui Component Integration', () => {
  it('should render Button inside Card', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card with Button</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Action Button</Button>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Card with Button')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
  });
});
