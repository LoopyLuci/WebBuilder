import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Hero Section Component
 * A hero section with title, subtitle, CTA, and background image support.
 */
import React from 'react';
const heightStyles = {
    auto: 'py-16 md:py-24',
    half: 'min-h-[50vh] py-12',
    full: 'min-h-screen py-16',
    large: 'min-h-[80vh] py-20',
};
const layoutStyles = {
    center: {
        container: 'max-w-4xl mx-auto text-center',
        content: 'flex flex-col items-center',
    },
    left: {
        container: 'max-w-3xl mr-auto text-left',
        content: 'flex flex-col items-start',
    },
    right: {
        container: 'max-w-3xl ml-auto text-right',
        content: 'flex flex-col items-end',
    },
    split: {
        container: 'grid md:grid-cols-2 gap-8 items-center',
        content: '',
    },
};
export const Hero = React.forwardRef(({ layout = 'center', title, subtitle, description, backgroundImage, backgroundColor, overlay = true, overlayOpacity = 0.5, cta, secondaryCta, height = 'auto', className = '', children, ...props }, ref) => {
    const styles = layoutStyles[layout];
    const hasBackground = !!backgroundImage;
    return (_jsxs("section", { ref: ref, className: [
            'relative w-full overflow-hidden',
            heightStyles[height],
            className,
        ]
            .filter(Boolean)
            .join(' '), style: backgroundColor ? { backgroundColor } : undefined, ...props, children: [hasBackground && (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute inset-0 bg-cover bg-center", style: { backgroundImage: `url(${backgroundImage})` }, "aria-hidden": "true" }), overlay && (_jsx("div", { className: "absolute inset-0 bg-black", style: { opacity: overlayOpacity }, "aria-hidden": "true" }))] })), _jsxs("div", { className: ['relative z-10 container mx-auto px-4', styles.container].join(' '), children: [layout === 'split' ? (_jsxs("div", { className: "space-y-6", children: [hasBackground ? (_jsxs(_Fragment, { children: [subtitle && (_jsx("p", { className: "text-sm font-semibold uppercase tracking-wider text-blue-300", children: subtitle })), _jsx("h1", { className: "text-4xl md:text-5xl font-bold text-white leading-tight", children: title }), description && (_jsx("p", { className: "text-lg text-gray-200 max-w-xl", children: description }))] })) : (_jsxs(_Fragment, { children: [subtitle && (_jsx("p", { className: "text-sm font-semibold uppercase tracking-wider text-blue-600", children: subtitle })), _jsx("h1", { className: "text-4xl md:text-5xl font-bold text-gray-900 leading-tight", children: title }), description && (_jsx("p", { className: "text-lg text-gray-600 max-w-xl", children: description }))] })), (cta || secondaryCta) && (_jsxs("div", { className: "flex flex-wrap gap-4 pt-4", children: [cta, secondaryCta] }))] })) : (_jsxs("div", { className: styles.content, children: [subtitle && (_jsx("p", { className: [
                                    'text-sm font-semibold uppercase tracking-wider mb-3',
                                    hasBackground ? 'text-blue-300' : 'text-blue-600',
                                ].join(' '), children: subtitle })), _jsx("h1", { className: [
                                    'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
                                    hasBackground ? 'text-white' : 'text-gray-900',
                                ].join(' '), children: title }), description && (_jsx("p", { className: [
                                    'mt-4 text-lg md:text-xl max-w-2xl',
                                    hasBackground ? 'text-gray-200' : 'text-gray-600',
                                ].join(' '), children: description })), (cta || secondaryCta) && (_jsxs("div", { className: "flex flex-wrap gap-4 mt-8", children: [cta, secondaryCta] }))] })), children] })] }));
});
Hero.displayName = 'Hero';
export default Hero;
//# sourceMappingURL=hero.js.map