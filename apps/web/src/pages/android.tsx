'use client';

import React, { useState, useCallback } from 'react';
import { AndroidProjectGenerator } from '@webbuilder/android';
import { generateAndroidComponents, androidComponents } from '@webbuilder/android';
import { createEmulator, devicePresets } from '@webbuilder/android';

export default function AndroidEditor() {
  const [projectName, setProjectName] = useState('MyApp');
  const [packageName, setPackageName] = useState('com.example.myapp');
  const [selectedComponents, setSelectedComponents] = useState<string[]>(['android-scaffold', 'android-button', 'android-text']);
  const [selectedDevice, setSelectedDevice] = useState(devicePresets[0]);
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'code' | 'emulator'>('design');

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);

    const config = {
      name: projectName,
      packageName,
      minSdk: 24,
      targetSdk: 34,
      compileSdk: 34,
      buildToolsVersion: '34.0.0',
      kotlinVersion: '2.0.0',
      composeVersion: '2024.06.00',
      activities: [
        {
          name: 'MainActivity',
          packageName,
          title: projectName,
          layout: 'activity_main',
          isMainLauncher: true,
          isComposeActivity: true,
          composables: ['MainScreen'],
        },
      ],
      permissions: ['android.permission.INTERNET'] as any,
      dependencies: [],
      features: [],
    };

    const generator = new AndroidProjectGenerator(config);
    const project = generator.generate();

    // Add component files
    const componentFiles = generateAndroidComponents(selectedComponents, packageName);
    project.files.push(...componentFiles);

    setGeneratedFiles(project.files);
    setIsGenerating(false);
  }, [projectName, packageName, selectedComponents]);

  const toggleComponent = (id: string) => {
    setSelectedComponents(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Android Builder</h1>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm"
            placeholder="Project name"
          />
          <input
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm font-mono"
            placeholder="com.example.app"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : '⚡ Generate Project'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6 flex gap-4">
        {(['design', 'code', 'emulator'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-medium border-b-2 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
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
            <div className="w-72 bg-white border-r overflow-auto p-4">
              <h3 className="font-semibold mb-3">Components</h3>
              <div className="space-y-1">
                {androidComponents.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => toggleComponent(comp.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      selectedComponents.includes(comp.id)
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{comp.name}</span>
                    <span className="text-xs text-gray-500 block">{comp.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="bg-white rounded-3xl shadow-xl border-4 border-gray-800 overflow-hidden" style={{ width: 375, height: 700 }}>
                <div className="bg-gray-800 h-6 flex items-center justify-center">
                  <div className="w-16 h-3 bg-gray-700 rounded-full" />
                </div>
                <div className="h-full overflow-auto bg-white p-4">
                  <div className="text-center py-8">
                    <h2 className="text-2xl font-bold mb-2">{projectName}</h2>
                    <p className="text-gray-500 text-sm mb-6">Android App Preview</p>
                    {selectedComponents.includes('android-button') && (
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg mb-3">
                        Get Started
                      </button>
                    )}
                    {selectedComponents.includes('android-text') && (
                      <p className="text-gray-600 text-sm">
                        Your app content will appear here
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-800 h-6 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-full" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'code' && (
          <div className="flex-1 flex">
            <div className="w-64 bg-white border-r overflow-auto">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-sm">Files</h3>
              </div>
              <div className="p-2">
                {generatedFiles.map((file, i) => (
                  <div key={i} className="px-2 py-1 text-xs font-mono text-gray-600 hover:bg-gray-100 rounded">
                    {file.path}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-gray-900 text-green-400 p-4 overflow-auto font-mono text-sm">
              {generatedFiles.length > 0 ? (
                <pre>{generatedFiles[0]?.content}</pre>
              ) : (
                <span className="text-gray-500">Generate a project to see code</span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'emulator' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="mb-4">
              <select
                value={selectedDevice.name}
                onChange={(e) => setSelectedDevice(devicePresets.find(d => d.name === e.target.value) || devicePresets[0])}
                className="px-3 py-2 border rounded-lg"
              >
                {devicePresets.map(d => (
                  <option key={d.name} value={d.name}>{d.name} ({d.screenWidth}x{d.screenHeight})</option>
                ))}
              </select>
            </div>
            <div className="bg-black rounded-3xl shadow-xl border-4 border-gray-800 overflow-hidden" style={{ width: 375, height: 700 }}>
              <div className="bg-gray-800 h-6 flex items-center justify-center">
                <div className="w-16 h-3 bg-gray-700 rounded-full" />
              </div>
              <div className="h-full overflow-auto bg-white p-4">
                <div className="text-center py-8">
                  <h2 className="text-2xl font-bold mb-2">{projectName}</h2>
                  <p className="text-gray-500 text-sm">Running on {selectedDevice.name}</p>
                  <p className="text-gray-400 text-xs">API {selectedDevice.apiLevel}</p>
                </div>
              </div>
              <div className="bg-gray-800 h-6 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-700 rounded-full" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                ▶ Launch Emulator
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                📦 Install APK
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm">
                📸 Screenshot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
