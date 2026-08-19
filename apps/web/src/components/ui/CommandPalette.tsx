import React, { forwardRef, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  onSelect?: () => void;
  disabled?: boolean;
  group?: string;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  ({ open, onClose, commands, placeholder = 'Type a command...', emptyMessage = 'No results found', className }, ref) => {
    const [search, setSearch] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Reset state on open
    useEffect(() => {
      if (open) {
        setSearch('');
        setHighlightedIndex(0);
        setSelectedGroup(null);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }, [open]);

    // Group commands
    const groups = useMemo(() => {
      const groupMap = new Map<string, CommandItem[]>();
      commands.forEach(cmd => {
        const group = cmd.group || 'General';
        if (!groupMap.has(group)) groupMap.set(group, []);
        groupMap.get(group)!.push(cmd);
      });
      return groupMap;
    }, [commands]);

    // Filter commands
    const filteredGroups = useMemo(() => {
      const result = new Map<string, CommandItem[]>();
      groups.forEach((cmds, groupName) => {
        const filtered = cmds.filter(cmd =>
          cmd.label.toLowerCase().includes(search.toLowerCase()) ||
          cmd.description?.toLowerCase().includes(search.toLowerCase())
        );
        if (filtered.length > 0) result.set(groupName, filtered);
      });
      return result;
    }, [groups, search]);

    // Flatten for keyboard nav
    const flatItems = useMemo(() => {
      const items: { group: string; item: CommandItem }[] = [];
      filteredGroups.forEach((cmds, groupName) => {
        cmds.forEach(cmd => items.push({ group: groupName, item: cmd }));
      });
      return items;
    }, [filteredGroups]);

    // Scroll highlighted into view
    useEffect(() => {
      if (!listRef.current) return;
      const el = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }, [highlightedIndex]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => Math.min(prev + 1, flatItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatItems[highlightedIndex]) {
            flatItems[highlightedIndex].item.onSelect?.();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    }, [flatItems, highlightedIndex, onClose]);

    const handleSelect = (item: CommandItem) => {
      item.onSelect?.();
      onClose();
    };

    if (!open) return null;

    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Content */}
        <div
          className={cn(
            'relative z-50 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-2xl',
            'animate-scale-in',
            className
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Search */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={flatItems.length > 0}
              aria-controls="command-listbox"
              aria-activedescendant={flatItems[highlightedIndex]?.item.id}
              value={search}
              onChange={e => { setSearch(e.target.value); setHighlightedIndex(0); }}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              ESC
            </kbd>
          </div>
          {/* List */}
          <div
            ref={listRef}
            id="command-listbox"
            role="listbox"
            className="max-h-80 overflow-y-auto p-2 scrollbar-thin"
          >
            {flatItems.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              Array.from(filteredGroups.entries()).map(([groupName, cmds]) => (
                <div key={groupName} role="group" aria-label={groupName}>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {groupName}
                  </div>
                  {cmds.map(cmd => {
                    const globalIndex = flatItems.findIndex(f => f.item.id === cmd.id);
                    const isHighlighted = globalIndex === highlightedIndex;
                    return (
                      <button
                        key={cmd.id}
                        id={cmd.id}
                        role="option"
                        aria-selected={isHighlighted}
                        aria-disabled={cmd.disabled}
                        data-index={globalIndex}
                        disabled={cmd.disabled}
                        onClick={() => handleSelect(cmd)}
                        onMouseEnter={() => setHighlightedIndex(globalIndex)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                          isHighlighted && 'bg-muted',
                          cmd.disabled && 'cursor-not-allowed opacity-40',
                          !cmd.disabled && !isHighlighted && 'hover:bg-muted'
                        )}
                      >
                        {cmd.icon && (
                          <span className="shrink-0 text-muted-foreground">{cmd.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">{cmd.label}</div>
                          {cmd.description && (
                            <div className="text-xs text-muted-foreground truncate">{cmd.description}</div>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <div className="flex shrink-0 gap-1">
                            {cmd.shortcut.map((key, i) => (
                              <kbd
                                key={i}
                                className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1">↑</kbd>
              <kbd className="rounded border border-border bg-muted px-1">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    );
  }
);

CommandPalette.displayName = 'CommandPalette';
export default CommandPalette;