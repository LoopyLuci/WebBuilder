'use client';

import React from 'react';

interface NavigationBarProps {
  onBack?: () => void;
  onHome?: () => void;
  onRecent?: () => void;
}

export function NavigationBar({ onBack, onHome, onRecent }: NavigationBarProps) {
  return (
    <div className="flex items-center justify-around px-8 py-2 bg-gray-100 border-t border-gray-200">
      <button
        onClick={onBack}
        className="p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors"
        aria-label="Back"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={onHome}
        className="p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors"
        aria-label="Home"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
        </svg>
      </button>
      <button
        onClick={onRecent}
        className="p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors"
        aria-label="Recent apps"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
        </svg>
      </button>
    </div>
  );
}

export default NavigationBar;
