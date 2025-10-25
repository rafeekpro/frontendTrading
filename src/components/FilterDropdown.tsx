import { Filter, Star, DollarSign, Bitcoin, TrendingUp, List } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

/**
 * Filter options for instrument types
 */
export type FilterOption = 'all' | 'favorites' | 'forex' | 'crypto' | 'stocks';

export interface FilterDropdownProps {
  /**
   * Currently selected filter option
   */
  selected: FilterOption;

  /**
   * Callback when filter option changes
   */
  onChange: (option: FilterOption) => void;
}

/**
 * Filter dropdown component for selecting instrument types
 *
 * Features:
 * - Dropdown menu using shadcn/ui DropdownMenu
 * - Options: All, Favorites, Forex, Crypto, Stocks
 * - Icons for each option
 * - Keyboard navigation (built into shadcn)
 * - Squaber-style dark theme design
 *
 * @example
 * ```tsx
 * const [filter, setFilter] = useState<FilterOption>('all');
 *
 * <FilterDropdown
 *   selected={filter}
 *   onChange={setFilter}
 * />
 * ```
 */
export function FilterDropdown({ selected, onChange }: FilterDropdownProps) {
  const filterLabels: Record<FilterOption, string> = {
    all: 'All Instruments',
    favorites: 'Favorites',
    forex: 'Forex',
    crypto: 'Crypto',
    stocks: 'Stocks',
  };

  const filterIcons: Record<FilterOption, React.ReactNode> = {
    all: <List className="h-4 w-4" aria-hidden="true" />,
    favorites: <Star className="h-4 w-4" aria-hidden="true" />,
    forex: <DollarSign className="h-4 w-4" aria-hidden="true" />,
    crypto: <Bitcoin className="h-4 w-4" aria-hidden="true" />,
    stocks: <TrendingUp className="h-4 w-4" aria-hidden="true" />,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-gray-700 bg-gray-800 text-white hover:bg-gray-700 hover:text-white dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          aria-label="Filter instruments by type"
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          {filterLabels[selected]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-gray-700 bg-gray-800 text-white dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        <DropdownMenuRadioGroup value={selected} onValueChange={(value) => onChange(value as FilterOption)}>
          <DropdownMenuRadioItem
            value="all"
            className="gap-2 focus:bg-gray-700 focus:text-white dark:focus:bg-gray-700"
          >
            {filterIcons.all}
            {filterLabels.all}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="favorites"
            className="gap-2 focus:bg-gray-700 focus:text-white dark:focus:bg-gray-700"
          >
            {filterIcons.favorites}
            {filterLabels.favorites}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="forex"
            className="gap-2 focus:bg-gray-700 focus:text-white dark:focus:bg-gray-700"
          >
            {filterIcons.forex}
            {filterLabels.forex}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="crypto"
            className="gap-2 focus:bg-gray-700 focus:text-white dark:focus:bg-gray-700"
          >
            {filterIcons.crypto}
            {filterLabels.crypto}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="stocks"
            className="gap-2 focus:bg-gray-700 focus:text-white dark:focus:bg-gray-700"
          >
            {filterIcons.stocks}
            {filterLabels.stocks}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
