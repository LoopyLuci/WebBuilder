/**
 * WebBuilder Components - Search Component
 * A search input with suggestions, loading state, and keyboard navigation.
 */

import React, { useState, useRef, useEffect } from 'react';

export interface SearchSuggestion {
  id: string;
  label: string;
  icon?: React.ReactNode;
  category?: string;
}

export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  onSearch?: (query: string) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
  loading?: boolean;
  debounce?: number;
  minLength?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  clearable?: boolean;
}

const sizeStyles: Record<string, string> = {
  sm: 'pl-8 py-1.5 text-sm',
  md: 'pl-10 py-2.5 text-sm',
  lg: 'pl-12 py-3 text-base',
};

const iconSizeStyles: Record<string, string> = {
  sm: 'left-2.5 w-4 h-4',
  md: 'left-3 w-5 h-5',
  lg: 'left-4 w-5 h-5',
};

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      label,
      placeholder = 'Search...',
      suggestions = [],
      onSearch,
      onSelect,
      loading = false,
      debounce = 300,
      minLength = 1,
      size = 'md',
      showIcon = true,
      clearable = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setActiveIndex(-1);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (value.length >= minLength) {
        setIsOpen(true);
        timeoutRef.current = setTimeout(() => {
          onSearch?.(value);
        }, debounce);
      } else {
        setIsOpen(false);
      }
    };

    const handleSelect = (suggestion: SearchSuggestion) => {
      setQuery(suggestion.label);
      setIsOpen(false);
      onSelect?.(suggestion);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const clearQuery = () => {
      setQuery('');
      setIsOpen(false);
      onSearch?.('');
    };

    const showSuggestions = isOpen && suggestions.length > 0;

    return (
      <div ref={containerRef} className={['relative flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <div className="relative">
          {showIcon && (
            <svg
              className={['absolute top-1/2 -translate-y-1/2 text-gray-400', iconSizeStyles[size]].join(' ')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          <input
            ref={ref}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={[
              'w-full border rounded-md bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              sizeStyles[size],
              clearable && query ? 'pr-10' : 'pr-3',
            ].join(' ')}
            {...props}
          />
          {loading && (
            <svg className={['absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 animate-spin text-gray-400', clearable && query ? 'right-8' : 'right-3'].join(' ')} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {clearable && query && !loading && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 max-h-80 overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className={[
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                    index === activeIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {suggestion.icon && <span className="flex-shrink-0">{suggestion.icon}</span>}
                  <div className="flex-1">
                    <span>{suggestion.label}</span>
                    {suggestion.category && (
                      <span className="ml-2 text-xs text-gray-400">{suggestion.category}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Search.displayName = 'Search';

export default Search;