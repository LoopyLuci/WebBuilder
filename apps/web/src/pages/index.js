'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Link from 'next/link';
export default function Home() {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        setIsVisible(true);
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden", children: [_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [_jsx("div", { className: "absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-800/20 rounded-full blur-3xl" }), _jsx("div", { className: "absolute top-20 -left-20 w-60 h-60 bg-primary-100/40 dark:bg-primary-900/20 rounded-full blur-3xl" })] }), _jsx("div", { className: "relative max-w-6xl mx-auto px-6 pt-20 pb-32", children: _jsxs("div", { className: `text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`, children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8 animate-fade-in", children: [_jsxs("span", { className: "relative flex h-2 w-2", children: [_jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" }), _jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-primary-500" })] }), "Now with Android app builder"] }), _jsxs("h1", { className: "text-5xl md:text-7xl font-bold tracking-tight mb-6", children: [_jsx("span", { className: "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent", children: "Build anything." }), _jsx("br", {}), _jsx("span", { className: "bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent", children: "With AI." })] }), _jsx("p", { className: "text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed", children: "The next-generation agentic platform for designing, building, and deploying web and Android apps. Describe what you want \u2014 AI builds it." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsxs(Link, { href: "/editor", className: "btn btn-primary btn-lg group", children: [_jsx("span", { children: "Start Building Web" }), _jsx("svg", { className: "w-4 h-4 transition-transform group-hover:translate-x-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) })] }), _jsxs(Link, { href: "/android", className: "btn btn-secondary btn-lg group", children: [_jsx("span", { children: "Build Android App" }), _jsx("svg", { className: "w-4 h-4 transition-transform group-hover:translate-x-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) })] })] })] }) })] }), _jsx("div", { className: "max-w-6xl mx-auto px-6 pb-32", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
                        {
                            icon: '🎨',
                            title: 'Visual Editor',
                            description: 'Drag-and-drop components to build pages visually. Real-time preview, responsive editing.',
                            delay: '0ms',
                        },
                        {
                            icon: '🤖',
                            title: 'AI-Powered',
                            description: 'Describe what you want in natural language. AI generates production-ready code.',
                            delay: '100ms',
                        },
                        {
                            icon: '📱',
                            title: 'Android Builder',
                            description: 'Build native Android apps with Kotlin + Jetpack Compose. Built-in emulator for testing.',
                            delay: '200ms',
                        },
                        {
                            icon: '⚡',
                            title: 'Instant Deploy',
                            description: 'One-click deployment to Vercel, Netlify, Cloudflare, and more.',
                            delay: '300ms',
                        },
                        {
                            icon: '🧩',
                            title: 'Component Library',
                            description: 'Beautiful, accessible components for web and Android. Customizable and extensible.',
                            delay: '400ms',
                        },
                        {
                            icon: '🔧',
                            title: 'MCP Protocol',
                            description: 'Full Model Context Protocol support. Works with Hermes, Claude, Codex, and more.',
                            delay: '500ms',
                        },
                    ].map((feature, i) => (_jsxs("div", { className: "card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group", style: { animationDelay: feature.delay }, children: [_jsx("div", { className: "text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300", children: feature.icon }), _jsx("h3", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: feature.title }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 text-sm leading-relaxed", children: feature.description })] }, i))) }) }), _jsx("div", { className: "border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6 py-16 text-center", children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-500 mb-6", children: "Built with modern technologies" }), _jsx("div", { className: "flex flex-wrap justify-center gap-8 text-gray-400 dark:text-gray-600", children: ['TypeScript', 'React', 'Next.js', 'Tailwind', 'Kotlin', 'Jetpack Compose', 'MCP', 'Material3'].map((tech) => (_jsx("span", { className: "text-sm font-medium hover:text-gray-600 dark:hover:text-gray-400 transition-colors", children: tech }, tech))) })] }) })] }));
}
//# sourceMappingURL=index.js.map