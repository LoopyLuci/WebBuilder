'use client';

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EditorProvider, useEditorContext, ToastContainer } from '@/editor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DraggableComponent } from '@/components/editor/DraggableComponent';
import { SortableSection } from '@/components/editor/SortableSection';
import { DropZone } from '@/components/editor/DropZone';
import { showToast } from '@/editor';

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

function DragDropEditor() {
  const { state, addSection, removeSection, updateSection, selectSection, undo, redo, setViewport, setZoom } = useEditorContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredComponents = componentPalette.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewportWidth = state.viewport === 'mobile' ? 375 : state.viewport === 'tablet' ? 768 : '100%';

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const over = event.over;
    setOverId(over ? (over.id as string) : null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);

    const { active, over } = event;

    if (!over) {
      // Dropped outside canvas — check if it's a new component from palette
      const paletteItem = componentPalette.find(c => c.type === active.id);
      if (paletteItem) {
        addSection(paletteItem.type, paletteItem.name);
        showToast('success', `${paletteItem.name} added`);
      }
      return;
    }

    // Reordering existing sections
    if (active.id !== over.id) {
      const oldIndex = state.sections.findIndex(s => s.id === active.id);
      const newIndex = state.sections.findIndex(s => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = [...state.sections];
        const [moved] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, moved);
        updateSection(moved.id, { props: moved.props }); // Trigger state update
        showToast('info', 'Section reordered');
      }
    }
  }, [state.sections, addSection, updateSection]);

  const handleComponentClick = useCallback((type: string, name: string) => {
    addSection(type, name);
  }, [addSection]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-background">
        {/* Toolbar */}
        <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
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
            <Button size="sm" variant="primary">🚀 Deploy</Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar — Component Palette */}
          <div className="w-72 border-r border-border bg-muted/30 flex flex-col shrink-0">
            <div className="p-3 border-b border-border">
              <h2 className="text-sm font-semibold mb-2">Components</h2>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-1">
              {filteredComponents.map((comp) => (
                <DraggableComponent
                  key={comp.type}
                  id={comp.type}
                  type={comp.type}
                  name={comp.name}
                  icon={comp.icon}
                  category={comp.category}
                  onClick={() => handleComponentClick(comp.type, comp.name)}
                />
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-muted/50 overflow-auto p-8">
            <div
              className="mx-auto bg-background shadow-lg rounded-lg overflow-hidden transition-all duration-200"
              style={{ width: viewportWidth, minHeight: '800px' }}
            >
              <DropZone id="canvas-dropzone" isOver={!!overId && state.sections.length === 0}>
                {state.sections.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground py-32">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎨</div>
                      <p className="text-lg font-medium mb-2">Drag components here</p>
                      <p className="text-sm">Or click a component to add it</p>
                    </div>
                  </div>
                ) : (
                  <SortableContext items={state.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {state.sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        id={section.id}
                        isSelected={state.selectedSectionId === section.id}
                        onSelect={() => selectSection(section.id)}
                        onRemove={() => removeSection(section.id)}
                      >
                        <SectionRenderer section={section} />
                      </SortableSection>
                    ))}
                  </SortableContext>
                )}
              </DropZone>
            </div>
          </div>

          {/* Right Sidebar — Properties */}
          <div className="w-72 border-l border-border bg-muted/30 flex flex-col shrink-0">
            <div className="p-3 border-b border-border">
              <h2 className="text-sm font-semibold">Properties</h2>
            </div>
            <div className="flex-1 overflow-auto p-3">
              {state.selectedSectionId ? (
                <div className="space-y-3">
                  {Object.entries(state.sections.find(s => s.id === state.selectedSectionId)?.props || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-muted-foreground mb-1 capitalize">{key}</label>
                      <Input value={String(value)} onChange={() => {}} />
                    </div>
                  ))}
                  <Button size="sm" variant="danger" onClick={() => removeSection(state.selectedSectionId!)}>
                    Remove Section
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Select a component to edit
                </div>
              )}
            </div>
          </div>
        </div>

        <ToastContainer />
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="bg-background rounded-lg shadow-2xl p-4 border border-border">
            {componentPalette.find(c => c.type === activeId)?.name || 'Section'}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default function EditorPage() {
  return (
    <EditorProvider>
      <DragDropEditor />
    </EditorProvider>
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
