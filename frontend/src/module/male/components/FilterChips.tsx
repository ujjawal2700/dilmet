// @ts-nocheck
import { MaterialSymbol } from '../types/material-symbol';
import type { FilterType } from '../types/male.types';

interface FilterChipsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { id: FilterType; label: string; showOnlineIndicator?: boolean }[] = [
  { id: 'all', label: 'All' },
  { id: 'online', label: 'Online', showOnlineIndicator: true },
  { id: 'new', label: 'New' },
  { id: 'popular', label: 'Popular' },
];

export const FilterChips = ({ activeFilter, onFilterChange }: FilterChipsProps) => {
  return (
    <div className="px-4 pb-3 pt-1">
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all active:scale-95 ${
                isActive
                  ? 'bg-primary shadow-lg shadow-primary/25 text-white'
                  : 'bg-white dark:bg-[#342d18] border border-gray-200 dark:border-transparent text-slate-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#3d2a1a]'
              }`}
            >
              {filter.showOnlineIndicator && (
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
              )}
              <p className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                {filter.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

