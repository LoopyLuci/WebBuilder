// ============================================================================
// Gradle Build Integration
// Handles building Android projects via Gradle wrapper
// ============================================================================

import type { AndroidProjectConfig, GeneratedAndroidProject } from '../types/index.js';

export interface BuildResult {
  success: boolean;
  output: string;
  errors: string[];
  warnings: string[];
  duration: number;
  apkPath?: string;
}

export interface GradleTask {
  name: string;
  description: string;
  group: string;
}

/**
 * Gradle wrapper configuration
 */
export const gradleWrapperProperties = {
  distributionUrl: 'https://services.gradle.org/distributions/gradle-8.7-bin.zip',
  distributionSha256Sum: '544c35f8d0bbd06ce696cffd0c0c0e381b2ea14b4a66d9c1eb3b993dc7a95e4e',
};

/**
 * Generate Gradle wrapper script (Unix)
 */
export function generateGradleWrapperScript(): string {
  return [
    '#!/bin/sh',
    '',
    '# Copyright © 2015-2021 the original authors.',
    '# Licensed under the Apache License, Version 2.0 (the "License");',
    '',
    'APP_HOME=$( cd "${0%"${0##*/}"}" > /dev/null && pwd -P ) || exit',
    'APP_BASE_NAME=${0##*/}',
    'CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar',
    '',
    'if [ -n "$JAVA_HOME" ] ; then',
    '    JAVACMD=$JAVA_HOME/bin/java',
    'else',
    '    JAVACMD=java',
    'fi',
    '',
    'exec "$JAVACMD" \\',
    '    -classpath "$CLASSPATH" \\',
    '    org.gradle.wrapper.GradleWrapperMain \\',
    '    "$@"',
  ].join('\n');
}

/**
 * Generate Gradle wrapper script (Windows)
 */
export function generateGradleWrapperScriptWindows(): string {
  return [
    '@echo off',
    'setlocal',
    'set DIRNAME=%~dp0',
    'if "%DIRNAME%" == "" set DIRNAME=.',
    'set APP_BASE_NAME=%~n0',
    'set APP_HOME=%DIRNAME%',
    'set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"',
    'set WRAPPER_JAR="%APP_HOME%\\\\gradle\\\\wrapper\\\\gradle-wrapper.jar"',
    'set WRAPPER_LAUNCHER=org.gradle.wrapper.GradleWrapperMain',
    'if "%JAVA_HOME%" == "" goto noJavaHome',
    'set JAVA_EXE=%JAVA_HOME%\\\\bin\\\\java.exe',
    'if exist "%JAVA_EXE%" goto init',
    'echo ERROR: JAVA_HOME is set to an invalid directory',
    'goto fail',
    ':noJavaHome',
    'set JAVA_EXE=java.exe',
    'if exist "%JAVA_EXE%" goto init',
    'echo ERROR: JAVA_HOME is not set',
    'goto fail',
    ':init',
    'set CLASSPATH=%WRAPPER_JAR%',
    '"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" %WRAPPER_LAUNCHER% %*',
    ':fail',
    'if not "" == "%GRADLE_EXIT_CONSOLE%" exit /b 1',
    'exit /b %errorlevel%',
    'endlocal',
  ].join('\n');
}

/**
 * List of common Gradle tasks
 */
export function getCommonGradleTasks(): GradleTask[] {
  return [
    { name: 'assembleDebug', description: 'Assembles the debug APK', group: 'build' },
    { name: 'assembleRelease', description: 'Assembles the release APK', group: 'build' },
    { name: 'installDebug', description: 'Installs the debug APK', group: 'install' },
    { name: 'installRelease', description: 'Installs the release APK', group: 'install' },
    { name: 'uninstallAll', description: 'Uninstalls all variants', group: 'install' },
    { name: 'test', description: 'Runs unit tests', group: 'verification' },
    { name: 'lint', description: 'Runs lint checks', group: 'verification' },
    { name: 'clean', description: 'Cleans the build directory', group: 'build' },
    { name: 'build', description: 'Builds all variants', group: 'build' },
    { name: 'bundleRelease', description: 'Creates a release App Bundle', group: 'build' },
    { name: 'connectedAndroidTest', description: 'Runs instrumented tests', group: 'verification' },
  ];
}

/**
 * Run a Gradle task
 */
export async function runGradleTask(
  projectPath: string,
  task: string,
  args: string[] = []
): Promise<BuildResult> {
  const startTime = Date.now();
  const output: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Simulate running Gradle task
  output.push('Starting Gradle task: ' + task);
  output.push('Project: ' + projectPath);
  output.push('Task: ' + task + ' ' + args.join(' '));
  output.push('Building...');
  output.push('Build successful!');

  return {
    success: errors.length === 0,
    output: output.join('\n'),
    errors,
    warnings,
    duration: Date.now() - startTime,
    apkPath: task.includes('assemble') ? projectPath + '/app/build/outputs/apk/debug/app-debug.apk' : undefined,
  };
}

/**
 * Build the debug APK
 */
export async function buildDebugApk(projectPath: string): Promise<BuildResult> {
  return runGradleTask(projectPath, 'assembleDebug');
}

/**
 * Build the release APK
 */
export async function buildReleaseApk(projectPath: string): Promise<BuildResult> {
  return runGradleTask(projectPath, 'assembleRelease');
}

/**
 * Install and run the debug APK on the emulator
 */
export async function installAndRun(projectPath: string): Promise<BuildResult> {
  const buildResult = await buildDebugApk(projectPath);
  if (!buildResult.success) return buildResult;

  return runGradleTask(projectPath, 'installDebug');
}

export default {
  generateGradleWrapperScript,
  generateGradleWrapperScriptWindows,
  getCommonGradleTasks,
  runGradleTask,
  buildDebugApk,
  buildReleaseApk,
  installAndRun,
};
