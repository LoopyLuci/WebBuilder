'use client';

import React, { useState } from 'react';
import { DeviceFrame } from './DeviceFrame';
import { StatusBar } from './StatusBar';
import { NavigationBar } from './NavigationBar';
import { AppPreview } from './AppPreview';
import { Button } from '@/components/ui/Button';
import { devicePresets } from '@webbuilder/android';

interface EmulatorProps {
  projectName?: string;
  packageName?: string;
  components?: string[];
  defaultDevice?: typeof devicePresets[0];
}

export function Emulator({ projectName = 'MyApp', packageName = 'com.example.app', components = [], defaultDevice = devicePresets[0] }: EmulatorProps) {
  const [selectedDevice, setSelectedDevice] = useState(defaultDevice);
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const screenWidth = orientation === 'portrait' ? selectedDevice.screenWidth / 3 : selectedDevice.screenHeight / 3;
  const screenHeight = orientation === 'portrait' ? selectedDevice.screenHeight / 3 : selectedDevice.screenWidth / 3;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Device Frame */}
      <DeviceFrame width={screenWidth} height={screenHeight} name={selectedDevice.name}>
        {isPoweredOn ? (
          <div className="flex flex-col h-full">
            <StatusBar />
            <div className="flex-1 overflow-hidden">
              <AppPreview projectName={projectName} packageName={packageName} components={components} />
            </div>
            <NavigationBar />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-black">
            <p className="text-gray-600 text-sm">Press power to start</p>
          </div>
        )}
      </DeviceFrame>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant={isPoweredOn ? 'primary' : 'secondary'}
          onClick={() => setIsPoweredOn(!isPoweredOn)}
        >
          {isPoweredOn ? '⏻ Power Off' : '⏻ Power On'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
        >
          🔄 Rotate
        </Button>
        <select
          value={selectedDevice.name}
          onChange={(e) => setSelectedDevice(devicePresets.find(d => d.name === e.target.value) || devicePresets[0])}
          className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background"
        >
          {devicePresets.map(d => (
            <option key={d.name} value={d.name}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Device Info */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{selectedDevice.screenWidth}×{selectedDevice.screenHeight}</span>
        <span>API {selectedDevice.apiLevel}</span>
        <span>{selectedDevice.density} dpi</span>
      </div>
    </div>
  );
}

export default Emulator;
