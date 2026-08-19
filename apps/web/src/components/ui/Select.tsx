import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const selectSizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ className, options, value, onChange, placeholder = 'Select...', searchable = false, disabled, error, label, size = 'md', ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(o => o.value === value);
    const filteredOptions = options.filter(o =>
      o.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
      if (!open) { setSearch(''); setHighlightedIndex(-1); }
    }, [open]);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && !filteredOptions[highlightedIndex]?.disabled) {
            onChange?.(filteredOptions[highlightedIndex].value);
            setOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
      }
    }, [open, highlightedIndex, filteredOptions, onChange]);

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {label && (
          <label className={cn('mb-1.5 block text-sm font-medium', error ? 'text-error-500' : 'text-foreground')}>
            {label}
          </label>
        )}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls="select-listbox"
            disabled={disabled}
            onClick={() => !disabled && setOpen(!open)}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-lg border bg-background',
              'text-left transition-shadow duration-150',
              selectSizes[size],
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              error ? 'border-error-500' : 'border-border',
              disabled && 'cursor-not-allowed opacity-50',
              !selectedOption && 'text-muted-foreground'
            )}
          >
            <span className="flex items-center gap-2 truncate">
              {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              {selectedOption?.label || placeholder}
            </span>
            <svg
              className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open && (
            <div
              id="select-listbox"
              role="listbox"
              className={cn(
                'absolute z-50 mt-1 w-full rounded-lg border border-border bg-background py-1 shadow-lg',
                'animate-in',
                'max-h-60 overflow-y-auto'
              )}
            >
              {searchable && (
                <div className="sticky top-0 bg-background p-1 border-b border-border">
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setHighlightedIndex(0); }}
                    placeholder="Search..."
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary-500"
                    onKeyDown={e => e.stopPropagation()}
                  />
                </div>
              )}
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">No results found</div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled}
                      disabled={option.disabled}
                      onClick={() => {
                        if (!option.disabled) {
                          onChange?.(option.value);
                          setOpen(false);
                        }
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                        option.disabled && 'cursor-not-allowed opacity-40',
                        index === highlightedIndex && 'bg-muted',
                        isSelected && 'font-medium text-primary-500',
                        !isSelected && !option.disabled && 'text-foreground hover:bg-muted'
                      )}
                    >
                      {option.icon && <span className="shrink-0">{option.icon}</span>}
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected && (
                        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;