import { useState, useCallback } from 'react';

export interface BulkSelectionHook<T> {
  selectedIds: number[];
  isAllSelected: boolean;
  selectAll: (items: T[]) => void;
  toggleSelection: (id: number) => void;
  clearSelection: () => void;
}

export const useBulkSelection = <T extends { id: number }>(
  items: T[]
): BulkSelectionHook<T> => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectAll = useCallback((items: T[]) => {
    setSelectedIds(items.map(item => item.id));
  }, []);

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  return {
    selectedIds,
    isAllSelected,
    selectAll,
    toggleSelection,
    clearSelection,
  };
};