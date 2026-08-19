# WebBuilder Android

Build Android apps with Kotlin + Jetpack Compose using AI agents or the visual editor.

## Features

- **Full Project Generation** — Generates complete Android projects with Gradle, manifest, and all config files
- **Jetpack Compose Components** — 11 real Compose components (Button, TextField, Card, Image, TopBar, BottomNav, FAB, AlertDialog, etc.)
- **Desktop Emulator** — Built-in Android emulator for testing without a physical device
- **Gradle Integration** — Builds APKs via Gradle wrapper
- **Material3 Theming** — Dynamic color schemes, dark/light mode support
- **MCP Tools** — AI agents can create, build, and deploy Android apps

## Quick Start

```typescript
import { AndroidProjectGenerator, generateAndroidComponents } from '@webbuilder/android';

// Generate a complete Android project
const config = {
  name: 'MyApp',
  packageName: 'com.example.myapp',
  minSdk: 24,
  targetSdk: 34,
  compileSdk: 34,
  buildToolsVersion: '34.0.0',
  kotlinVersion: '2.0.0',
  composeVersion: '2024.06.00',
  activities: [{
    name: 'MainActivity',
    packageName: 'com.example.myapp',
    title: 'My App',
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

// Write files to disk
for (const file of project.files) {
  console.log(file.path);
}

// Add Compose components
const componentFiles = generateAndroidComponents(
  ['android-button', 'android-text', 'android-card'],
  'com.example.myapp'
);
```

## Components

| Component | Category | Description |
|-----------|----------|-------------|
| Scaffold | Layout | App structure with top bar |
| Button | Input | Clickable button with variants |
| TextField | Input | Text input with label/validation |
| Checkbox | Input | Checkbox with label |
| Switch | Input | Toggle switch |
| Slider | Input | Range slider |
| Text | Display | Styled text |
| Card | Display | Material3 card |
| Image | Display | Image with Coil |
| Icon | Display | Material icon |
| Divider | Display | Horizontal divider |
| Chip | Display | Filter chip |
| Badge | Display | Notification badge |
| Avatar | Display | User avatar with initials |
| TopAppBar | Navigation | Top app bar |
| BottomNavigation | Navigation | Bottom nav bar |
| NavigationDrawer | Navigation | Side drawer |
| Tabs | Navigation | Tab row |
| FAB | Navigation | Floating action button |
| AlertDialog | Feedback | Alert dialog |
| Snackbar | Feedback | Snackbar notification |
| ProgressIndicator | Feedback | Loading indicator |
| EmptyState | Feedback | Empty state placeholder |

## Desktop Emulator

```typescript
import { createEmulator, devicePresets } from '@webbuilder/android';

// Create emulator with a device preset
const emulator = createEmulator(devicePresets[0]); // Pixel 7

// Start the emulator
await emulator.start();

// Install and launch an APK
await emulator.installApk('com.example.myapp', '/path/to/app-debug.apk');
await emulator.launchApp('com.example.myapp');

// Take a screenshot
const screenshot = await emulator.screenshot();

// Stop the emulator
await emulator.stop();
```

## Device Presets

- Pixel 5, 6, 7, 7 Pro, 8, 8 Pro
- Samsung Galaxy S24, S24 Ultra
- OnePlus 12
- Xiaomi 14
- Nexus 5X, 6P
- Pixel Tablet, Samsung Galaxy Tab S9

## MCP Tools for Android

| Tool | Description |
|------|-------------|
| `webbuilder/android/create` | Create a new Android project |
| `webbuilder/android/build` | Build debug APK |
| `webbuilder/android/install` | Install APK on emulator |
| `webbuilder/android/components` | List available components |
| `webbuilder/android/devices` | List device presets |

## Building from Command Line

```bash
cd generated-android-project
./gradlew assembleDebug
./gradlew installDebug
```
