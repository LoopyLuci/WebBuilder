/**
 * WebBuilder Components - Atomic Avatar Component
 * A flexible avatar component with image, initials fallback, and status indicator.
 */

import React, { useState } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';
export type AvatarShape = 'circle' | 'square' | 'rounded';

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  bordered?: boolean;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  stacked?: boolean;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', status: 'w-1.5 h-1.5 bottom-0 right-0' },
  sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2 h-2 bottom-0 right-0' },
  md: { container: 'w-10 h-10', text: 'text-sm', status: 'w-2.5 h-2.5 bottom-0 right-0' },
  lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3 h-3 bottom-0 right-0' },
  xl: { container: 'w-16 h-16', text: 'text-lg', status: 'w-3.5 h-3.5 bottom-0.5 right-0.5' },
  '2xl': { container: 'w-20 h-20', text: 'text-xl', status: 'w-4 h-4 bottom-0.5 right-0.5' },
};

const shapeStyles: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-none',
  rounded: 'rounded-lg',
};

const statusStyles: Record<AvatarStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

const bgColors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length] ?? 'bg-gray-500';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      shape = 'circle',
      status,
      bordered = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [imgError, setImgError] = useState(false);
    const hasImage = src && !imgError;
    const sizes = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={['relative inline-flex flex-shrink-0', className].filter(Boolean).join(' ')}
        {...props}
      >
        <div
          className={[
            sizes.container,
            shapeStyles[shape],
            'overflow-hidden flex items-center justify-center',
            bordered ? 'ring-2 ring-white' : '',
            !hasImage && name ? getColorFromName(name) : 'bg-gray-200',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {hasImage ? (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : name ? (
            <span className={[sizes.text, 'font-medium text-white'].join(' ')}>
              {getInitials(name)}
            </span>
          ) : (
            <svg
              className="w-1/2 h-1/2 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>
        {status && (
          <span
            className={[
              'absolute ring-2 ring-white rounded-full',
              sizes.status,
              statusStyles[status],
            ].join(' ')}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max, size = 'md', stacked = true, className = '', ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const displayChildren = max ? childArray.slice(0, max) : childArray;
    const remaining = max ? childArray.length - max : 0;
    const sizes = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={['flex items-center', stacked ? '-space-x-2' : 'space-x-2', className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {displayChildren.map((child, index) => (
          <div key={index} className={stacked ? 'ring-2 ring-white rounded-full' : ''}>
            {child}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className={[
              sizes.container,
              'rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white',
            ].join(' ')}
          >
            <span className={[sizes.text, 'font-medium text-gray-600'].join(' ')}>
              +{remaining}
            </span>
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export default Avatar;