import { useTheme } from '../components/ThemeProvider';

// Reusable section wrapper component
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

// Color palette item component
interface ColorItemProps {
  label: string;
  className: string;
  textClassName?: string;
}

function ColorItem({ label, className, textClassName = 'text-foreground' }: ColorItemProps) {
  return (
    <div className={`p-4 rounded-lg ${className}`}>
      <div className={`text-sm font-medium ${textClassName}`}>{label}</div>
      <div className={`text-xs ${textClassName} opacity-80`}>{className.split(' ')[0]}</div>
    </div>
  );
}

/**
 * ComponentShowcase page demonstrates UI components and theme functionality
 * This page will be enhanced with shadcn/ui Button and Card components once available
 */
export default function ComponentShowcase() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="container mx-auto p-8 space-y-8" role="main">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Component Showcase</h1>
        <p className="text-muted-foreground">
          Demonstration of theme functionality and UI components
        </p>
      </div>

      {/* Theme Toggle Section */}
      <Section title="Theme Controls">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            aria-label="Toggle theme"
          >
            Toggle Theme
          </button>
          <span className="text-foreground">
            Current theme: <strong className="capitalize">{theme}</strong>
          </span>
        </div>
      </Section>

      {/* Buttons Section - Placeholder for shadcn/ui Button components */}
      <Section title="Buttons">
        <div className="p-6 border border-border rounded-lg bg-card">
          <p className="text-muted-foreground">
            Button components will be displayed here once shadcn/ui Button is installed.
          </p>
          <div className="mt-4 flex gap-4 flex-wrap">
            {/* Temporary native buttons to demonstrate styling */}
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Default
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
              Secondary
            </button>
            <button className="px-4 py-2 border border-border bg-background text-foreground rounded-md hover:bg-accent transition-colors">
              Outline
            </button>
            <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors">
              Destructive
            </button>
          </div>
        </div>
      </Section>

      {/* Cards Section - Placeholder for shadcn/ui Card components */}
      <Section title="Cards">
        <div className="p-6 border border-border rounded-lg bg-card">
          <p className="text-muted-foreground">
            Card components will be displayed here once shadcn/ui Card is installed.
          </p>
          {/* Temporary card-like div to demonstrate styling */}
          <div className="mt-4 border border-border rounded-lg bg-card p-6 space-y-2">
            <h3 className="text-xl font-semibold text-card-foreground">Sample Card</h3>
            <p className="text-sm text-muted-foreground">
              This is a placeholder demonstrating card styling
            </p>
            <p className="text-card-foreground">
              Card content goes here with proper theming applied.
            </p>
          </div>
        </div>
      </Section>

      {/* Color Palette Display */}
      <Section title="Color Palette">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorItem
            label="Background"
            className="bg-background border border-border"
            textClassName="text-foreground"
          />
          <ColorItem
            label="Primary"
            className="bg-primary"
            textClassName="text-primary-foreground"
          />
          <ColorItem
            label="Secondary"
            className="bg-secondary"
            textClassName="text-secondary-foreground"
          />
          <ColorItem
            label="Destructive"
            className="bg-destructive"
            textClassName="text-destructive-foreground"
          />
          <ColorItem
            label="Muted"
            className="bg-muted"
            textClassName="text-muted-foreground"
          />
          <ColorItem
            label="Accent"
            className="bg-accent"
            textClassName="text-accent-foreground"
          />
          <ColorItem
            label="Card"
            className="bg-card border border-border"
            textClassName="text-card-foreground"
          />
          <ColorItem
            label="Popover"
            className="bg-popover border border-border"
            textClassName="text-popover-foreground"
          />
        </div>
      </Section>
    </main>
  );
}
