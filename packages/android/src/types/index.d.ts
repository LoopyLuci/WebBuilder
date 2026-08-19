export type AndroidPackage = string;
export type AndroidActivity = string;
export type AndroidPermission = 'android.permission.CAMERA' | 'android.permission.ACCESS_FINE_LOCATION' | 'android.permission.ACCESS_COARSE_LOCATION' | 'android.permission.INTERNET' | 'android.permission.RECORD_AUDIO' | 'android.permission.WRITE_EXTERNAL_STORAGE' | 'android.permission.READ_EXTERNAL_STORAGE' | 'android.permission.VIBRATE' | 'android.permission.WAKE_LOCK' | 'android.permission.FOREGROUND_SERVICE';
export interface AndroidProjectConfig {
    name: string;
    packageName: AndroidPackage;
    minSdk: number;
    targetSdk: number;
    compileSdk: number;
    buildToolsVersion: string;
    kotlinVersion: string;
    composeVersion: string;
    activities: AndroidActivityConfig[];
    permissions: AndroidPermission[];
    dependencies: string[];
    features: AndroidFeature[];
}
export interface AndroidActivityConfig {
    name: string;
    packageName: AndroidPackage;
    title: string;
    layout: string;
    isMainLauncher: boolean;
    isComposeActivity: boolean;
    composables: string[];
}
export interface AndroidFeature {
    name: string;
    type: 'screen' | 'component' | 'data' | 'service' | 'permission' | 'config';
    config: any;
}
export interface GeneratedAndroidProject {
    files: AndroidFileChange[];
    gradle: GradleConfig;
    manifest: AndroidManifest;
    instructions: string[];
}
export interface AndroidFileChange {
    path: string;
    content: string;
    action: 'create' | 'update' | 'delete';
}
export interface GradleConfig {
    project: string;
    app: string;
    settings: string;
    properties: string;
    libsVersions: string;
}
export interface AndroidManifest {
    package: string;
    permissions: AndroidPermission[];
    activities: AndroidActivityConfig[];
    application: {
        label: string;
        theme: string;
        allowBackup: boolean;
        supportsRtl: boolean;
    };
}
export interface AndroidComposable {
    name: string;
    description: string;
    parameters: any[];
    content: string;
}
export interface EmulatorConfig {
    device: AndroidDevice;
    isRunning: boolean;
    port: number;
}
export interface AndroidDevice {
    name: string;
    screenWidth: number;
    screenHeight: number;
    density: number;
    apiLevel: number;
}
//# sourceMappingURL=index.d.ts.map