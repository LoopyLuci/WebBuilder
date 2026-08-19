'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useEditor, showToast, ToastContainer } from '@/editor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

// ─── Component Palette ─────────────────────────────────────────────────────

const componentPalette = [
  { type: 'hero', name: 'Hero Section', icon: '🖼️', category: 'Layout' },
  { type: 'features', name: 'Features Grid', icon: '📋', category: 'Layout' },
  { type: 'pricing', name: 'Pricing Table', icon: '💰', category: 'Layout' },
  { type: 'cta', name: 'CTA Section', icon: '📣', category: 'Layout' },
  { type: 'stats', name: 'Stats Grid', icon: '📊', category: 'Display' },
  { type: 'testimonials', name: 'Testimonials', icon: '💬', category: 'Display' },
  { type: 'footer', name: 'Footer', icon: '📄', category: 'Navigation' },
  { type: 'navbar', name: 'Navbar', icon: '🔝', category: 'Navigation' },
];

export default function VisualEditor() {
  const { state, isLoading, addSection, removeSection, selectSection, undo, redo, setViewport, setZoom } = useEditor();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'components' | 'properties'>('components');

  const filteredComponents = componentPalette.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewportWidth = state.viewport === 'mobile' ? 375 : state.viewport === 'tablet' ? 768 : '100%';

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">WebBuilder</h1>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(['mobile', 'tablet', 'desktop'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewport(v)}
                className={`px-3 py-1 rounded text-sm ${
                  state.viewport === v ? 'bg-background shadow text-primary-600' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v === 'mobile' ? '📱' : v === 'tablet' ? '📟' : '🖥️'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setZoom(state.zoom - 0.1)}>-</Button>
            <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(state.zoom * 100)}%</span>
            <Button size="sm" variant="ghost" onClick={() => setZoom(state.zoom + 0.1)}>+</Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={undo} disabled={state.historyIndex === 0}>↩ Undo</Button>
          <Button size="sm" variant="ghost" onClick={redo} disabled={state.historyIndex === state.history.length - 1}>↪ Redo</Button>
          <Button size="sm" variant="primary">
            🚀 Deploy
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 border-r border-border bg-muted/30 flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedTab('components')}
                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium ${
                  selectedTab === 'components' ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setSelectedTab('properties')}
                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium ${
                  selectedTab === 'properties' ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Properties
              </button>
            </div>
          </div>

          {selectedTab === 'components' && (
            <div className="flex-1 overflow-auto p-3 space-y-3">
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="space-y-1">
                {filteredComponents.map((comp) => (
                  <button
                    key={comp.type}
                    onClick={() => addSection(comp.type, comp.name)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left hover:bg-background border border-transparent hover:border-border transition-all"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('componentType', comp.type);
                      e.dataTransfer.setData('componentName', comp.name);
                    }}
                  >
                    <span className="text-xl">{comp.icon}</span>
                    <div>
                      <div className="font-medium">{comp.name}</div>
                      <div className="text-xs text-muted-foreground">{comp.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'properties' && (
            <div className="flex-1 overflow-auto p-3">
              {state.selectedSectionId ? (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm">Edit Section</h3>
                  {Object.entries(state.sections.find(s => s.id === state.selectedSectionId)?.props || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">{key}</label>
                      <Input
                        value={String(value)}
                        onChange={(e) => {
                          const section = state.sections.find(s => s.id === state.selectedSectionId);
                          if (section) {
                            updateSection(state.selectedSectionId!, {
                              props: { ...section.props, [key]: e.target.value }
                            });
                          }
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => removeSection(state.selectedSectionId!)}
                  >
                    Remove Section
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Select a component to edit
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-muted/50 overflow-auto p-8">
          <div
            className="mx-auto bg-background shadow-lg rounded-lg overflow-hidden transition-all duration-200"
            style={{ width: viewportWidth, minHeight: '800px' }}
          >
            {state.sections.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎨</div>
                  <p className="text-lg font-medium mb-2">Start building</p>
                  <p className="text-sm">Drag components here or click to add</p>
                </div>
              </div>
            ) : (
              state.sections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => selectSection(section.id)}
                  className={`relative cursor-pointer transition-all ${
                    state.selectedSectionId === section.id
                      ? 'ring-2 ring-primary-500 ring-offset-2'
                      : 'hover:ring-1 hover:ring-primary-300'
                  }`}
                >
                  <SectionRenderer section={section} />
                  {state.selectedSectionId === section.id && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant="primary">{section.name}</Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                        className="p-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

function SectionRenderer({ section }: { section: any }) {
  const componentType = section.component;

  if (componentType === 'hero') {
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

  if (componentType === 'features') {
    const features = [
      { icon: '⚡', title: 'Fast', description: 'Lightning-fast performance' },
      { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
      { icon: '📱', title: 'Mobile', description: 'Optimized for all devices' },
    ];

    return (
      <section className="py-16 px-8">
        <h2 className="text-3xl font-bold text-center mb-4">{section.props.title}</h2>
        {section.props.subtitle && <p className="text-gray-600 text-center mb-12">{section.props.subtitle}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((f, i) => (
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

  if (componentType === 'pricing') {
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

  return (
    <section className="py-12 px-8 border-b border-gray-200">
      <div className="text-center text-gray-400">{section.name}</div>
    </section>
  );
}

function updateSection(id: string, updates: any) {
  // This is a placeholder - the actual update is handled by the editor hook
}
