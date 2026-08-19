// Comprehensive MCP Feature Test Suite
const path = require('path');

async function runTests() {
  console.log('=== WebBuilder MCP Comprehensive Test Suite ===\n');
  
  const core = require(path.join(__dirname, '..', 'packages', 'core', 'dist', 'index.js'));
  const android = require(path.join(__dirname, '..', 'packages', 'android', 'dist', 'index.js'));
  
  let passed = 0;
  let failed = 0;
  
  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.log(`  ✗ ${testName}`);
      if (detail) console.log(`    ${detail}`);
      failed++;
    }
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Test Group 1: Project Creation (MCP: webbuilder/project/create)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('--- Group 1: Project Creation ---');
  
  try {
    const result1 = core.parseIntent('Build a landing page for my SaaS product with hero, features, pricing sections');
    assert(result1.confidence > 0, 'parseIntent returns confidence', `confidence: ${result1.confidence}`);
    assert(!!result1.spec, 'parseIntent returns spec');
    assert(result1.spec?.structure?.pages?.length > 0, 'spec has pages', `pages: ${result1.spec?.structure?.pages?.length}`);
    assert(!!result1.spec?.design, 'spec has design system');
  } catch (e) {
    assert(false, 'Project creation', e.message);
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Test Group 2: Code Generation (MCP: webbuilder/codegen/generate)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Group 2: Code Generation ---');
  
  try {
    const parsed = core.parseIntent('Build a landing page for my SaaS product');
    const generated = core.generateCode(parsed.spec);
    
    assert(generated.files?.length > 0, 'generateCode produces files', `files: ${generated.files?.length}`);
    assert(!!generated.files?.find(f => f.path === 'package.json'), 'produces package.json');
    assert(!!generated.files?.find(f => f.path.includes('layout.tsx')), 'produces layout.tsx');
    assert(!!generated.files?.find(f => f.path.includes('globals.css')), 'produces globals.css');
    assert(generated.instructions?.length > 0, 'provides instructions', `steps: ${generated.instructions?.length}`);
    
    // Verify package.json content
    const pkgContent = generated.files.find(f => f.path === 'package.json')?.content;
    const pkg = JSON.parse(pkgContent);
    assert(!!pkg.dependencies?.next, 'package.json has next dependency');
    assert(!!pkg.dependencies?.react, 'package.json has react dependency');
    assert(!!pkg.scripts?.dev, 'package.json has dev script');
    assert(!!pkg.scripts?.build, 'package.json has build script');
  } catch (e) {
    assert(false, 'Code generation', e.message);
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Test Group 3: Project Management (MCP: webbuilder/project/list, get, delete)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Group 3: Project Management ---');
  
  try {
    const pm = core.createProjectManager();
    
    // Create projects
    const spec1 = core.parseIntent('Build a landing page').spec;
    const spec2 = core.parseIntent('Build a blog website').spec;
    
    pm.create(spec1);
    pm.create(spec2);
    
    assert(true, 'pm.create works');
    
    const list = pm.list();
    assert(list.length >= 2, 'pm.list returns projects', `count: ${list.length}`);
    
    const first = list[0];
    const loaded = pm.load(first.id);
    assert(!!loaded, 'pm.load returns project');
    
    const deleted = pm.delete(first.id);
    assert(deleted, 'pm.delete removes project');
    
    const listAfter = pm.list();
    assert(listAfter.length >= 1, 'pm.list after delete', `count: ${listAfter.length}`);
  } catch (e) {
    assert(false, 'Project management', e.message);
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Test Group 4: Design Engine (MCP: webbuilder/design/generate)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Group 4: Design Engine ---');
  
  try {
    const engine = core.createDesignEngine();
    const result = await engine.analyze('modern SaaS landing page with dark mode');
    
    assert(!!result, 'design engine returns result');
    assert(!!result.tokens, 'design has tokens');
    assert(!!result.color, 'design has color system');
    assert(!!result.typography, 'design has typography');
    assert(!!result.spacing, 'design has spacing');
  } catch (e) {
    assert(false, 'Design engine', e.message);
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Test Group 5: Deploy Engine (MCP: webbuilder/deploy/preview, production)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Group 5: Deploy Engine ---');
  
  try {
    const engine = core.createDeployEngine();
    
    assert(!!engine, 'createDeployEngine works');
    
    const config = engine.getConfig();
    assert(!!config, 'deploy engine has config');
    assert(!!config.target, 'config has target');
    assert(!!config.environment, 'config has environment');
    
    // Test validation
    const validation = engine.validate();
    assert(typeof validation.valid === 'boolean', 'validate returns result');
    
    // Test config files generation
    const configFiles = engine.generateConfigFiles();
    assert(!!configFiles, 'generateConfigFiles works');
  } catch (e) {
    assert(false, 'Deploy engine', e.message);
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Test Group 6: Android Tools (MCP: webbuilder/android/create, components, devices)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Group 6: Android Tools ---');
  
  try {
    assert(!!android.AndroidProjectGenerator, 'AndroidProjectGenerator exists');
    assert(!!android.generateAndroidComponents, 'generateAndroidComponents exists');
    assert(!!android.androidComponents, 'androidComponents exists');
    assert(android.androidComponents.length > 0, 'has components', `count: ${android.androidComponents.length}`);
    assert(!!android.devicePresets, 'devicePresets exists');
    assert(android.devicePresets.length > 0, 'has device presets', `count: ${android.devicePresets.length}`);
    
    // Test component generation
    const components = android.generateAndroidComponents(['android-scaffold', 'android-button'], 'com.example.app');
    assert(components.length > 0, 'generateAndroidComponents works', `count: ${components.length}`);
  } catch (e) {
    assert(false, 'Android tools', e.message);
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Test Group 7: Content Generation
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Group 7: Content Generation ---');
  
  try {
    const { ContentGenerator } = core;
    const generator = new ContentGenerator(core.parseIntent('Build a SaaS landing page').spec);
    const content = generator.generate();
    
    assert(!!content, 'ContentGenerator works');
    assert(!!content.pages, 'has pages');
    assert(!!content.navigation, 'has navigation');
    assert(!!content.footer, 'has footer');
    assert(!!content.metadata, 'has metadata');
  } catch (e) {
    assert(false, 'Content generation', e.message);
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Test Group 8: Logic Engine
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Group 8: Logic Engine ---');
  
  try {
    const engine = core.createLogicEngine();
    assert(!!engine, 'createLogicEngine works');
  } catch (e) {
    assert(false, 'Logic engine', e.message);
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Test Group 9: Observability Engine
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Group 9: Observability Engine ---');
  
  try {
    const engine = core.createObservabilityEngine();
    assert(!!engine, 'createObservabilityEngine works');
  } catch (e) {
    assert(false, 'Observability engine', e.message);
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Test Group 10: Component Engine
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Group 10: Component Engine ---');
  
  try {
    const engine = core.createComponentEngine();
    assert(!!engine, 'createComponentEngine works');
  } catch (e) {
    assert(false, 'Component engine', e.message);
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Test Group 11: Context Manager
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Group 11: Context Manager ---');
  
  try {
    const ctx = core.createContext();
    assert(!!ctx, 'createContext works');
  } catch (e) {
    assert(false, 'Context manager', e.message);
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Summary
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  return { passed, failed };
}

runTests().catch(console.error);
