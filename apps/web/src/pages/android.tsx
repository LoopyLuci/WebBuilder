'use client';

import React, { useState, useCallback } from 'react';
import { AndroidProjectGenerator, generateAndroidComponents, androidComponents } from '@webbuilder/android';
import { Emulator } from '@/components/emulator/Emulator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { showToast } from '@/editor';

export default function AndroidEditor() {
  const [projectName, setProjectName] = useState('MyApp');
  const [packageName, setPackageName] = useState('com.example.myapp');
  const [selectedComponents, setSelectedComponents] = useState<string[]>(['android-button', 'android-text', 'android-card']);
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'code' | 'emulator'>('design');

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const config = {
        name: projectName,
        packageName,
        minSdk: 24,
        targetSdk: 34,
        compileSdk: 34,
        buildToolsVersion: '34.0.0',
        kotlinVersion: '2.0.0',
        composeVersion: '2024.06.00',
        activities: [{
          name: 'MainActivity',
          packageName,
          title: projectName,
          layout: 'activity_main',
          isMainLauncher: true,
          isComposeActivity: true,
          composables: ['MainScreen'],
        }],
        permissions: ['android.permission.INTERNET'] as any,
        dependencies: [],
        features: [],
      };

      const generator = new AndroidProjectGenerator(config);
      const project = generator.generate();

      const componentFiles = generateAndroidComponents(selectedComponents, packageName);
      project.files.push(...componentFiles);

      setGeneratedFiles(project.files);
      setIsGenerating(false);
      showToast('success', `Generated ${project.files.length} files for ${projectName}`);
    }, 1000);
  }, [projectName, packageName, selectedComponents]);

  const toggleComponent = (id: string) => {
    setSelectedComponents(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-background border-b px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Android Builder</h1>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
            className="w-48"
          />
          <Input
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="com.example.app"
            className="w-64 font-mono text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            loading={isGenerating}
          >
            ⚡ Generate Project
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-background border-b px-6 flex gap-4 shrink-0">
        {(['design', 'code', 'emulator'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-medium border-b-2 ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'design' ? '🎨 Design' : tab === 'code' ? '💻 Code' : '📱 Emulator'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'design' && (
          <>
            {/* Component Library */}
            <div className="w-72 bg-muted/30 border-r overflow-auto p-4 shrink-0">
              <h3 className="font-semibold mb-3">Components</h3>
              <div className="space-y-1">
                {androidComponents.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => toggleComponent(comp.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      selectedComponents.includes(comp.id)
                        ? 'bg-primary-100 text-primary-700'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="font-medium">{comp.name}</span>
                    <span className="text-xs text-muted-foreground block">{comp.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
              <Emulator
                projectName={projectName}
                packageName={packageName}
                components={selectedComponents}
              />
            </div>
          </>
        )}

        {activeTab === 'code' && (
          <div className="flex-1 flex">
            <div className="w-64 bg-muted/30 border-r overflow-auto shrink-0">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-sm">Files</h3>
              </div>
              <div className="p-2">
                {generatedFiles.length > 0 ? (
                  generatedFiles.map((file, i) => (
                    <div key={i} className="px-2 py-1 text-xs font-mono text-muted-foreground hover:bg-muted rounded">
                      {file.path}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-2">Generate a project to see files</p>
                )}
              </div>
            </div>
            <div className="flex-1 bg-gray-900 text-green-400 p-4 overflow-auto font-mono text-sm">
              {generatedFiles.length > 0 ? (
                <pre className="whitespace-pre-wrap">{generatedFiles[0]?.content}</pre>
              ) : (
                <span className="text-gray-500">Generate a project to see code</span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'emulator' && (
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <Emulator
              projectName={projectName}
              packageName={packageName}
              components={selectedComponents}
            />
          </div>
        )}
      </div>
    </div>
  );
}
