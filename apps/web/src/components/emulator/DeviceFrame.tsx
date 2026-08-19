'use client';

import React from 'react';

interface DeviceFrameProps {
  children: React.ReactNode;
  width?: number;
  height: number;
  name?: string;
}

export function DeviceFrame({ children, width = 375, height = 700, name = 'Phone' }: DeviceFrameProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Device outer frame */}
      <div
        className="relative bg-gray-900 rounded-[3rem] shadow-2xl border-4 border-gray-800 p-3"
        style={{ width: width + 24, height: height + 48 }}
      >
        {/* Side buttons */}
        <div className="absolute -left-1 top-24 w-1 h-8 bg-gray-700 rounded-l" />
        <div className="absolute -left-1 top-36 w-1 h-12 bg-gray-700 rounded-l" />
        <div className="absolute -left-1 top-52 w-1 h-12 bg-gray-700 rounded-l" />
        <div className="absolute -right-1 top-32 w-1 h-16 bg-gray-700 rounded-r" />

        {/* Inner bezel */}
        <div className="relative w-full h-full bg-black rounded-[2.5rem] overflow-hidden">
          {/* Camera notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-800 border border-gray-700" />
            <div className="w-3 h-3 rounded-full bg-gray-800 border border-gray-700" />
          </div>

          {/* Screen content */}
          <div className="w-full h-full overflow-hidden bg-white">
            {children}
          </div>
        </div>
      </div>

      {/* Device name */}
      {name && (
        <p className="mt-4 text-sm font-medium text-muted-foreground">{name}</p>
      )}
    </div>
  );
}

export default DeviceFrame;
