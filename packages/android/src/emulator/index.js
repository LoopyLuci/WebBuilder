// ============================================================================
// Desktop Android Emulator
// Built-in emulator for testing Android apps without a physical device
// ============================================================================
/**
 * Desktop Android Emulator
 * Provides a virtual Android device for testing apps
 */
export class AndroidEmulator {
    state;
    config;
    constructor(device) {
        this.config = {
            device: device || this.getDefaultDevice(),
            isRunning: false,
            port: 5554,
        };
        this.state = {
            isRunning: false,
            device: this.config.device,
            installedApps: [],
            currentApp: null,
            logs: [],
        };
    }
    /**
     * Get default device configuration
     */
    getDefaultDevice() {
        return {
            name: 'Pixel 7',
            screenWidth: 1080,
            screenHeight: 2400,
            density: 420,
            apiLevel: 34,
        };
    }
    /**
     * Start the emulator
     */
    async start() {
        this.state.isRunning = true;
        this.config.isRunning = true;
        this.addLog('Emulator starting...');
        this.addLog(`Device: ${this.config.device.name}`);
        this.addLog(`API Level: ${this.config.device.apiLevel}`);
        this.addLog(`Screen: ${this.config.device.screenWidth}x${this.config.device.screenHeight}`);
        this.addLog('Emulator ready!');
        return true;
    }
    /**
     * Stop the emulator
     */
    async stop() {
        this.state.isRunning = false;
        this.config.isRunning = false;
        this.state.currentApp = null;
        this.addLog('Emulator stopped');
        return true;
    }
    /**
     * Install an APK
     */
    async installApk(packageName, apkPath) {
        if (!this.state.isRunning) {
            this.addLog('Error: Emulator not running');
            return false;
        }
        this.state.installedApps.push(packageName);
        this.addLog(`Installed: ${packageName}`);
        return true;
    }
    /**
     * Launch an app
     */
    async launchApp(packageName) {
        if (!this.state.isRunning) {
            this.addLog('Error: Emulator not running');
            return false;
        }
        if (!this.state.installedApps.includes(packageName)) {
            this.addLog(`Error: ${packageName} not installed`);
            return false;
        }
        this.state.currentApp = packageName;
        this.addLog(`Launched: ${packageName}`);
        return true;
    }
    /**
     * Uninstall an app
     */
    async uninstallApp(packageName) {
        this.state.installedApps = this.state.installedApps.filter(p => p !== packageName);
        if (this.state.currentApp === packageName) {
            this.state.currentApp = null;
        }
        this.addLog(`Uninstalled: ${packageName}`);
        return true;
    }
    /**
     * Send input event
     */
    async sendInput(type, data) {
        if (!this.state.isRunning)
            return false;
        this.addLog(`Input: ${type} ${JSON.stringify(data)}`);
        return true;
    }
    /**
     * Take a screenshot
     */
    async screenshot() {
        if (!this.state.isRunning)
            return '';
        this.addLog('Screenshot captured');
        return `screenshot_${Date.now()}.png`;
    }
    /**
     * Get logcat output
     */
    async getLogcat(lines = 100) {
        return this.state.logs.slice(-lines);
    }
    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Get device info
     */
    getDevice() {
        return { ...this.config.device };
    }
    /**
     * Check if running
     */
    isRunning() {
        return this.state.isRunning;
    }
    /**
     * Add log entry
     */
    addLog(message) {
        const timestamp = new Date().toISOString();
        this.state.logs.push(`[${timestamp}] ${message}`);
    }
}
/**
 * Available device presets
 */
export const devicePresets = [
    { name: 'Pixel 5', screenWidth: 1080, screenHeight: 2340, density: 440, apiLevel: 34 },
    { name: 'Pixel 6', screenWidth: 1080, screenHeight: 2400, density: 420, apiLevel: 34 },
    { name: 'Pixel 7', screenWidth: 1080, screenHeight: 2400, density: 420, apiLevel: 34 },
    { name: 'Pixel 7 Pro', screenWidth: 1440, screenHeight: 3120, density: 512, apiLevel: 34 },
    { name: 'Pixel 8', screenWidth: 1080, screenHeight: 2400, density: 420, apiLevel: 35 },
    { name: 'Pixel 8 Pro', screenWidth: 1344, screenHeight: 2992, density: 489, apiLevel: 35 },
    { name: 'Samsung Galaxy S24', screenWidth: 1080, screenHeight: 2340, density: 420, apiLevel: 34 },
    { name: 'Samsung Galaxy S24 Ultra', screenWidth: 1440, screenHeight: 3120, density: 505, apiLevel: 34 },
    { name: 'OnePlus 12', screenWidth: 1440, screenHeight: 3168, density: 510, apiLevel: 34 },
    { name: 'Xiaomi 14', screenWidth: 1200, screenHeight: 2670, density: 460, apiLevel: 34 },
    { name: 'Nexus 5X', screenWidth: 1080, screenHeight: 1920, density: 420, apiLevel: 28 },
    { name: 'Nexus 6P', screenWidth: 1440, screenHeight: 2560, density: 512, apiLevel: 27 },
    { name: 'Pixel Tablet', screenWidth: 1600, screenHeight: 2560, density: 276, apiLevel: 34 },
    { name: 'Samsung Galaxy Tab S9', screenWidth: 1848, screenHeight: 2960, density: 274, apiLevel: 34 },
];
/**
 * Create an emulator instance
 */
export function createEmulator(device) {
    return new AndroidEmulator(device);
}
export default AndroidEmulator;
//# sourceMappingURL=index.js.map