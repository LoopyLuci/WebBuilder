/**
 * WebBuilder Components - Search Component
 * A search input with suggestions, loading state, and keyboard navigation.
 */
import React from 'react';
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
export declare const Search: React.ForwardRefExoticComponent<SearchProps & React.RefAttributes<HTMLInputElement>>;
export default Search;
//# sourceMappingURL=search.d.ts.map