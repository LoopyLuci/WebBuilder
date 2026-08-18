'use client';

import React from 'react';
import { useEditor } from '@/editor';

export function Canvas() {
  const { state, selectSection, removeSection } = useEditor();
  const { spec, selectedSectionId } = state;

  const viewportWidth = state.viewport === 'mobile' ? 375 : state.viewport === 'tablet' ? 768 : '100%';

  return (
    <div className="flex-1 bg-gray-100 overflow-auto p-8">
      <div
        className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-200"
        style={{ width: viewportWidth, minHeight: '800px' }}
      >
        {spec.structure?.pages?.map((page: any) => (
          <div key={page.id}>
            {page.sections?.map((section: any) => {
              const isSelected = section.id === selectedSectionId;
              return (
                <div
                  key={section.id}
                  onClick={(e) => { e.stopPropagation(); selectSection(section.id); }}
                  className={`relative cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-blue-300'
                  }`}
                >
                  {/* Section content */}
                  <SectionRenderer section={section} />

                  {/* Section label (visible on hover/select) */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 flex gap-1">
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                        {section.component}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                        className="px-2 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionRenderer({ section }: { section: any }) {
  const componentType = section.component;

  if (componentType.includes('hero')) {
    return (
      <section className="relative py-20 px-8 bg-gradient-to-br from-blue-50 to-indigo-50 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{section.props.title}</h1>
        {section.props.subtitle && <p className="text-lg text-gray-600 mb-6">{section.props.subtitle}</p>}
        {section.props.ctaText && (
          <a href={section.props.ctaLink || '#'} className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">
            {section.props.ctaText}
          </a>
        )}
      </section>
    );
  }

  if (componentType.includes('features')) {
    const features = [
      { icon: '⚡', title: 'Fast', description: 'Lightning-fast performance' },
      { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
      { icon: '📱', title: 'Mobile', description: 'Optimized for all devices' },
      { icon: '🔄', title: 'Auto', description: 'Automatic updates' },
      { icon: '📊', title: 'Analytics', description: 'Deep insights' },
      { icon: '🤝', title: 'Team', description: 'Collaboration built-in' },
    ];
    const cols = section.props.columns || 3;
    const gridCols = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

    return (
      <section className="py-16 px-8">
        <h2 className="text-3xl font-bold text-center mb-4">{section.props.title}</h2>
        {section.props.subtitle && <p className="text-gray-600 text-center mb-12">{section.props.subtitle}</p>}
        <div className={`grid grid-cols-1 ${gridCols} gap-8 max-w-6xl mx-auto`}>
          {features.slice(0, cols * 2).map((f, i) => (
            <div key={i} className="p-6 rounded-lg border text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (componentType.includes('pricing')) {
    const tiers = [
      { name: 'Starter', price: '$9', period: 'mo', features: ['1 Project', '1GB Storage', 'Basic Support'] },
      { name: 'Pro', price: '$29', period: 'mo', features: ['Unlimited Projects', '100GB Storage', 'Priority Support'], highlighted: true },
      { name: 'Enterprise', price: '$99', period: 'mo', features: ['Everything in Pro', 'Unlimited Storage', 'Dedicated Support'] },
    ];

    return (
      <section className="py-16 px-8 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-4">{section.props.title}</h2>
        {section.props.subtitle && <p className="text-gray-600 text-center mb-12">{section.props.subtitle}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <div key={i} className={`rounded-xl p-6 ${tier.highlighted ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-2 scale-105' : 'bg-white border'}`}>
              <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
              <div className="text-3xl font-bold mb-4">{tier.price}<span className="text-sm">/{tier.period}</span></div>
              <ul className="space-y-2 mb-6">
                {tier.features.map((f, j) => <li key={j}>✓ {f}</li>)}
              </ul>
              <a href="#" className={`block text-center py-2 rounded font-semibold ${tier.highlighted ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                Get Started
              </a>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (componentType.includes('cta')) {
    return (
      <section className="py-16 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">{section.props.title}</h2>
        <p className="text-blue-100 mb-6">{section.props.subtitle || 'Ready to get started?'}</p>
        <a href={section.props.buttonLink || '#'} className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold">
          {section.props.buttonText}
        </a>
      </section>
    );
  }

  return (
    <section className="py-12 px-8 border-b border-gray-200">
      <div className="text-center text-gray-400">{section.component}</div>
    </section>
  );
}

export default Canvas;
