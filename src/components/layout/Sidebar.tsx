import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  ShoppingCart,
  Settings,
  Menu,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Navigation items configuration
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Portfolio',
    href: '/portfolio',
    icon: Briefcase,
  },
  {
    name: 'Markets',
    href: '/markets',
    icon: TrendingUp,
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface NavLinkProps {
  item: typeof navigationItems[0];
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
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive && 'bg-accent text-accent-foreground'
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

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:border-r md:bg-background md:p-4">
        <SidebarContent className="w-60" />
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
            <SidebarContent className="w-60" onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
