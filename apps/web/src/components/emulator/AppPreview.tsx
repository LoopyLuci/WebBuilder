'use client';

import React from 'react';

interface AppPreviewProps {
  projectName?: string;
  packageName?: string;
  components?: string[];
}

export function AppPreview({ projectName = 'MyApp', packageName = 'com.example.app', components = [] }: AppPreviewProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* App content area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl text-white font-bold">{projectName.charAt(0)}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{projectName}</h2>
          <p className="text-gray-500 text-sm mb-6">{packageName}</p>

          {/* Mock app content */}
          <div className="space-y-3 text-left">
            {components.includes('android-button') && (
              <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium shadow-md hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            )}
            {components.includes('android-text') && (
              <p className="text-gray-600 text-sm leading-relaxed">
                Welcome to your new Android app! This is a live preview of your generated Kotlin + Jetpack Compose code.
              </p>
            )}
            {components.includes('android-card') && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-1">Card Component</h3>
                <p className="text-sm text-gray-600">This is a Material3 card with elevation and rounded corners.</p>
              </div>
            )}
            {components.includes('android-image') && (
              <div className="w-full h-32 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <span className="text-4xl">🖼️</span>
              </div>
            )}
            {components.includes('android-list') && (
              <div className="space-y-2">
                {['Item 1', 'Item 2', 'Item 3'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm text-blue-600">{i + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppPreview;
