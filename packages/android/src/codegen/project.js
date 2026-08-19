// ============================================================================
// Android Project Generator
// Generates complete Android projects with Kotlin + Jetpack Compose
// ============================================================================
export class AndroidProjectGenerator {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Generate the complete Android project
     */
    generate() {
        const files = [];
        // Gradle files
        files.push(this.generateSettingsGradle());
        files.push(this.generateProjectGradle());
        files.push(this.generateAppGradle());
        files.push(this.generateGradleProperties());
        files.push(this.generateLibsVersions());
        // Android manifest
        files.push(this.generateManifest());
        // Kotlin source files
        files.push(...this.generateKotlinFiles());
        // Resources
        files.push(...this.generateResources());
        return {
            files,
            gradle: this.getGradleConfig(),
            manifest: this.getManifest(),
            instructions: this.getInstructions(),
        };
    }
    /**
     * Generate settings.gradle.kts
     */
    generateSettingsGradle() {
        return {
            path: 'settings.gradle.kts',
            content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${this.config.name}"
include(":app")
`,
            action: 'create',
        };
    }
    /**
     * Generate project-level build.gradle.kts
     */
    generateProjectGradle() {
        return {
            path: 'build.gradle.kts',
            content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`,
            action: 'create',
        };
    }
    /**
     * Generate app-level build.gradle.kts
     */
    generateAppGradle() {
        const deps = this.config.dependencies || [];
        const depLines = deps.map(d => `    implementation(libs.${this.toLibAlias(d)})`).join('\n');
        return {
            path: 'app/build.gradle.kts',
            content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "${this.config.packageName}"
    compileSdk = ${this.config.compileSdk}

    defaultConfig {
        applicationId = "${this.config.packageName}"
        minSdk = ${this.config.minSdk}
        targetSdk = ${this.config.targetSdk}
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.navigation.compose)
${depLines}
    debugImplementation(libs.androidx.compose.ui.tooling)
}
`,
            action: 'create',
        };
    }
    /**
     * Generate gradle.properties
     */
    generateGradleProperties() {
        return {
            path: 'gradle.properties',
            content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`,
            action: 'create',
        };
    }
    /**
     * Generate libs.versions.toml
     */
    generateLibsVersions() {
        return {
            path: 'gradle/libs.versions.toml',
            content: `[versions]
agp = "8.5.0"
kotlin = "${this.config.kotlinVersion}"
coreKtx = "1.13.1"
lifecycleRuntimeKtx = "2.8.3"
activityCompose = "1.9.0"
composeBom = "${this.config.composeVersion}"
navigationCompose = "2.7.7"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`,
            action: 'create',
        };
    }
    /**
     * Generate AndroidManifest.xml
     */
    generateManifest() {
        const permissions = this.config.permissions
            .map(p => `    <uses-permission android:name="${p}" />`)
            .join('\n');
        const activities = this.config.activities
            .map(a => this.generateActivityManifest(a))
            .join('\n');
        return {
            path: 'app/src/main/AndroidManifest.xml',
            content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

${permissions}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.${this.config.name.replace(/\s/g, '')}">

${activities}

    </application>

</manifest>
`,
            action: 'create',
        };
    }
    /**
     * Generate activity manifest entry
     */
    generateActivityManifest(activity) {
        const launcher = activity.isMainLauncher
            ? `
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>`
            : '';
        return `        <activity
            android:name=".${activity.name}"
            android:exported="${activity.isMainLauncher}"
            android:theme="@style/Theme.${this.config.name.replace(/\s/g, '')}">
${launcher}
        </activity>`;
    }
    /**
     * Generate Kotlin source files
     */
    generateKotlinFiles() {
        const files = [];
        for (const activity of this.config.activities) {
            if (activity.isComposeActivity) {
                files.push(this.generateComposeActivity(activity));
            }
            else {
                files.push(this.generateTraditionalActivity(activity));
            }
        }
        return files;
    }
    /**
     * Generate a Compose activity
     */
    generateComposeActivity(activity) {
        const packagePath = this.config.packageName.replace(/\./g, '/');
        const composables = activity.composables?.length
            ? activity.composables.map(c => this.generateComposable(c)).join('\n\n')
            : this.generateDefaultComposable(activity);
        return {
            path: `app/src/main/java/${packagePath}/${activity.name}.kt`,
            content: `package ${this.config.packageName}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview

class ${activity.name} : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ${this.config.name.replace(/\s/g, '')}Theme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    ${activity.name.replace('Activity', '')}Screen(
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Composable
fun ${activity.name.replace('Activity', '')}Screen(modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
${composables}
    }
}

@Preview(showBackground = true)
@Composable
fun ${activity.name.replace('Activity', '')}ScreenPreview() {
    ${this.config.name.replace(/\s/g, '')}Theme {
        ${activity.name.replace('Activity', '')}Screen()
    }
}
`,
            action: 'create',
        };
    }
    /**
     * Generate a traditional (non-Compose) activity
     */
    generateTraditionalActivity(activity) {
        const packagePath = this.config.packageName.replace(/\./g, '/');
        return {
            path: `app/src/main/java/${packagePath}/${activity.name}.kt`,
            content: `package ${this.config.packageName}

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class ${activity.name} : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.${activity.layout})
    }
}
`,
            action: 'create',
        };
    }
    /**
     * Generate a default composable
     */
    generateDefaultComposable(activity) {
        return `    // TODO: Add your UI content here
    Text(
        text = "${activity.title}",
        style = MaterialTheme.typography.headlineMedium
    )`;
    }
    /**
     * Generate a composable function
     */
    generateComposable(name) {
        return `@Composable
fun ${name}() {
    // TODO: Implement ${name}
}`;
    }
    /**
     * Generate resource files
     */
    generateResources() {
        const files = [];
        const resPath = 'app/src/main/res';
        // strings.xml
        files.push({
            path: `${resPath}/values/strings.xml`,
            content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${this.config.name}</string>
</resources>
`,
            action: 'create',
        });
        // colors.xml
        files.push({
            path: `${resPath}/values/colors.xml`,
            content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
</resources>
`,
            action: 'create',
        });
        // themes.xml
        files.push({
            path: `${resPath}/values/themes.xml`,
            content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.${this.config.name.replace(/\s/g, '')}" parent="android:Theme.Material.Light.NoActionBar" />
</resources>
`,
            action: 'create',
        });
        return files;
    }
    /**
     * Get Gradle configuration
     */
    getGradleConfig() {
        return {
            project: 'build.gradle.kts',
            app: 'app/build.gradle.kts',
            settings: 'settings.gradle.kts',
            properties: 'gradle.properties',
            libsVersions: 'gradle/libs.versions.toml',
        };
    }
    /**
     * Get Android manifest
     */
    getManifest() {
        return {
            package: this.config.packageName,
            permissions: this.config.permissions,
            activities: this.config.activities,
            application: {
                label: this.config.name,
                theme: `@style/Theme.${this.config.name.replace(/\s/g, '')}`,
                allowBackup: true,
                supportsRtl: true,
            },
        };
    }
    /**
     * Get setup instructions
     */
    getInstructions() {
        return [
            '1. Open the project in Android Studio',
            '2. Sync Gradle files',
            '3. Run the app on an emulator or device',
            '',
            'Or from command line:',
            '  ./gradlew assembleDebug',
            '  ./gradlew installDebug',
        ];
    }
    /**
     * Convert dependency to libs.versions.toml alias
     */
    toLibAlias(dep) {
        return dep.replace(/[:.-]/g, '_').replace(/_+/g, '_');
    }
}
export function generateAndroidProject(config) {
    const generator = new AndroidProjectGenerator(config);
    return generator.generate();
}
export default AndroidProjectGenerator;
//# sourceMappingURL=project.js.map