'use client';

import React from 'react';
import { EditorProvider } from '@/editor';
import { Canvas } from '@/editor/Canvas';
import { Sidebar } from '@/editor/Sidebar';
import { PropertiesPanel } from '@/editor/Properties';
import { Toolbar } from '@/editor/Toolbar';
import { AIPanel } from '@/editor/AI';

const sampleSpec = {
  id: 'demo-project',
  name: 'Demo Landing Page',
  description: 'A demo landing page',
  structure: {
    pages: [
      {
        id: 'page-home',
        name: 'Home',
        path: '/',
        title: 'Home',
        description: 'Home page',
        sections: [
          {
            id: 'section-hero',
            name: 'Hero',
            component: 'hero-default',
            props: { title: 'Welcome to TaskFlow', subtitle: 'The best project management tool for teams', ctaText: 'Start Free Trial', ctaLink: '#' },
            children: [],
            responsive: {},
          },
          {
            id: 'section-features',
            name: 'Features',
            component: 'features-default',
            props: { title: 'Features', subtitle: 'Everything you need', columns: 3 },
            children: [],
            responsive: {},
          },
          {
            id: 'section-pricing',
            name: 'Pricing',
            component: 'pricing-default',
            props: { title: 'Pricing', subtitle: 'Choose your plan', tiers: 3 },
            children: [],
            responsive: {},
          },
          {
            id: 'section-cta',
            name: 'CTA',
            component: 'cta-default',
            props: { title: 'Ready to get started?', buttonText: 'Sign Up Now', buttonLink: '#' },
            children: [],
            responsive: {},
          },
        ],
      },
    ],
    navigation: [
      { id: 'nav-features', label: 'Features', path: '#features', children: [], external: false },
      { id: 'nav-pricing', label: 'Pricing', path: '#pricing', children: [], external: false },
    ],
    globals: [],
  },
};

export default function EditorPage() {
  return (
    <EditorProvider initialSpec={sampleSpec}>
      <div className="h-screen flex flex-col">
        <Toolbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <Canvas />
          <PropertiesPanel />
          <AIPanel />
        </div>
      </div>
    </EditorProvider>
  );
}
