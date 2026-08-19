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
import { CommandPalette } from '@/components/ui/CommandPalette';
import { EmptyState } from '@/components/ui/EmptyState';
import { WelcomeModal } from '@/components/ui/WelcomeModal';
import { Tooltip } from '@/components/ui/Tooltip';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
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

function EditorWithShortcuts() {
  const {
    state, isLoading, addSection, removeSection, updateSection,
    selectSection, undo, redo, setViewport, setZoom
  } = useEditorContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if first visit
  React.useEffect(() => {
    const hasVisited = localStorage.getItem('webbuilder-visited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('webbuilder-visited', 'true');
    }
  }, []);

  // ─── Keyboard Shortcuts ──────────────────────────────────────────────────

  const handleUndo = useCallback(() => {
    if (state.historyIndex > 0) {
      undo();
      showToast('info', 'Undo');
    }
  }, [state.historyIndex, undo]);

  const handleRedo = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
      redo();
      showToast('info', 'Redo');
    }
  }, [state.historyIndex, state.history.length, redo]);

  const handleDelete = useCallback(() => {
    if (state.selectedSectionId) {
      removeSection(state.selectedSectionId);
    }
  }, [state.selectedSectionId, removeSection]);

  const handleDuplicate = useCallback(() => {
    if (state.selectedSectionId) {
      const section = state.sections.find(s => s.id === state.selectedSectionId);
      if (section) {
        addSection(section.component, section.name);
        showToast('success', `${section.name} duplicated`);
      }
    }
  }, [state.selectedSectionId, state.sections, addSection]);

  const handleZoomIn = useCallback(() => setZoom(state.zoom + 0.1), [state.zoom, setZoom]);
  const handleZoomOut = useCallback(() => setZoom(state.zoom - 0.1), [state.zoom, setZoom]);

  const handleSave = useCallback(() => {
    showToast('success', 'Project saved');
  }, []);

  useKeyboardShortcuts({
    'mod+z': handleUndo,
    'mod+shift+z': handleRedo,
    'mod+s': handleSave,
    'mod+d': handleDuplicate,
    'mod+k': () => setIsPaletteOpen(true),
    'mod+=': handleZoomIn,
    'mod+-': handleZoomOut,
    'delete': handleDelete,
    'backspace': handleDelete,
    'escape': () => selectSection(null),
    '1': () => setViewport('mobile'),
    '2': () => setViewport('tablet'),
    '3': () => setViewport('desktop'),
  });

  // ─── Drag and Drop ───────────────────────────────────────────────────────

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
    setOverId(event.over ? (event.over.id as string) : null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);

    const { active, over } = event;

    if (!over) {
      const paletteItem = componentPalette.find(c => c.type === active.id);
      if (paletteItem) {
        addSection(paletteItem.type, paletteItem.name);
      }
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = state.sections.findIndex(s => s.id === active.id);
      const newIndex = state.sections.findIndex(s => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = [...state.sections];
        const [moved] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, moved);
        updateSection(moved.id, moved);
      }
    }
  }, [state.sections, addSection, updateSection]);

  const handleComponentClick = useCallback((type: string, name: string) => {
    addSection(type, name);
  }, [addSection]);

  // ─── Command Palette Commands ─────────────────────────────────────────────

  const commands = [
    ...componentPalette.map(c => ({
      id: `add-${c.type}`,
      label: `Add ${c.name}`,
      description: `Insert a ${c.name.toLowerCase()} into your page`,
      icon: c.icon,
      category: 'Components',
      action: () => handleComponentClick(c.type, c.name),
    })),
    {
      id: 'undo',
      label: 'Undo',
      description: 'Undo the last action',
      icon: '↩',
      category: 'Edit',
      shortcut: '⌘Z',
      action: handleUndo,
    },
    {
      id: 'redo',
      label: 'Redo',
      description: 'Redo the last undone action',
      icon: '↪',
      category: 'Edit',
      shortcut: '⌘⇧Z',
      action: handleRedo,
    },
    {
      id: 'duplicate',
      label: 'Duplicate Section',
      description: 'Duplicate the selected section',
      icon: '📋',
      category: 'Edit',
      shortcut: '⌘D',
      action: handleDuplicate,
    },
    {
      id: 'delete',
      label: 'Delete Section',
      description: 'Remove the selected section',
      icon: '🗑️',
      category: 'Edit',
      shortcut: '⌫',
      action: handleDelete,
    },
    {
      id: 'viewport-mobile',
      label: 'Mobile Viewport',
      description: 'Switch to mobile preview',
      icon: '📱',
      category: 'View',
      shortcut: '1',
      action: () => setViewport('mobile'),
    },
    {
      id: 'viewport-tablet',
      label: 'Tablet Viewport',
      description: 'Switch to tablet preview',
      icon: '📟',
      category: 'View',
      shortcut: '2',
      action: () => setViewport('tablet'),
    },
    {
      id: 'viewport-desktop',
      label: 'Desktop Viewport',
      description: 'Switch to desktop preview',
      icon: '🖥️',
      category: 'View',
      shortcut: '3',
      action: () => setViewport('desktop'),
    },
    {
      id: 'zoom-in',
      label: 'Zoom In',
      description: 'Increase canvas zoom',
      icon: '🔍',
      category: 'View',
      shortcut: '⌘+',
      action: handleZoomIn,
    },
    {
      id: 'zoom-out',
      label: 'Zoom Out',
      description: 'Decrease canvas zoom',
      icon: '🔍',
      category: 'View',
      shortcut: '⌘-',
      action: handleZoomOut,
    },
    {
      id: 'save',
      label: 'Save Project',
      description: 'Save your current project',
      icon: '💾',
      category: 'File',
      shortcut: '⌘S',
      action: handleSave,
    },
    {
      id: 'deploy',
      label: 'Deploy',
      description: 'Deploy your project to production',
      icon: '🚀',
      category: 'File',
      action: () => showToast('success', 'Deployment started!'),
    },
    {
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      description: 'Show or hide the components panel',
      icon: '📐',
      category: 'View',
      action: () => setIsSidebarOpen(!isSidebarOpen),
    },
    {
      id: 'toggle-properties',
      label: 'Toggle Properties',
      description: 'Show or hide the properties panel',
      icon: '⚙️',
      category: 'View',
      action: () => setIsPropertiesOpen(!isPropertiesOpen),
    },
    {
      id: 'help',
      label: 'Keyboard Shortcuts',
      description: 'View all keyboard shortcuts',
      icon: '⌨️',
      category: 'Help',
      action: () => setIsPaletteOpen(true),
    },
  ];

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
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <Tooltip content="Toggle sidebar" position="bottom">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </Tooltip>

            <h1 className="text-lg font-bold hidden sm:block">WebBuilder</h1>

            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {(['mobile', 'tablet', 'desktop'] as const).map((v, i) => (
                <Tooltip key={v} content={`${v} (${i + 1})`} position="bottom">
                  <button
                    onClick={() => setViewport(v)}
                    className={`px-3 py-1 rounded text-sm ${
                      state.viewport === v ? 'bg-background shadow text-primary-600' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {v === 'mobile' ? '📱' : v === 'tablet' ? '📟' : '🖥️'}
                  </button>
                </Tooltip>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Tooltip content="Zoom out (⌘-)" position="bottom">
                <Button size="sm" variant="ghost" onClick={handleZoomOut} className="w-8 p-0">-</Button>
              </Tooltip>
              <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(state.zoom * 100)}%</span>
              <Tooltip content="Zoom in (⌘+)" position="bottom">
                <Button size="sm" variant="ghost" onClick={handleZoomIn} className="w-8 p-0">+</Button>
              </Tooltip>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content="Undo (⌘Z)" position="bottom">
              <Button size="sm" variant="ghost" onClick={handleUndo} disabled={state.historyIndex === 0}>
                ↩
              </Button>
            </Tooltip>
            <Tooltip content="Redo (⌘⇧Z)" position="bottom">
              <Button size="sm" variant="ghost" onClick={handleRedo} disabled={state.historyIndex === state.history.length - 1}>
                ↪
              </Button>
            </Tooltip>
            <Tooltip content="Command Palette (⌘K)" position="bottom">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsPaletteOpen(true)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline ml-1">⌘K</span>
              </Button>
            </Tooltip>
            <Tooltip content="Deploy" position="bottom">
              <Button size="sm" variant="primary" onClick={() => showToast('success', 'Deployment started!')}>
                🚀
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar — Component Palette */}
          <div className={`w-72 border-r border-border bg-muted/30 flex-col shrink-0 overflow-hidden transition-all duration-200 ${
            isSidebarOpen ? 'flex' : 'hidden'
          }`}>
            <div className="p-3 border-b border-border shrink-0">
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
          <div className="flex-1 bg-muted/50 overflow-auto p-4 sm:p-8">
            <div
              className="mx-auto bg-background shadow-lg rounded-lg overflow-hidden transition-all duration-200"
              style={{ width: viewportWidth, minHeight: '800px' }}
            >
              <DropZone id="canvas-dropzone" isOver={!!overId && state.sections.length === 0}>
                {state.sections.length === 0 ? (
                  <EmptyState
                    icon="🎨"
                    title="Start building"
                    description="Drag components here or click to add. Press ⌘K for command palette."
                    action={{ label: 'Add Hero Section', onClick: () => handleComponentClick('hero', 'Hero Section') }}
                    secondaryAction={{ label: 'Open Command Palette', onClick: () => setIsPaletteOpen(true) }}
                  />
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
          <div className={`w-72 border-l border-border bg-muted/30 flex-col shrink-0 overflow-hidden transition-all duration-200 ${
            isPropertiesOpen ? 'flex' : 'hidden'
          }`}>
            <div className="p-3 border-b border-border shrink-0 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Properties</h2>
              {state.selectedSectionId && (
                <div className="flex gap-1">
                  <Tooltip content="Duplicate (⌘D)" position="bottom">
                    <Button size="sm" variant="ghost" onClick={handleDuplicate} className="w-7 h-7 p-0">
                      📋
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete (⌫)" position="bottom">
                    <Button size="sm" variant="ghost" onClick={handleDelete} className="w-7 h-7 p-0 text-red-500">
                      🗑️
                    </Button>
                  </Tooltip>
                </div>
              )}
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
                </div>
              ) : (
                <EmptyState
                  icon="👆"
                  title="Select a component"
                  description="Click on a section to edit its properties"
                />
              )}
            </div>
          </div>
        </div>

        <ToastContainer />
      </div>

      {/* Command Palette */}
      <CommandPalette
        commands={commands}
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onGetStarted={() => {
          setShowWelcome(false);
          setIsPaletteOpen(true);
        }}
      />

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
      <EditorWithShortcuts />
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
          <a href={section.props.ctaLink || '#'} className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
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
            <div key={i} className="p-6 rounded-lg border text-center hover:shadow-md transition-shadow">
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
