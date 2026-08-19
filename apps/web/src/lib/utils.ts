import React from 'react';

type ClassValue = string | number | boolean | bigint | undefined | null | ClassValue[] | { [key: string]: any };

function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input && input !== 0) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'number') {
      classes.push(String(input));
    } else if (typeof input === 'bigint') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = clsx(...input);
      if (inner) classes.push(inner);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
