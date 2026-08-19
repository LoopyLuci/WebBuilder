import type { AndroidDevice } from '../types/index.js';
export interface EmulatorState {
    isRunning: boolean;
    device: AndroidDevice;
    installedApps: string[];
    currentApp: string | null;
    logs: string[];
}
export interface EmulatorCommand {
    type: 'install' | 'launch' | 'uninstall' | 'input' | 'screenshot' | 'logcat';
    payload: any;
}
/**
 * Desktop Android Emulator
 * Provides a virtual Android device for testing apps
 */
export declare class AndroidEmulator {
    private state;
    private config;
    constructor(device?: AndroidDevice);
    /**
     * Get default device configuration
     */
    private getDefaultDevice;
    /**
     * Start the emulator
     */
    start(): Promise<boolean>;
    /**
     * Stop the emulator
     */
    stop(): Promise<boolean>;
    /**
     * Install an APK
     */
    installApk(packageName: string, apkPath: string): Promise<boolean>;
    /**
     * Launch an app
     */
    launchApp(packageName: string): Promise<boolean>;
    /**
     * Uninstall an app
     */
    uninstallApp(packageName: string): Promise<boolean>;
    /**
     * Send input event
     */
    sendInput(type: 'tap' | 'swipe' | 'text' | 'key', data: any): Promise<boolean>;
    /**
     * Take a screenshot
     */
    screenshot(): Promise<string>;
    /**
     * Get logcat output
     */
    getLogcat(lines?: number): Promise<string[]>;
    /**
     * Get current state
     */
    getState(): EmulatorState;
    /**
     * Get device info
     */
    getDevice(): AndroidDevice;
    /**
     * Check if running
     */
    isRunning(): boolean;
    /**
     * Add log entry
     */
    private addLog;
}
/**
 * Available device presets
 */
export declare const devicePresets: AndroidDevice[];
/**
 * Create an emulator instance
 */
export declare function createEmulator(device?: AndroidDevice): AndroidEmulator;
export default AndroidEmulator;
//# sourceMappingURL=index.d.ts.map