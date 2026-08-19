import { describe, it, expect } from 'vitest';
import { AndroidEmulator, createEmulator, devicePresets, } from '../../dist/index.js';
describe('AndroidEmulator', () => {
    it('should create an emulator with default device', () => {
        const emulator = new AndroidEmulator();
        expect(emulator).toBeDefined();
        expect(emulator.isRunning()).toBe(false);
    });
    it('should create an emulator with custom device', () => {
        const customDevice = {
            name: 'Custom Device',
            screenWidth: 1080,
            screenHeight: 1920,
            density: 420,
            apiLevel: 33,
        };
        const emulator = new AndroidEmulator(customDevice);
        const device = emulator.getDevice();
        expect(device.name).toBe('Custom Device');
        expect(device.screenWidth).toBe(1080);
        expect(device.screenHeight).toBe(1920);
        expect(device.density).toBe(420);
        expect(device.apiLevel).toBe(33);
    });
    it('should start the emulator', async () => {
        const emulator = new AndroidEmulator();
        const result = await emulator.start();
        expect(result).toBe(true);
        expect(emulator.isRunning()).toBe(true);
    });
    it('should stop the emulator', async () => {
        const emulator = new AndroidEmulator();
        await emulator.start();
        const result = await emulator.stop();
        expect(result).toBe(true);
        expect(emulator.isRunning()).toBe(false);
    });
    it('should get initial state', () => {
        const emulator = new AndroidEmulator();
        const state = emulator.getState();
        expect(state.isRunning).toBe(false);
        expect(state.installedApps).toEqual([]);
        expect(state.currentApp).toBeNull();
        expect(state.logs).toEqual([]);
    });
    it('should install an APK when running', async () => {
        const emulator = new AndroidEmulator();
        await emulator.start();
        const result = await emulator.installApk('com.example.app', '/path/to/app.apk');
        expect(result).toBe(true);
        const state = emulator.getState();
        expect(state.installedApps).toContain('com.example.app');
    });
    it('should fail to install APK when not running', async () => {
        const emulator = new AndroidEmulator();
        const result = await emulator.installApk('com.example.app', '/path/to/app.apk');
        expect(result).toBe(false);
    });
    it('should launch an installed app', async () => {
        const emulator = new AndroidEmulator();
        await emulator.start();
        await emulator.installApk('com.example.app', '/path/to/app.apk');
        const result = await emulator.launchApp('com.example.app');
        expect(result).toBe(true);
        const state = emulator.getState();
        expect(state.currentApp).toBe('com.example.app');
    });
    it('should fail to launch app when not running', async () => {
        const emulator = new AndroidEmulator();
        const result = await emulator.launchApp('com.example.app');
        expect(result).toBe(false);
    });
    it('should fail to launch uninstalled app', async () => {
        const emulator = new AndroidEmulator();
        await emulator.start();
        const result = await emulator.launchApp('com.example.notinstalled');
        expect(result).toBe(false);
    });
    it('should uninstall an app', async () => {
        const emulator = new AndroidEmulator();
        await emulator.start();
        await emulator.installApk('com.example.app', '/path/to/app.apk');
        const result = await emulator.uninstallApp('com.example.app');
        expect(result).toBe(true);
        const state = emulator.getState();
        expect(state.installedApps).not.toContain('com.example.app');
    });
    it('should clear currentApp when uninstalling the current app', async () => {
        const emulator = new AndroidEmulator();
        await emulator.start();
        await emulator.installApk('com.example.app', '/path/to/app.apk');
        await emulator.launchApp('com.example.app');
        await emulator.uninstallApp('com.example.app');
        const state = emulator.getState();
        expect(state.currentApp).toBeNull();
    });
    it('should send input events when running', async () => {
        const emulator = new AndroidEmulator();
        await emulator.start();
        const result = await emulator.sendInput('tap', { x: 100, y: 200 });
        expect(result).toBe(true);
        const state = emulator.getState();
        expect(state.logs.some((log) => log.includes('Input: tap'))).toBe(true);
    });
    it('should fail to send input when not running', async () => {
        const emulator = new AndroidEmulator();
        const result = await emulator.sendInput('tap', { x: 100, y: 200 });
        expect(result).toBe(false);
    });
    it('should take a screenshot when running', async () => {
        const emulator = new AndroidEmulator();
        await emulator.start();
        const result = await emulator.screenshot();
        expect(typeof result).toBe('string');
        expect(result).toMatch(/\.png$/);
    });
    it('should return empty string when taking screenshot while not running', async () => {
        const emulator = new AndroidEmulator();
        const result = await emulator.screenshot();
        expect(result).toBe('');
    });
    it('should get logcat output', async () => {
        const emulator = new AndroidEmulator();
        await emulator.start();
        await emulator.installApk('com.example.app', '/path/to/app.apk');
        const logs = await emulator.getLogcat(10);
        expect(Array.isArray(logs)).toBe(true);
        expect(logs.some((log) => log.includes('Emulator starting'))).toBe(true);
        expect(logs.some((log) => log.includes('Installed: com.example.app'))).toBe(true);
    });
    it('should track logs with timestamps', async () => {
        const emulator = new AndroidEmulator();
        await emulator.start();
        const logs = await emulator.getLogcat(100);
        for (const log of logs) {
            expect(log).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        }
    });
    it('should handle multiple input types', async () => {
        const emulator = new AndroidEmulator();
        await emulator.start();
        await emulator.sendInput('tap', { x: 50, y: 100 });
        await emulator.sendInput('swipe', { from: { x: 0, y: 0 }, to: { x: 100, y: 100 } });
        await emulator.sendInput('text', { value: 'hello' });
        await emulator.sendInput('key', { keyCode: 66 });
        const state = emulator.getState();
        expect(state.logs.some((log) => log.includes('tap'))).toBe(true);
        expect(state.logs.some((log) => log.includes('swipe'))).toBe(true);
        expect(state.logs.some((log) => log.includes('text'))).toBe(true);
        expect(state.logs.some((log) => log.includes('key'))).toBe(true);
    });
});
describe('createEmulator', () => {
    it('should create an emulator instance', () => {
        const emulator = createEmulator();
        expect(emulator).toBeInstanceOf(AndroidEmulator);
    });
    it('should create an emulator with a custom device', () => {
        const customDevice = {
            name: 'Test Device',
            screenWidth: 720,
            screenHeight: 1280,
            density: 320,
            apiLevel: 30,
        };
        const emulator = createEmulator(customDevice);
        expect(emulator.getDevice().name).toBe('Test Device');
    });
});
describe('devicePresets', () => {
    it('should contain multiple presets', () => {
        expect(Array.isArray(devicePresets)).toBe(true);
        expect(devicePresets.length).toBeGreaterThan(5);
    });
    it('should have valid device structure', () => {
        for (const device of devicePresets) {
            expect(device).toHaveProperty('name');
            expect(device).toHaveProperty('screenWidth');
            expect(device).toHaveProperty('screenHeight');
            expect(device).toHaveProperty('density');
            expect(device).toHaveProperty('apiLevel');
            expect(typeof device.name).toBe('string');
            expect(typeof device.screenWidth).toBe('number');
            expect(typeof device.screenHeight).toBe('number');
            expect(typeof device.density).toBe('number');
            expect(typeof device.apiLevel).toBe('number');
        }
    });
    it('should include Pixel devices', () => {
        const names = devicePresets.map((d) => d.name);
        expect(names.some((n) => n.startsWith('Pixel'))).toBe(true);
    });
    it('should include Samsung devices', () => {
        const names = devicePresets.map((d) => d.name);
        expect(names.some((n) => n.includes('Samsung'))).toBe(true);
    });
    it('should include tablet presets', () => {
        const names = devicePresets.map((d) => d.name);
        expect(names.some((n) => n.includes('Tablet'))).toBe(true);
    });
    it('should have positive dimensions and density', () => {
        for (const device of devicePresets) {
            expect(device.screenWidth).toBeGreaterThan(0);
            expect(device.screenHeight).toBeGreaterThan(0);
            expect(device.density).toBeGreaterThan(0);
            expect(device.apiLevel).toBeGreaterThan(20);
        }
    });
    it('should have unique device names', () => {
        const names = devicePresets.map((d) => d.name);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBe(names.length);
    });
});
//# sourceMappingURL=emulator.test.js.map