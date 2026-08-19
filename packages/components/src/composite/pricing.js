import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Pricing Table Component
 * A pricing section with tier cards, feature lists, and CTA buttons.
 */
import React from 'react';
export const Pricing = React.forwardRef(({ title, subtitle, tiers, currency = '$', showIntervalToggle = false, defaultInterval = 'monthly', onIntervalChange, backgroundColor, className = '', ...props }, ref) => {
    const [interval, setInterval] = React.useState(defaultInterval);
    const handleIntervalChange = (newInterval) => {
        setInterval(newInterval);
        onIntervalChange?.(newInterval);
    };
    return (_jsx("section", { ref: ref, className: ['py-16 md:py-24', className].filter(Boolean).join(' '), style: backgroundColor ? { backgroundColor } : undefined, ...props, children: _jsxs("div", { className: "container mx-auto px-4", children: [(title || subtitle) && (_jsxs("div", { className: "max-w-2xl mx-auto text-center mb-12", children: [subtitle && (_jsx("p", { className: "text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2", children: subtitle })), title && (_jsx("h2", { className: "text-3xl md:text-4xl font-bold text-gray-900", children: title }))] })), showIntervalToggle && (_jsx("div", { className: "flex items-center justify-center mb-10", children: _jsxs("div", { className: "inline-flex items-center bg-gray-100 rounded-lg p-1", children: [_jsx("button", { type: "button", onClick: () => handleIntervalChange('monthly'), className: [
                                    'px-4 py-2 text-sm font-medium rounded-md transition-all',
                                    interval === 'monthly'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900',
                                ].join(' '), children: "Monthly" }), _jsxs("button", { type: "button", onClick: () => handleIntervalChange('yearly'), className: [
                                    'px-4 py-2 text-sm font-medium rounded-md transition-all',
                                    interval === 'yearly'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900',
                                ].join(' '), children: ["Yearly", _jsx("span", { className: "ml-1.5 text-xs text-green-600 font-semibold", children: "-20%" })] })] }) })), _jsx("div", { className: [
                        'grid gap-6 mx-auto',
                        tiers.length === 2 ? 'md:grid-cols-2 max-w-3xl' : '',
                        tiers.length === 3 ? 'md:grid-cols-3 max-w-5xl' : '',
                        tiers.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4 max-w-6xl' : '',
                        tiers.length > 4 ? `md:grid-cols-${Math.min(tiers.length, 4)}` : '',
                    ]
                        .filter(Boolean)
                        .join(' '), children: tiers.map((tier, index) => (_jsxs("div", { className: [
                            'relative rounded-2xl p-6 md:p-8 flex flex-col',
                            tier.highlighted
                                ? 'bg-blue-600 text-white ring-2 ring-blue-600 scale-[1.02] shadow-xl'
                                : 'bg-white border border-gray-200 shadow-sm',
                        ].join(' '), children: [tier.badge && (_jsx("span", { className: [
                                    'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full',
                                    tier.highlighted
                                        ? 'bg-yellow-400 text-yellow-900'
                                        : 'bg-blue-600 text-white',
                                ].join(' '), children: tier.badge })), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: [
                                            'text-lg font-semibold',
                                            tier.highlighted ? 'text-white' : 'text-gray-900',
                                        ].join(' '), children: tier.name }), tier.description && (_jsx("p", { className: [
                                            'mt-1 text-sm',
                                            tier.highlighted ? 'text-blue-100' : 'text-gray-500',
                                        ].join(' '), children: tier.description }))] }), _jsxs("div", { className: "mb-6", children: [_jsx("span", { className: [
                                            'text-4xl font-bold',
                                            tier.highlighted ? 'text-white' : 'text-gray-900',
                                        ].join(' '), children: typeof tier.price === 'number'
                                            ? `${currency}${tier.price}`
                                            : tier.price }), tier.interval && (_jsxs("span", { className: [
                                            'text-sm',
                                            tier.highlighted ? 'text-blue-100' : 'text-gray-500',
                                        ].join(' '), children: ["/", tier.interval] }))] }), _jsx("ul", { className: "space-y-3 mb-8 flex-1", role: "list", children: tier.features.map((feature, fIndex) => (_jsxs("li", { className: "flex items-start gap-3", children: [_jsx("svg", { className: [
                                                'w-5 h-5 flex-shrink-0 mt-0.5',
                                                tier.highlighted ? 'text-blue-200' : 'text-blue-600',
                                            ].join(' '), fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) }), _jsx("span", { className: [
                                                'text-sm',
                                                tier.highlighted ? 'text-blue-50' : 'text-gray-600',
                                            ].join(' '), children: feature })] }, fIndex))) }), _jsx("button", { type: "button", onClick: tier.onSelect, className: [
                                    'w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors',
                                    tier.highlighted
                                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                                        : 'bg-blue-600 text-white hover:bg-blue-700',
                                ].join(' '), children: tier.ctaText || 'Get Started' })] }, index))) })] }) }));
});
Pricing.displayName = 'Pricing';
export default Pricing;
//# sourceMappingURL=pricing.js.map