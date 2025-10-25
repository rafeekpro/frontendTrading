import { Menu, Search, User, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header
      role="banner"
      className="flex items-center justify-between gap-4 border-b bg-background px-4 py-3 md:px-6"
    >
      {/* Left section: Hamburger menu + Logo */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Menu"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="text-xl font-bold">TradingPlatform</div>
      </div>

      {/* Center section: Search bar (desktop) */}
      <div className="hidden flex-1 max-w-md md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search markets, assets..."
            disabled
            className="w-full rounded-md border border-input bg-muted px-10 py-2 text-sm"
            aria-label="Search"
          />
        </div>
      </div>

      {/* Right section: Theme toggle + Profile dropdown */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Theme toggle"
          title="Theme toggle (coming soon)"
        >
          <Sun className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Profile menu"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" role="menu">
            <DropdownMenuItem role="menuitem">
              My Account
            </DropdownMenuItem>
            <DropdownMenuItem role="menuitem">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem role="menuitem">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
