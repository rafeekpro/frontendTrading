import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useState, useEffect } from 'react';

export interface SearchBarProps {
  /**
   * Current search value
   */
  value: string;

  /**
   * Callback when search value changes (debounced internally)
   */
  onChange: (value: string) => void;

  /**
   * Placeholder text for the search input
   * @default "Search instruments..."
   */
  placeholder?: string;
}

/**
 * SearchBar component with debounced input and clear functionality
 *
 * Features:
 * - Search icon on the left
 * - Debounced onChange (300ms delay)
 * - Clear button (X) when value exists
 * - Accessible with ARIA labels
 * - Squaber-style dark theme design
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 *
 * <SearchBar
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Search instruments"
 * />
 * ```
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search instruments...',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync external value changes to local state
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search
          className="h-5 w-5 text-gray-400"
          aria-hidden="true"
          data-testid="search-icon"
        />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={localValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        aria-label="Search instruments"
        className="block w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
      />

      {/* Clear Button */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
