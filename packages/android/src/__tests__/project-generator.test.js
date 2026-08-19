import { describe, it, expect } from 'vitest';
import { AndroidProjectGenerator, generateAndroidProject, } from '../../dist/index.js';
const sampleConfig = {
    name: 'Test App',
    packageName: 'com.example.testapp',
    minSdk: 24,
    targetSdk: 34,
    compileSdk: 34,
    buildToolsVersion: '34.0.0',
    kotlinVersion: '1.9.22',
    composeVersion: '2024.06.00',
    activities: [
        {
            name: 'MainActivity',
            packageName: 'com.example.testapp',
            title: 'Main',
            layout: 'activity_main',
            isMainLauncher: true,
            isComposeActivity: true,
            composables: ['GreetingText'],
        },
        {
            name: 'SettingsActivity',
            packageName: 'com.example.testapp',
            title: 'Settings',
            layout: 'activity_settings',
            isMainLauncher: false,
            isComposeActivity: false,
            composables: [],
        },
    ],
    permissions: ['android.permission.INTERNET', 'android.permission.CAMERA'],
    dependencies: ['com.google.code.gson:gson:2.10.1'],
    features: [],
};
describe('AndroidProjectGenerator', () => {
    it('should instantiate with a config', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        expect(generator).toBeDefined();
    });
    it('should generate a complete project', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        expect(result).toHaveProperty('files');
        expect(result).toHaveProperty('gradle');
        expect(result).toHaveProperty('manifest');
        expect(result).toHaveProperty('instructions');
        expect(result.files.length).toBeGreaterThan(0);
    });
    it('should generate settings.gradle.kts', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        const settings = result.files.find((f) => f.path === 'settings.gradle.kts');
        expect(settings).toBeDefined();
        expect(settings.content).toContain('rootProject.name = "Test App"');
        expect(settings.content).toContain('include(":app")');
        expect(settings.action).toBe('create');
    });
    it('should generate project-level build.gradle.kts', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        const projectGradle = result.files.find((f) => f.path === 'build.gradle.kts');
        expect(projectGradle).toBeDefined();
        expect(projectGradle.content).toContain('alias(libs.plugins.android.application)');
        expect(projectGradle.content).toContain('alias(libs.plugins.kotlin.android)');
        expect(projectGradle.content).toContain('alias(libs.plugins.kotlin.compose)');
    });
    it('should generate app-level build.gradle.kts with correct config', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        const appGradle = result.files.find((f) => f.path === 'app/build.gradle.kts');
        expect(appGradle).toBeDefined();
        expect(appGradle.content).toContain('namespace = "com.example.testapp"');
        expect(appGradle.content).toContain('compileSdk = 34');
        expect(appGradle.content).toContain('minSdk = 24');
        expect(appGradle.content).toContain('targetSdk = 34');
        expect(appGradle.content).toContain('compose = true');
    });
    it('should generate gradle.properties', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        const props = result.files.find((f) => f.path === 'gradle.properties');
        expect(props).toBeDefined();
        expect(props.content).toContain('org.gradle.jvmargs=-Xmx2048m');
        expect(props.content).toContain('android.useAndroidX=true');
    });
    it('should generate libs.versions.toml with correct versions', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        const libs = result.files.find((f) => f.path === 'gradle/libs.versions.toml');
        expect(libs).toBeDefined();
        expect(libs.content).toContain('kotlin = "1.9.22"');
        expect(libs.content).toContain('composeBom = "2024.06.00"');
        expect(libs.content).toContain('androidx-core-ktx');
        expect(libs.content).toContain('android-application');
    });
    it('should generate AndroidManifest.xml with permissions', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        const manifest = result.files.find((f) => f.path === 'app/src/main/AndroidManifest.xml');
        expect(manifest).toBeDefined();
        expect(manifest.content).toContain('<uses-permission android:name="android.permission.INTERNET" />');
        expect(manifest.content).toContain('<uses-permission android:name="android.permission.CAMERA" />');
        expect(manifest.content).toContain('.MainActivity');
        expect(manifest.content).toContain('.SettingsActivity');
        expect(manifest.content).toContain('android:exported="true"');
    });
    it('should generate Kotlin source files for activities', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        const mainActivity = result.files.find((f) => f.path.includes('MainActivity.kt'));
        expect(mainActivity).toBeDefined();
        expect(mainActivity.content).toContain('package com.example.testapp');
        expect(mainActivity.content).toContain('class MainActivity : ComponentActivity()');
        expect(mainActivity.content).toContain('enableEdgeToEdge()');
        expect(mainActivity.content).toContain('setContent');
        expect(mainActivity.content).toContain('GreetingText');
        const settingsActivity = result.files.find((f) => f.path.includes('SettingsActivity.kt'));
        expect(settingsActivity).toBeDefined();
        expect(settingsActivity.content).toContain('class SettingsActivity : AppCompatActivity()');
        expect(settingsActivity.content).toContain('setContentView(R.layout.activity_settings)');
    });
    it('should generate resource files', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        const strings = result.files.find((f) => f.path.includes('strings.xml'));
        expect(strings).toBeDefined();
        expect(strings.content).toContain('<string name="app_name">Test App</string>');
        const colors = result.files.find((f) => f.path.includes('colors.xml'));
        expect(colors).toBeDefined();
        expect(colors.content).toContain('<color name="black">');
        const themes = result.files.find((f) => f.path.includes('themes.xml'));
        expect(themes).toBeDefined();
        expect(themes.content).toContain('Theme.TestApp');
    });
    it('should return gradle config paths', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        expect(result.gradle.project).toBe('build.gradle.kts');
        expect(result.gradle.app).toBe('app/build.gradle.kts');
        expect(result.gradle.settings).toBe('settings.gradle.kts');
        expect(result.gradle.properties).toBe('gradle.properties');
        expect(result.gradle.libsVersions).toBe('gradle/libs.versions.toml');
    });
    it('should return manifest object', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        expect(result.manifest.package).toBe('com.example.testapp');
        expect(result.manifest.permissions).toContain('android.permission.INTERNET');
        expect(result.manifest.permissions).toContain('android.permission.CAMERA');
        expect(result.manifest.application.label).toBe('Test App');
        expect(result.manifest.application.allowBackup).toBe(true);
        expect(result.manifest.application.supportsRtl).toBe(true);
    });
    it('should return setup instructions', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        expect(result.instructions).toBeInstanceOf(Array);
        expect(result.instructions[0]).toContain('Android Studio');
        expect(result.instructions.some((i) => i.includes('./gradlew assembleDebug'))).toBe(true);
    });
    it('should include custom dependencies in build.gradle.kts', () => {
        const generator = new AndroidProjectGenerator(sampleConfig);
        const result = generator.generate();
        const appGradle = result.files.find((f) => f.path === 'app/build.gradle.kts');
        expect(appGradle.content).toContain('implementation(libs.com_google_code_gson_gson_2_10_1)');
    });
});
describe('generateAndroidProject', () => {
    it('should generate a project using the convenience function', () => {
        const result = generateAndroidProject(sampleConfig);
        expect(result.files.length).toBeGreaterThan(0);
        expect(result.gradle).toBeDefined();
        expect(result.manifest).toBeDefined();
        expect(result.instructions.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=project-generator.test.js.map