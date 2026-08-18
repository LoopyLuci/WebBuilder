'use client';

import React from 'react';
import { useEditor } from '@/editor';

export function Sidebar() {
  const { state, selectSection, addSection } = useEditor();
  const { spec, selectedSectionId } = state;

  const availableComponents = [
    { type: 'hero-default', label: 'Hero Section', icon: '🖼️' },
    { type: 'features-default', label: 'Features Grid', icon: '📋' },
    { type: 'pricing-default', label: 'Pricing Table', icon: '💰' },
    { type: 'cta-default', label: 'CTA Section', icon: '📣' },
    { type: 'stats-grid', label: 'Stats Grid', icon: '📊' },
    { type: 'testimonials-default', label: 'Testimonials', icon: '💬' },
    { type: 'footer-default', label: 'Footer', icon: '📄' },
    { type: 'navbar-default', label: 'Navbar', icon: '🔝' },
  ];

  const handleAddComponent = (type: string) => {
    const pageId = spec.structure.pages[0]?.id;
    if (!pageId) return;

    const newSection = {
      id: `section_${Date.now()}`,
      name: type.split('-')[0],
      component: type,
      props: {},
      children: [],
      responsive: {},
    };

    addSection(pageId, newSection);
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Component Library</h2>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {availableComponents.map((comp) => (
            <button
              key={comp.type}
              onClick={() => handleAddComponent(comp.type)}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-2xl">{comp.icon}</span>
              <span className="text-xs text-gray-600">{comp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Component Tree */}
      <div className="border-t border-gray-200 p-4">
        <h3 className="font-medium text-sm text-gray-700 mb-2">Page Structure</h3>
        <div className="space-y-1 text-sm">
          {spec.structure?.pages?.map((page: any) => (
            <div key={page.id}>
              <div className="font-medium text-gray-900">{page.name}</div>
              {page.sections?.map((section: any) => (
                <button
                  key={section.id}
                  onClick={() => selectSection(section.id)}
                  className={`block w-full text-left px-2 py-1 rounded text-xs ${
                    selectedSectionId === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {section.component}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
