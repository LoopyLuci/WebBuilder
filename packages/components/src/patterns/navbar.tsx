/**
 * WebBuilder Components - Responsive Navigation Bar Component
 * A responsive navbar with logo, links, and mobile menu.
 */

import React, { useState } from 'react';

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
  children?: NavItem[];
  badge?: string;
  external?: boolean;
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  items: NavItem[];
  actions?: React.ReactNode;
  sticky?: boolean;
  transparent?: boolean;
  mobileBreakpoint?: 'sm' | 'md' | 'lg';
  backgroundColor?: string;
}

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      logo,
      items,
      actions,
      sticky = false,
      transparent = false,
      mobileBreakpoint = 'md',
      backgroundColor = 'bg-white',
      className = '',
      ...props
    },
    ref
  ) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    return (
      <header
        ref={ref}
        className={[
          'w-full z-50',
          sticky ? 'sticky top-0' : '',
          transparent ? 'bg-transparent' : backgroundColor,
          'border-b border-gray-200',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              {logo || (
                <span className="text-xl font-bold text-gray-900">Logo</span>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {items.map((item, index) => (
                <div key={index} className="relative">
                  <a
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className={[
                      'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      item.active
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
                    ].join(' ')}
                    onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.children && (
                      <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </a>
                  {/* Dropdown */}
                  {item.children && openDropdown === item.label && (
                    <div
                      className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                      onMouseEnter={() => setOpenDropdown(item.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {item.children.map((child, cIndex) => (
                        <a
                          key={cIndex}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            {actions && (
              <div className="hidden md:flex items-center space-x-3">
                {actions}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-3">
              <div className="space-y-1">
                {items.map((item, index) => (
                  <div key={index}>
                    <a
                      href={item.href}
                      className={[
                        'block px-3 py-2 text-base font-medium rounded-md',
                        item.active
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      <span className="flex items-center justify-between">
                        {item.label}
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    </a>
                    {item.children && (
                      <div className="pl-6 space-y-1 mt-1">
                        {item.children.map((child, cIndex) => (
                          <a
                            key={cIndex}
                            href={child.href}
                            className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600"
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {actions && (
                <div className="mt-4 pt-4 border-t border-gray-200 px-3 space-y-2">
                  {actions}
                </div>
              )}
            </div>
          )}
        </nav>
      </header>
    );
  }
);

Navbar.displayName = 'Navbar';

export default Navbar;