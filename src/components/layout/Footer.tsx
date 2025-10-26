interface FooterLink {
  label: string;
  href: string;
}

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'API Docs', href: '/api-docs' },
  { label: 'Support', href: '/support' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const version = import.meta.env.VITE_APP_VERSION || '0.0.0';

  return (
    <footer
      role="contentinfo"
      className="bg-background px-4 py-6 md:px-6"
    >
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        {/* Copyright section */}
        <div className="text-center text-sm text-muted-foreground md:text-left">
          © {currentYear} TradingPlatform. All rights reserved.
        </div>

        {/* Links section */}
        <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Version section */}
        <div className="text-center text-sm text-muted-foreground md:text-right">
          v{version}
        </div>
      </div>
    </footer>
  );
}
