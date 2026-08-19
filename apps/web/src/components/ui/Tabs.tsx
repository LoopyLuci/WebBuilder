import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: Tab[];
  activeTab?: string;
  defaultTab?: string;
  onChange?: (value: string) => void;
  variant?: 'underline' | 'pill';
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, tabs, activeTab: controlledTab, defaultTab, onChange, variant = 'underline', ...props }, ref) => {
    const [active, setActive] = useState(controlledTab || defaultTab || tabs[0]?.value);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const tabsListRef = useRef<HTMLDivElement>(null);

    const currentTab = controlledTab ?? active;

    useEffect(() => {
      const el = tabRefs.current.get(currentTab);
      if (el && tabsListRef.current) {
        const listRect = tabsListRef.current.getBoundingClientRect();
        const tabRect = el.getBoundingClientRect();
        setIndicatorStyle({
          left: tabRect.left - listRect.left,
          width: tabRect.width,
        });
      }
    }, [currentTab, tabs]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      const enabledTabs = tabs.filter(t => !t.disabled);
      const currentIndex = enabledTabs.findIndex(t => t.value === currentTab);
      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % enabledTabs.length;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = enabledTabs.length - 1;
          break;
        default:
          return;
      }
      const nextTab = enabledTabs[nextIndex];
      if (nextTab) {
        setActive(nextTab.value);
        onChange?.(nextTab.value);
      }
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div
          ref={tabsListRef}
          role="tablist"
          aria-orientation="horizontal"
          className={cn(
            'relative flex',
            variant === 'underline' ? 'border-b border-border gap-0' : 'gap-1'
          )}
          onKeyDown={handleKeyDown}
        >
          {tabs.map((tab) => {
            const isActive = tab.value === currentTab;
            return (
              <button
                key={tab.value}
                ref={(el) => { if (el) tabRefs.current.set(tab.value, el); }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.value}`}
                aria-disabled={tab.disabled}
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                onClick={() => {
                  if (!tab.disabled) {
                    setActive(tab.value);
                    onChange?.(tab.value);
                  }
                }}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  variant === 'underline'
                    ? 'rounded-none border-b-2 border-transparent'
                    : 'rounded-lg',
                  isActive
                    ? variant === 'underline'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                  tab.disabled && 'cursor-not-allowed opacity-40'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
          {variant === 'underline' && (
            <span
              className="absolute bottom-0 h-0.5 bg-primary-500 transition-all duration-200"
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ className, value, ...props }, ref) => (
    <div
      ref={ref}
      role="tabpanel"
      id={`tabpanel-${value}`}
      tabIndex={0}
      className={cn('mt-4 animate-fade-in', className)}
      {...props}
    />
  )
);

TabPanel.displayName = 'TabPanel';