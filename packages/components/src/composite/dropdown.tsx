/**
 * WebBuilder Components - Dropdown Component
 * A flexible dropdown menu with items, groups, and keyboard navigation.
 */

import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export interface DropdownGroup {
  title?: string;
  items: DropdownItem[];
}

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger: React.ReactNode;
  groups: DropdownGroup[];
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  width?: string;
}

const positionStyles: Record<string, string> = {
  'bottom-left': 'top-full left-0 mt-1',
  'bottom-right': 'top-full right-0 mt-1',
  'top-left': 'bottom-full left-0 mb-1',
  'top-right': 'bottom-full right-0 mb-1',
};

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      trigger,
      groups,
      position = 'bottom-left',
      open: controlledOpen,
      onOpenChange,
      width = 'w-56',
      className = '',
      ...props
    },
    ref
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggle = () => {
      const newState = !open;
      if (controlledOpen === undefined) {
        setUncontrolledOpen(newState);
      }
      onOpenChange?.(newState);
    };

    useEffect(() => {
      if (open) {
        const handleClickOutside = (e: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            if (controlledOpen === undefined) {
              setUncontrolledOpen(false);
            }
            onOpenChange?.(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [open, controlledOpen, onOpenChange]);

    useEffect(() => {
      if (open && dropdownRef.current) {
        const items = dropdownRef.current.querySelectorAll('[role="menuitem"]:not([disabled])');
        if (items.length > 0) {
          (items[0] as HTMLElement).focus();
          setFocusedIndex(0);
        }
      }
    }, [open]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!open) return;
      const items = dropdownRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])');
      if (!items) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : 0;
        setFocusedIndex(nextIndex);
        (items[nextIndex] as HTMLElement).focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : items.length - 1;
        setFocusedIndex(prevIndex);
        (items[prevIndex] as HTMLElement).focus();
      } else if (e.key === 'Escape') {
        if (controlledOpen === undefined) {
          setUncontrolledOpen(false);
        }
        onOpenChange?.(false);
      }
    };

    return (
      <div
        ref={ref}
        className={['relative inline-flex', className].filter(Boolean).join(' ')}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <div onClick={toggle} className="cursor-pointer">
          {trigger}
        </div>
        {open && (
          <div
            ref={dropdownRef}
            role="menu"
            className={[
              'absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 animate-[fadeIn_0.15s_ease-out]',
              positionStyles[position],
              width,
            ].join(' ')}
          >
            {groups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {groupIndex > 0 && <div className="my-1 border-t border-gray-100" />}
                {group.title && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </div>
                )}
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      item.onClick?.();
                      if (controlledOpen === undefined) {
                        setUncontrolledOpen(false);
                      }
                      onOpenChange?.(false);
                    }}
                    className={[
                      'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                      item.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : item.danger
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

export default Dropdown;