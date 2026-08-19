'use client';

import React, { useState, useEffect } from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

export function WelcomeModal({ isOpen, onClose, onGetStarted }: WelcomeModalProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-md w-full bg-background rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-primary-600' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">{currentStep.icon}</div>
          <h2 className="text-2xl font-bold mb-3">{currentStep.title}</h2>
          <p className="text-muted-foreground mb-8">{currentStep.description}</p>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            {step < steps.length - 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Next
                </button>
              </>
            ) : (
              <button
                onClick={onGetStarted}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;
