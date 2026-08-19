'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export function WelcomeModal({ isOpen, onClose, onGetStarted }) {
    const [step, setStep] = useState(0);
    useEffect(() => {
        if (isOpen) {
            setStep(0);
        }
    }, [isOpen]);
    if (!isOpen)
        return null;
    const steps = [
        {
            title: 'Welcome to WebBuilder',
            description: 'Build web and Android apps with AI. Design visually, generate code instantly.',
            icon: '🚀',
        },
        {
            title: 'Drag & Drop',
            description: 'Drag components from the palette to the canvas. Reorder by dragging handles.',
            icon: '🎨',
        },
        {
            title: 'Keyboard Shortcuts',
            description: 'Press ⌘K for command palette. Use ⌘Z to undo, ⌘D to duplicate, Delete to remove.',
            icon: '⌨️',
        },
        {
            title: 'Ready to Build',
            description: 'Start with a template or from scratch. Your app is one click away.',
            icon: '✨',
        },
    ];
    const currentStep = steps[step];
    return (_jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: "relative max-w-md w-full bg-background rounded-2xl shadow-2xl overflow-hidden animate-scale-in", children: [_jsx("div", { className: "flex justify-center gap-2 pt-6", children: steps.map((_, i) => (_jsx("div", { className: `w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary-600' : 'bg-muted'}` }, i))) }), _jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "text-5xl mb-4", children: currentStep.icon }), _jsx("h2", { className: "text-2xl font-bold mb-3", children: currentStep.title }), _jsx("p", { className: "text-muted-foreground mb-8", children: currentStep.description }), _jsx("div", { className: "flex gap-3 justify-center", children: step < steps.length - 1 ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors", children: "Skip" }), _jsx("button", { onClick: () => setStep(step + 1), className: "px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors", children: "Next" })] })) : (_jsx("button", { onClick: onGetStarted, className: "px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors", children: "Get Started" })) })] })] })] }));
}
export default WelcomeModal;
//# sourceMappingURL=WelcomeModal.js.map