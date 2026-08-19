'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { DeviceFrame } from './DeviceFrame';
import { StatusBar } from './StatusBar';
import { NavigationBar } from './NavigationBar';
import { AppPreview } from './AppPreview';
import { Button } from '@/components/ui/Button';
import { devicePresets } from '@webbuilder/android';
export function Emulator({ projectName = 'MyApp', packageName = 'com.example.app', components = [], defaultDevice = devicePresets[0] }) {
    const [selectedDevice, setSelectedDevice] = useState(defaultDevice);
    const [isPoweredOn, setIsPoweredOn] = useState(true);
    const [orientation, setOrientation] = useState('portrait');
    const screenWidth = orientation === 'portrait' ? selectedDevice.screenWidth / 3 : selectedDevice.screenHeight / 3;
    const screenHeight = orientation === 'portrait' ? selectedDevice.screenHeight / 3 : selectedDevice.screenWidth / 3;
    return (_jsxs("div", { className: "flex flex-col items-center gap-6", children: [_jsx(DeviceFrame, { width: screenWidth, height: screenHeight, name: selectedDevice.name, children: isPoweredOn ? (_jsxs("div", { className: "flex flex-col h-full", children: [_jsx(StatusBar, {}), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsx(AppPreview, { projectName: projectName, packageName: packageName, components: components }) }), _jsx(NavigationBar, {})] })) : (_jsx("div", { className: "flex items-center justify-center h-full bg-black", children: _jsx("p", { className: "text-gray-600 text-sm", children: "Press power to start" }) })) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { size: "sm", variant: isPoweredOn ? 'primary' : 'secondary', onClick: () => setIsPoweredOn(!isPoweredOn), children: isPoweredOn ? '⏻ Power Off' : '⏻ Power On' }), _jsx(Button, { size: "sm", variant: "secondary", onClick: () => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait'), children: "\uD83D\uDD04 Rotate" }), _jsx("select", { value: selectedDevice.name, onChange: (e) => setSelectedDevice(devicePresets.find(d => d.name === e.target.value) || devicePresets[0]), className: "px-3 py-1.5 text-sm border border-border rounded-lg bg-background", children: devicePresets.map(d => (_jsx("option", { value: d.name, children: d.name }, d.name))) })] }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [_jsxs("span", { children: [selectedDevice.screenWidth, "\u00D7", selectedDevice.screenHeight] }), _jsxs("span", { children: ["API ", selectedDevice.apiLevel] }), _jsxs("span", { children: [selectedDevice.density, " dpi"] })] })] }));
}
export default Emulator;
//# sourceMappingURL=Emulator.js.map