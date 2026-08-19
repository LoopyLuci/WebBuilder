'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { AndroidProjectGenerator, generateAndroidComponents, androidComponents } from '@webbuilder/android';
import { Emulator } from '@/components/emulator/Emulator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/editor';
export default function AndroidEditor() {
    const [projectName, setProjectName] = useState('MyApp');
    const [packageName, setPackageName] = useState('com.example.myapp');
    const [selectedComponents, setSelectedComponents] = useState(['android-button', 'android-text', 'android-card']);
    const [generatedFiles, setGeneratedFiles] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('design');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
                permissions: ['android.permission.INTERNET'],
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
    const toggleComponent = (id) => {
        setSelectedComponents(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };
    return (_jsxs("div", { className: "h-screen flex flex-col bg-background", children: [_jsxs("div", { className: "bg-background border-b px-4 sm:px-6 py-3 flex items-center justify-between shrink-0", children: [_jsxs("div", { className: "flex items-center gap-2 sm:gap-4", children: [_jsx("button", { onClick: () => setIsSidebarOpen(!isSidebarOpen), className: "lg:hidden p-2 rounded-lg hover:bg-muted", "aria-label": "Toggle sidebar", children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) }), _jsx("h1", { className: "text-lg font-bold hidden sm:block", children: "Android Builder" }), _jsx(Input, { value: projectName, onChange: (e) => setProjectName(e.target.value), placeholder: "Project name", className: "w-32 sm:w-48" }), _jsx(Input, { value: packageName, onChange: (e) => setPackageName(e.target.value), placeholder: "com.example.app", className: "w-48 sm:w-64 font-mono text-sm hidden sm:block" })] }), _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { onClick: handleGenerate, loading: isGenerating, shortcut: "\u2318\u23CE", children: [_jsx("span", { className: "hidden sm:inline", children: "Generate" }), _jsx("span", { className: "sm:hidden", children: "\u26A1" })] }) })] }), _jsx("div", { className: "bg-background border-b px-4 sm:px-6 flex gap-4 shrink-0 overflow-x-auto", children: ['design', 'code', 'emulator'].map(tab => (_jsx("button", { onClick: () => setActiveTab(tab), className: `py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: tab === 'design' ? '🎨 Design' : tab === 'code' ? '💻 Code' : '📱 Emulator' }, tab))) }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [activeTab === 'design' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: `w-72 bg-muted/30 border-r overflow-auto p-4 shrink-0 transition-all duration-200 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`, children: [_jsx("h3", { className: "font-semibold mb-3", children: "Components" }), _jsx("div", { className: "space-y-1", children: androidComponents.map(comp => (_jsxs("button", { onClick: () => toggleComponent(comp.id), className: `w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedComponents.includes(comp.id)
                                                ? 'bg-primary-100 text-primary-700'
                                                : 'hover:bg-muted'}`, children: [_jsx("span", { className: "font-medium", children: comp.name }), _jsx("span", { className: "text-xs text-muted-foreground block", children: comp.description })] }, comp.id))) })] }), _jsxs("div", { className: "flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto relative", children: [isGenerating && (_jsx("div", { className: "absolute inset-0 bg-background/80 flex items-center justify-center z-10", children: _jsx(LoadingSpinner, { size: "lg", label: "Generating project..." }) })), _jsx(Emulator, { projectName: projectName, packageName: packageName, components: selectedComponents })] })] })), activeTab === 'code' && (_jsxs("div", { className: "flex-1 flex", children: [_jsxs("div", { className: "w-64 bg-muted/30 border-r overflow-auto shrink-0 hidden sm:block", children: [_jsx("div", { className: "p-3 border-b", children: _jsx("h3", { className: "font-semibold text-sm", children: "Files" }) }), _jsx("div", { className: "p-2", children: generatedFiles.length > 0 ? (generatedFiles.map((file, i) => (_jsx("div", { className: "px-2 py-1 text-xs font-mono text-muted-foreground hover:bg-muted rounded cursor-pointer", children: file.path }, i)))) : (_jsx("p", { className: "text-sm text-muted-foreground p-2", children: "Generate a project to see files" })) })] }), _jsx("div", { className: "flex-1 bg-gray-900 text-green-400 p-4 overflow-auto font-mono text-sm", children: generatedFiles.length > 0 ? (_jsx("pre", { className: "whitespace-pre-wrap", children: generatedFiles[0]?.content })) : (_jsx("span", { className: "text-gray-500", children: "Generate a project to see code" })) })] })), activeTab === 'emulator' && (_jsx("div", { className: "flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto", children: _jsx(Emulator, { projectName: projectName, packageName: packageName, components: selectedComponents }) }))] })] }));
}
//# sourceMappingURL=android.js.map