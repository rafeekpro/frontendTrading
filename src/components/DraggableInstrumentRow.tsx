/**
 * DraggableInstrumentRow Component
 * GREEN Phase: Minimum implementation to pass tests
 *
 * Wraps InstrumentRow with drag-and-drop functionality
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { GripVertical } from 'lucide-react';
import { InstrumentRow } from './InstrumentRow';
import type { InstrumentWithMarketData } from '../lib/list-utils';

export interface DraggableInstrumentRowProps {
  /**
   * Instrument with market data
   */
  instrument: InstrumentWithMarketData;
}

/**
 * DraggableInstrumentRow - Wraps InstrumentRow with drag-and-drop
 *
 * Features:
 * - Drag handle with grip icon
 * - Visual feedback during drag (opacity change)
 * - Smooth transitions
 * - Accessibility support
 * - Integrates with @dnd-kit/sortable
 *
 * @example
 * ```tsx
 * <DndContext onDragEnd={handleDragEnd}>
 *   <SortableContext items={watchlist}>
 *     {instruments.map(instrument => (
 *       <DraggableInstrumentRow key={instrument.id} instrument={instrument} />
 *     ))}
 *   </SortableContext>
 * </DndContext>
 * ```
 */
export function DraggableInstrumentRow({ instrument }: DraggableInstrumentRowProps) {
  const navigate = useNavigate();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: instrument.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleNavigate = (id: string) => {
    navigate(`/instrument/${id}`);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white flex-shrink-0 transition-colors"
        aria-label="Drag to reorder"
        type="button"
      >
        <GripVertical className="w-5 h-5" aria-hidden="true" />
      </button>
      <div className="flex-1">
        <InstrumentRow instrument={instrument} onNavigate={handleNavigate} inWatchlist={true} />
      </div>
    </div>
  );
}
