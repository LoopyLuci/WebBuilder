/**
 * WebBuilder Components - Footer Component
 * A flexible footer with link columns, social icons, and copyright.
 */

import React from 'react';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  columns: FooterColumn[];
  logo?: React.ReactNode;
  description?: string;
  socialLinks?: { icon: React.ReactNode; href: string; label: string }[];
  copyright?: string;
  backgroundColor?: string;
  newsletter?: {
    title: string;
    description?: string;
    placeholder?: string;
    buttonText?: string;
    onSubmit: (email: string) => void;
  };
}

export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  (
    {
      columns,
      logo,
      description,
      socialLinks,
      copyright,
      backgroundColor = 'bg-gray-900',
      newsletter,
      className = '',
      ...props
    },
    ref
  ) => {
    const [email, setEmail] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      newsletter?.onSubmit(email);
      setEmail('');
    };

    return (
      <footer
        ref={ref}
        className={['w-full', backgroundColor, className].filter(Boolean).join(' ')}
        {...props}
      >
        <div className="container mx-auto px-4 py-12">
          {/* Newsletter Section */}
          {newsletter && (
            <div className="border-b border-gray-700 pb-8 mb-8">
              <div className="max-w-xl">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {newsletter.title}
                </h3>
                {newsletter.description && (
                  <p className="text-gray-400 text-sm mb-4">{newsletter.description}</p>
                )}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={newsletter.placeholder || 'Enter your email'}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Email address"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {newsletter.buttonText || 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Logo & Description */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
              {logo && <div className="mb-4">{logo}</div>}
              {description && (
                <p className="text-gray-400 text-sm max-w-xs">{description}</p>
              )}
              {socialLinks && (
                <div className="flex items-center gap-3 mt-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Link Columns */}
            {columns.map((column, colIndex) => (
              <div key={colIndex}>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {column.title}
                </h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Copyright */}
          {copyright && (
            <div className="border-t border-gray-700 mt-8 pt-8">
              <p className="text-sm text-gray-400 text-center">{copyright}</p>
            </div>
          )}
        </div>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

export default Footer;