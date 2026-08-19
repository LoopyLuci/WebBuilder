import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Footer Component
 * A flexible footer with link columns, social icons, and copyright.
 */
import React from 'react';
export const Footer = React.forwardRef(({ columns, logo, description, socialLinks, copyright, backgroundColor = 'bg-gray-900', newsletter, className = '', ...props }, ref) => {
    const [email, setEmail] = React.useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        newsletter?.onSubmit(email);
        setEmail('');
    };
    return (_jsx("footer", { ref: ref, className: ['w-full', backgroundColor, className].filter(Boolean).join(' '), ...props, children: _jsxs("div", { className: "container mx-auto px-4 py-12", children: [newsletter && (_jsx("div", { className: "border-b border-gray-700 pb-8 mb-8", children: _jsxs("div", { className: "max-w-xl", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: newsletter.title }), newsletter.description && (_jsx("p", { className: "text-gray-400 text-sm mb-4", children: newsletter.description })), _jsxs("form", { onSubmit: handleSubmit, className: "flex gap-2", children: [_jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: newsletter.placeholder || 'Enter your email', className: "flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500", "aria-label": "Email address" }), _jsx("button", { type: "submit", className: "px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors", children: newsletter.buttonText || 'Subscribe' })] })] }) })), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8", children: [_jsxs("div", { className: "col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0", children: [logo && _jsx("div", { className: "mb-4", children: logo }), description && (_jsx("p", { className: "text-gray-400 text-sm max-w-xs", children: description })), socialLinks && (_jsx("div", { className: "flex items-center gap-3 mt-4", children: socialLinks.map((social, index) => (_jsx("a", { href: social.href, "aria-label": social.label, className: "text-gray-400 hover:text-white transition-colors", children: social.icon }, index))) }))] }), columns.map((column, colIndex) => (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-white uppercase tracking-wider mb-4", children: column.title }), _jsx("ul", { className: "space-y-2", children: column.links.map((link, linkIndex) => (_jsx("li", { children: _jsx("a", { href: link.href, target: link.external ? '_blank' : undefined, rel: link.external ? 'noopener noreferrer' : undefined, className: "text-sm text-gray-400 hover:text-white transition-colors", children: link.label }) }, linkIndex))) })] }, colIndex)))] }), copyright && (_jsx("div", { className: "border-t border-gray-700 mt-8 pt-8", children: _jsx("p", { className: "text-sm text-gray-400 text-center", children: copyright }) }))] }) }));
});
Footer.displayName = 'Footer';
export default Footer;
//# sourceMappingURL=footer.js.map