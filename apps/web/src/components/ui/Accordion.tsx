import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpen?: string[];
  collapsible?: boolean;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, items, multiple = false, defaultOpen = [], collapsible = true, ...props }, ref) => {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

    const toggle = useCallback((id: string) => {
      setOpenItems(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          if (collapsible) next.delete(id);
        } else {
          if (!multiple) next.clear();
          next.add(id);
        }
        return next;
      });
    }, [multiple, collapsible]);

    return (
      <div ref={ref} className={cn('divide-y divide-border rounded-lg border border-border', className)} {...props}>
        {items.map(item => (
          <AccordionPanel
            key={item.id}
            item={item}
            isOpen={openItems.has(item.id)}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';

interface AccordionPanelProps {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionPanel = ({ item, isOpen, onToggle }: AccordionPanelProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (!contentRef.current) return;
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="group">
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`accordion-content-${item.id}`}
          disabled={item.disabled}
          onClick={onToggle}
          className={cn(
            'flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
            isOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            item.disabled && 'cursor-not-allowed opacity-40'
          )}
        >
          <span className="flex items-center gap-2">
            {item.icon}
            {item.title}
          </span>
          <svg
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </h3>
      <div
        id={`accordion-content-${item.id}`}
        role="region"
        aria-labelledby={`accordion-trigger-${item.id}`}
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{ height: isOpen ? height : 0 }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="px-4 pb-3 text-sm text-muted-foreground">
          {item.content}
        </div>
      </div>
    </div>
  );
};

export default Accordion;