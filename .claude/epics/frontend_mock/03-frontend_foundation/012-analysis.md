---
issue: 12
title: "TailwindCSS + shadcn/ui setup"
analyzed: 2025-10-25T22:45:00Z
estimated_hours: 3
parallelization_factor: 0.67
status: READY
blocker: none
unblocked_by: "No dependencies"
---

# Parallel Work Analysis: Issue #12

## ✅ STATUS: READY TO START

This issue has **NO BLOCKERS** and can start immediately.

## Overview

Issue #12 requests setup of TailwindCSS and shadcn/ui for the frontend foundation:
- Install TailwindCSS v3+ with PostCSS configuration
- Initialize shadcn/ui component library
- Create base theme with dark mode support
- Install Button and Card components
- Create sample page for verification

This is a **foundation setup task** that unblocks all future UI development.

## Dependency Chain

```
Issue #12: TailwindCSS + shadcn/ui Setup
├── No dependencies (can start immediately)
└── Blocks: All UI component tasks (Epic 03, Tasks 002-006)
```

## Parallel Streams

This work can be split into 3 parallel streams:

### Stream A: TailwindCSS Installation & Configuration
**Scope**: Install and configure TailwindCSS with PostCSS
**Files**:
- `package.json` (add dependencies)
- `tailwind.config.js` (new - Tailwind configuration)
- `postcss.config.js` (new - PostCSS configuration)
- `src/index.css` (update - add Tailwind directives)
**Agent Type**: tailwindcss-expert
**Can Start**: Immediately
**Estimated Hours**: 1h
**Dependencies**: None

**Tasks**:
1. Install TailwindCSS v3+ and dependencies
   ```bash
   docker compose run --rm app npm install -D tailwindcss postcss autoprefixer
   ```
2. Initialize Tailwind config
   ```bash
   docker compose run --rm app npx tailwindcss init -p
   ```
3. Configure content paths in tailwind.config.js
4. Add Tailwind directives to src/index.css
5. Configure theme extensions (colors, fonts, spacing)

**Context7 Queries**:
- `/tailwindcss/tailwindcss/v3-setup` - Latest Tailwind setup
- `/tailwindcss/tailwindcss/postcss-integration` - PostCSS configuration
- `/tailwindcss/tailwindcss/content-configuration` - Content paths

### Stream B: shadcn/ui Initialization
**Scope**: Initialize shadcn/ui and install base components
**Files**:
- `components.json` (new - shadcn/ui configuration)
- `src/components/ui/` (new directory - UI components)
- `src/lib/utils.ts` (new - utility functions for shadcn)
- `package.json` (add clsx, tailwind-merge)
**Agent Type**: react-ui-expert
**Can Start**: After Stream A completes (needs Tailwind)
**Estimated Hours**: 1.5h
**Dependencies**: Stream A (Tailwind must be configured)

**Tasks**:
1. Install shadcn/ui dependencies
   ```bash
   docker compose run --rm app npm install clsx tailwind-merge class-variance-authority
   docker compose run --rm app npm install -D @types/node
   ```
2. Initialize shadcn/ui
   ```bash
   docker compose run --rm app npx shadcn-ui@latest init
   ```
3. Configure components.json (TypeScript paths, style: default)
4. Install Button component
   ```bash
   docker compose run --rm app npx shadcn-ui@latest add button
   ```
5. Install Card component
   ```bash
   docker compose run --rm app npx shadcn-ui@latest add card
   ```
6. Create utils.ts for cn() utility

**Context7 Queries**:
- `/shadcn/ui/installation` - shadcn/ui setup guide
- `/shadcn/ui/components` - Component installation
- `/shadcn/ui/theming` - Theme customization

### Stream C: Theme Configuration & Testing
**Scope**: Configure dark mode, create theme, and build sample page
**Files**:
- `src/index.css` (CSS custom properties for theme)
- `src/components/ThemeProvider.tsx` (new - dark mode provider)
- `src/pages/ComponentShowcase.tsx` (new - sample page)
- `src/App.tsx` (update - add ThemeProvider)
- `tailwind.config.js` (update - dark mode strategy)
**Agent Type**: react-ui-expert
**Can Start**: Parallel with Stream B (after Stream A)
**Estimated Hours**: 1.5h
**Dependencies**: Stream A (Tailwind configured)

**Tasks**:
1. Configure dark mode in tailwind.config.js
   ```javascript
   module.exports = {
     darkMode: ["class"],
     // ...
   }
   ```
2. Add CSS variables for theme colors
   ```css
   @layer base {
     :root { --background: ...; --foreground: ...; }
     .dark { --background: ...; --foreground: ...; }
   }
   ```
3. Create ThemeProvider component (optional, or use shadcn's approach)
4. Build ComponentShowcase page with Button and Card examples
5. Test dark mode toggle
6. Verify responsive design

**Context7 Queries**:
- `/tailwindcss/tailwindcss/dark-mode` - Dark mode setup
- `/shadcn/ui/dark-mode` - shadcn dark mode integration
- `/react/react/context-api` - Theme provider pattern

## Coordination Points

### Shared Files
- `package.json` - Stream A and B both add dependencies (coordinate versions)
- `tailwind.config.js` - Stream A creates, Stream C updates for dark mode
- `src/index.css` - Stream A adds directives, Stream C adds CSS variables

### Sequential Requirements
1. **MUST COMPLETE FIRST**: Stream A (TailwindCSS base)
2. Streams B and C can run in parallel after Stream A
3. All streams complete before creating sample page
4. Sample page serves as integration verification

### Integration Points
- Stream B (shadcn) depends on Stream A (Tailwind) for utility classes
- Stream C (theme) needs Stream A (Tailwind) for dark mode support
- Stream C (sample page) needs Stream B (components) for Button/Card

## Conflict Risk Assessment

**✅ LOW RISK** - Once Stream A completes:
- Streams B and C work on different files mostly
- Clear ownership: B = components/, C = theme + sample page
- package.json coordination needed (but one-time install)

**⚠️ MEDIUM RISK** - Configuration coordination:
- tailwind.config.js may need updates from both Stream A and C
- Recommend: Stream A creates comprehensive config, Stream C only adds dark mode
- src/index.css needs coordinated updates (directives vs. CSS vars)

**✅ NO HIGH RISK** - No blockers, clear dependencies

## Parallelization Strategy

**Recommended Approach**: Sequential then Parallel

1. **Phase 1**: Stream A (TailwindCSS) - 1h sequential
2. **Phase 2**: Streams B (shadcn) + C (theme) - 1.5h parallel
3. **Phase 3**: Integration verification - included in Phase 2

**Why Hybrid**: Tailwind must be installed first (foundation), then shadcn and theme can be configured in parallel since they touch different files.

## Expected Timeline

### With parallel execution:
- Phase 1: 1 hour (Stream A sequential)
- Phase 2: 1.5 hours (Streams B+C parallel)
- **Wall time**: 2.5 hours
- **Total work**: 4 hours
- **Efficiency gain**: 37.5%

### Without parallel execution (sequential):
- **Wall time**: 4 hours

## Configuration Details

### Tailwind Configuration Needed

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more colors
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### shadcn/ui Configuration

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### CSS Variables for Theme

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* ... more variables */
  }
}
```

## Sample Page Structure

```typescript
// src/pages/ComponentShowcase.tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export function ComponentShowcase() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold">Component Showcase</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="flex gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Cards</h2>
        <Card>
          <CardHeader>
            <CardTitle>Sample Card</CardTitle>
            <CardDescription>This is a shadcn/ui card component</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here with Tailwind styling.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
```

## Notes

### Critical Path
1. TailwindCSS MUST be installed and configured first
2. shadcn/ui depends on Tailwind utilities
3. Theme configuration depends on both Tailwind and shadcn

### Risk Mitigation
- Test Tailwind setup before proceeding to shadcn
- Verify PostCSS compilation works
- Ensure TypeScript paths resolve correctly (@/components, @/lib)
- Test dark mode toggle before finalizing theme

### TDD Considerations
- Tailwind setup: Visual verification (no unit tests needed)
- Component installation: Import and render test
- Dark mode: Toggle state test
- Sample page: Snapshot test for regression detection

### Performance Requirements
- Tailwind purge should remove unused styles in production
- CSS file size should be minimal (<50KB gzipped)
- Hot reload should work during development

### Future Enhancements (Not in Scope)
- Additional shadcn/ui components (Dialog, Dropdown, etc.)
- Custom theme colors for trading UI (green/red for P&L)
- Advanced dark mode with system preference detection
- Component documentation with Storybook

**Recommendation**: Start with Stream A (TailwindCSS installation) using `@tailwindcss-expert` agent. Once complete, run Streams B (shadcn/ui) and C (theme) in parallel using `@react-ui-expert` agents.
