'use client';

import React from 'react';
import { useEditor } from '@/editor';

export function PropertiesPanel() {
  const { state, updateSection } = useEditor();
  const { spec, selectedSectionId } = state;

  // Find selected section
  let selectedSection: any = null;
  for (const page of spec.structure?.pages || []) {
    for (const section of page.sections || []) {
      if (section.id === selectedSectionId) {
        selectedSection = section;
        break;
      }
    }
    if (selectedSection) break;
  }

  if (!selectedSection) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <p className="text-gray-500 text-center text-sm">Select a component to edit its properties</p>
      </div>
    );
  }

  const handlePropChange = (key: string, value: string) => {
    updateSection(selectedSection.id, {
      props: { ...selectedSection.props, [key]: value },
    });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Properties</h2>
        <p className="text-xs text-gray-500 mt-1">{selectedSection.component}</p>
      </div>
      <div className="p-4 space-y-4">
        {/* Dynamic props form */}
        {Object.entries(selectedSection.props || {}).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
            <input
              type="text"
              value={String(value)}
              onChange={(e) => handlePropChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        {/* Add new prop */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Add Property</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Key"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              id="new-prop-key"
            />
            <input
              type="text"
              placeholder="Value"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              id="new-prop-value"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const key = (document.getElementById('new-prop-key') as HTMLInputElement).value;
                  const val = (document.getElementById('new-prop-value') as HTMLInputElement).value;
                  if (key) handlePropChange(key, val);
                  (document.getElementById('new-prop-key') as HTMLInputElement).value = '';
                  (document.getElementById('new-prop-value') as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertiesPanel;
