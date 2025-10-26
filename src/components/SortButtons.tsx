/**
 * SortButtons Component
 * Column header sort controls with ascending/descending toggle
 */

import { ChevronUp, ChevronDown } from 'lucide-react';
import type { SortColumn, SortDirection } from '../lib/list-utils';

export interface SortButtonsProps {
  /**
   * Array of column definitions
   */
  columns: Array<{ key: SortColumn; label: string }>;

  /**
   * Currently active sort column
   */
  sortColumn: SortColumn;

  /**
   * Current sort direction
   */
  sortDirection: SortDirection;

  /**
   * Callback when sort changes
   * @param column - The column to sort by
   * @param direction - The sort direction (asc or desc)
   */
  onSortChange: (column: SortColumn, direction: SortDirection) => void;
}

/**
 * SortButtons - Column header sort controls
 *
 * Features:
 * - Visual indicator for active sort column
 * - Ascending/descending icons
 * - Click to toggle sort direction
 * - Squaber-style dark theme design
 * - Keyboard accessible
 *
 * Behavior:
 * - Clicking inactive column: sorts ascending
 * - Clicking active ascending: toggles to descending
 * - Clicking active descending: toggles to ascending
 *
 * @example
 * ```tsx
 * const [sort, setSort] = useState({ column: 'symbol', direction: 'asc' });
 *
 * const columns = [
 *   { key: 'symbol', label: 'Symbol' },
 *   { key: 'name', label: 'Name' },
 *   { key: 'price', label: 'Price' },
 * ];
 *
 * <SortButtons
 *   columns={columns}
 *   sortColumn={sort.column}
 *   sortDirection={sort.direction}
 *   onSortChange={(column, direction) => setSort({ column, direction })}
 * />
 * ```
 */
export function SortButtons({
  columns,
  sortColumn,
  sortDirection,
  onSortChange,
}: SortButtonsProps) {
  const handleColumnClick = (column: SortColumn) => {
    if (column === sortColumn) {
      // Toggle direction for active column
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      onSortChange(column, newDirection);
    } else {
      // Set new column with ascending direction
      onSortChange(column, 'asc');
    }
  };

  return (
    <div className="flex gap-2 border-b border-gray-700 bg-gray-800 p-3">
      {columns.map((col) => {
        const isActive = col.key === sortColumn;
        const showAscending = isActive && sortDirection === 'asc';
        const showDescending = isActive && sortDirection === 'desc';

        return (
          <button
            key={col.key}
            onClick={() => handleColumnClick(col.key)}
            aria-label={
              isActive
                ? `${col.label}, sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}`
                : `Sort by ${col.label}`
            }
            className={`
              flex items-center gap-1 rounded px-3 py-2
              text-sm font-medium transition-colors
              hover:bg-gray-700
              ${
                isActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-800 text-gray-300'
              }
            `}
          >
            {col.label}
            {showAscending && <ChevronUp size={16} aria-hidden="true" />}
            {showDescending && <ChevronDown size={16} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
