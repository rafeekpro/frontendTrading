import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  ShoppingCart,
  Settings,
  Menu,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

// Navigation items configuration
const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Instruments',
    href: '/instruments',
    icon: TrendingUp,
  },
  {
    name: 'Watchlist',
    href: '/watchlist',
    icon: Briefcase,
  },
];

// Constants
const SIDEBAR_WIDTH = 'w-60';

const NAV_LINK_CLASSES = {
  base: 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors',
  hover: 'hover:bg-accent hover:text-accent-foreground',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  active: 'bg-accent text-accent-foreground',
} as const;

interface NavLinkProps {
  item: NavigationItem;
  isActive: boolean;
  onClick?: () => void;
}

function NavLink({ item, isActive, onClick }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        NAV_LINK_CLASSES.base,
        NAV_LINK_CLASSES.hover,
        NAV_LINK_CLASSES.focus,
        isActive && NAV_LINK_CLASSES.active
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-5 w-5" aria-hidden="true" role="img" />
      <span>{item.name}</span>
    </Link>
  );
}

interface SidebarContentProps {
  onNavigate?: () => void;
  className?: string;
}

function SidebarContent({ onNavigate, className }: SidebarContentProps) {
  const location = useLocation();

  return (
    <nav className={cn('flex flex-col gap-2', className)} aria-label="Main navigation">
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <NavLink
            key={item.name}
            item={item}
            isActive={isActive}
            onClick={onNavigate}
          />
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = React.useState(false);

  const handleMobileNavigate = React.useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:border-r md:bg-background md:p-4">
        <SidebarContent className={SIDEBAR_WIDTH} />
      </aside>

      {/* Mobile Sidebar (Sheet/Drawer) */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-4">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation links for the trading platform
            </SheetDescription>
            <SidebarContent className={SIDEBAR_WIDTH} onNavigate={handleMobileNavigate} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
