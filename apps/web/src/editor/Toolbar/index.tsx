'use client';

import React, { useState } from 'react';
import { useEditor } from '@/editor';

export function Toolbar() {
  const { state, setState, undo, redo } = useEditor();
  const { viewport, zoom } = state;
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    // Simulate deployment
    await new Promise(r => setTimeout(r, 2000));
    setIsDeploying(false);
    alert('Deployed! (simulated)');
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-gray-900">WebBuilder</h1>

        {/* Viewport controls */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['mobile', 'tablet', 'desktop'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setState(s => ({ ...s, viewport: v }))}
              className={`px-3 py-1 rounded text-sm ${
                viewport === v ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {v === 'mobile' ? '📱' : v === 'tablet' ? '📟' : '🖥️'}
            </button>
          ))}
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setState(s => ({ ...s, zoom: Math.max(0.5, s.zoom - 0.1) }))}
            className="w-8 h-8 rounded hover:bg-gray-100"
          >
            −
          </button>
          <span className="text-sm text-gray-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setState(s => ({ ...s, zoom: Math.min(2, s.zoom + 0.1) }))}
            className="w-8 h-8 rounded hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={undo} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
          ↩ Undo
        </button>
        <button onClick={redo} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
          ↪ Redo
        </button>
        <button
          onClick={handleDeploy}
          disabled={isDeploying}
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isDeploying ? 'Deploying...' : '🚀 Deploy'}
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
