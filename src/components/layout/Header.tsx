import { Menu, Search, User, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
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
            {user && (
              <>
                <div className="px-2 py-1.5 text-sm font-semibold">
                  {user.name}
                </div>
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {user.email}
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem role="menuitem">
              My Account
            </DropdownMenuItem>
            <DropdownMenuItem role="menuitem">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              role="menuitem"
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
