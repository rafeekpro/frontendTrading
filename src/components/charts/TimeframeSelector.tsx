/**
 * TimeframeSelector Component
 * Button group for selecting chart timeframes
 */

import { type Timeframe } from '@/types/trading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimeframeSelectorProps {
  /** Currently selected timeframe */
  selected: Timeframe;
  /** Callback when timeframe is changed */
  onChange: (timeframe: Timeframe) => void;
}

const TIMEFRAMES: Timeframe[] = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];

/**
 * Get button styling based on selection state
 */
function getButtonClassName(isSelected: boolean): string {
  const baseStyles = 'px-3 py-1.5 text-sm font-medium rounded transition-all';
  const selectedStyles = 'bg-blue-600 text-white hover:bg-blue-700';
  const unselectedStyles = 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white';

  return cn(baseStyles, isSelected ? selectedStyles : unselectedStyles);
}

export function TimeframeSelector({ selected, onChange }: TimeframeSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Timeframe selector"
      className="flex gap-1 rounded-lg bg-gray-900/50 p-1"
    >
      {TIMEFRAMES.map((timeframe) => {
        const isSelected = timeframe === selected;
        return (
          <Button
            key={timeframe}
            onClick={() => onChange(timeframe)}
            aria-pressed={isSelected}
            className={getButtonClassName(isSelected)}
            variant="ghost"
          >
            {timeframe}
          </Button>
        );
      })}
    </div>
  );
}
