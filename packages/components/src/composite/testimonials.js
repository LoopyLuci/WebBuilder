import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Testimonials Section Component
 * A testimonials section with quotes, avatars, and ratings.
 */
import React from 'react';
export const Testimonials = React.forwardRef(({ title, subtitle, testimonials, layout = 'grid', columns = 3, showRating = true, backgroundColor, className = '', ...props }, ref) => {
    const renderStars = (rating) => {
        return (_jsx("div", { className: "flex items-center gap-0.5", "aria-label": `${rating} out of 5 stars`, children: [1, 2, 3, 4, 5].map((star) => (_jsx("svg", { className: [
                    'w-4 h-4',
                    star <= rating ? 'text-yellow-400' : 'text-gray-300',
                ].join(' '), fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }, star))) }));
    };
    const columnClass = columns === 1
        ? 'grid-cols-1'
        : columns === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return (_jsx("section", { ref: ref, className: ['py-16 md:py-24', className].filter(Boolean).join(' '), style: backgroundColor ? { backgroundColor } : undefined, ...props, children: _jsxs("div", { className: "container mx-auto px-4", children: [(title || subtitle) && (_jsxs("div", { className: "max-w-2xl mx-auto text-center mb-12", children: [subtitle && (_jsx("p", { className: "text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2", children: subtitle })), title && (_jsx("h2", { className: "text-3xl md:text-4xl font-bold text-gray-900", children: title }))] })), _jsx("div", { className: ['grid gap-6', columnClass].join(' '), children: testimonials.map((testimonial) => (_jsxs("div", { className: [
                            'relative p-6 rounded-xl border transition-shadow',
                            testimonial.featured
                                ? 'bg-blue-50 border-blue-200 shadow-md'
                                : 'bg-white border-gray-200 hover:shadow-md',
                        ].join(' '), children: [showRating && testimonial.rating && (_jsx("div", { className: "mb-4", children: renderStars(testimonial.rating) })), _jsxs("blockquote", { className: "text-gray-700 leading-relaxed mb-6", children: ["\u201C", testimonial.content, "\u201D"] }), _jsxs("div", { className: "flex items-center gap-3", children: [testimonial.author.avatar ? (_jsx("img", { src: testimonial.author.avatar, alt: testimonial.author.name, className: "w-10 h-10 rounded-full object-cover" })) : (_jsx("div", { className: "w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center", children: _jsx("span", { className: "text-sm font-medium text-gray-600", children: testimonial.author.name.charAt(0) }) })), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: testimonial.author.name }), _jsx("p", { className: "text-xs text-gray-500", children: [testimonial.author.role, testimonial.author.company]
                                                    .filter(Boolean)
                                                    .join(' at ') })] })] })] }, testimonial.id || testimonial.author.name))) })] }) }));
});
Testimonials.displayName = 'Testimonials';
export default Testimonials;
//# sourceMappingURL=testimonials.js.map