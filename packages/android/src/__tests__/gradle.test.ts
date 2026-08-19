import { describe, it, expect } from 'vitest';
import {
  generateGradleWrapperScript,
  generateGradleWrapperScriptWindows,
  getCommonGradleTasks,
  gradleWrapperProperties,
  runGradleTask,
  buildDebugApk,
  buildReleaseApk,
  installAndRun,
} from '../../dist/index.js';

describe('gradleWrapperProperties', () => {
  it('should have a distribution URL', () => {
    expect(gradleWrapperProperties.distributionUrl).toContain('gradle-8.7-bin.zip');
  });

  it('should have a SHA256 checksum', () => {
    expect(gradleWrapperProperties.distributionSha256Sum).toBeDefined();
    expect(typeof gradleWrapperProperties.distributionSha256Sum).toBe('string');
  });
});

describe('generateGradleWrapperScript', () => {
  it('should return a shell script string', () => {
    const script = generateGradleWrapperScript();
    expect(script).toContain('#!/bin/sh');
    expect(script).toContain('org.gradle.wrapper.GradleWrapperMain');
  });

  it('should reference java executable', () => {
    const script = generateGradleWrapperScript();
    expect(script).toContain('JAVACMD');
    expect(script).toContain('JAVA_HOME');
  });
});

describe('generateGradleWrapperScriptWindows', () => {
  it('should return a batch script string', () => {
    const script = generateGradleWrapperScriptWindows();
    expect(script).toContain('@echo off');
    expect(script).toContain('org.gradle.wrapper.GradleWrapperMain');
  });

  it('should reference java executable for Windows', () => {
    const script = generateGradleWrapperScriptWindows();
    expect(script).toContain('JAVA_EXE');
    expect(script).toContain('JAVA_HOME');
  });
});

describe('getCommonGradleTasks', () => {
  it('should return a list of tasks', () => {
    const tasks = getCommonGradleTasks();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(5);
  });

  it('should include assembleDebug', () => {
    const tasks = getCommonGradleTasks();
    const assembleDebug = tasks.find((t) => t.name === 'assembleDebug');
    expect(assembleDebug).toBeDefined();
    expect(assembleDebug!.group).toBe('build');
  });

  it('should include test task', () => {
    const tasks = getCommonGradleTasks();
    const testTask = tasks.find((t) => t.name === 'test');
    expect(testTask).toBeDefined();
    expect(testTask!.group).toBe('verification');
  });

  it('should have valid task structure', () => {
    const tasks = getCommonGradleTasks();
    for (const task of tasks) {
      expect(task).toHaveProperty('name');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('group');
    }
  });
});

describe('runGradleTask', () => {
  it('should return a successful result', async () => {
    const result = await runGradleTask('/project/path', 'assembleDebug');
    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should return output logs', async () => {
    const result = await runGradleTask('/project/path', 'assembleDebug');
    expect(result.output).toContain('assembleDebug');
    expect(result.output).toContain('Build successful');
  });

  it('should include APK path for assemble tasks', async () => {
    const result = await runGradleTask('/project/path', 'assembleDebug');
    expect(result.apkPath).toBeDefined();
    expect(result.apkPath).toContain('app-debug.apk');
  });

  it('should not include APK path for non-assemble tasks', async () => {
    const result = await runGradleTask('/project/path', 'test');
    expect(result.apkPath).toBeUndefined();
  });

  it('should return duration', async () => {
    const result = await runGradleTask('/project/path', 'assembleDebug');
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });
});

describe('buildDebugApk', () => {
  it('should build successfully', async () => {
    const result = await buildDebugApk('/project/path');
    expect(result.success).toBe(true);
  });

  it('should include APK path', async () => {
    const result = await buildDebugApk('/project/path');
    expect(result.apkPath).toContain('app-debug.apk');
  });
});

describe('buildReleaseApk', () => {
  it('should build successfully', async () => {
    const result = await buildReleaseApk('/project/path');
    expect(result.success).toBe(true);
  });

  it('should include release APK path', async () => {
    const result = await buildReleaseApk('/project/path');
    expect(result.apkPath).toBeDefined();
  });
});

describe('installAndRun', () => {
  it('should build and install successfully', async () => {
    const result = await installAndRun('/project/path');
    expect(result.success).toBe(true);
  });
});