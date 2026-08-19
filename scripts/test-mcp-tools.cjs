// Test MCP Server tools directly
const path = require('path');

async function testMCPTools() {
  console.log('=== WebBuilder MCP Tools Test ===\n');
  
  // Import core functions used by MCP server
  const core = require(path.join(__dirname, '..', 'packages', 'core', 'dist', 'index.js'));
  
  // Test 1: parseIntent
  console.log('Test 1: parseIntent');
  try {
    const result = core.parseIntent('Build a landing page for my SaaS product');
    console.log('  ✓ parseIntent works');
    console.log('  Confidence:', result.confidence);
    console.log('  Spec name:', result.spec?.name);
  } catch (e) {
    console.log('  ✗ parseIntent failed:', e.message);
  }
  
  // Test 2: generateCode with full spec
  console.log('\nTest 2: generateCode');
  try {
    const parsed = core.parseIntent('Build a landing page for my SaaS product');
    const spec = parsed.spec;
    console.log('  Spec keys:', Object.keys(spec).join(', '));
    console.log('  Has design:', !!spec.design);
    console.log('  Has structure:', !!spec.structure);
    if (spec.design) {
      console.log('  Design keys:', Object.keys(spec.design).join(', '));
    }
    const result = core.generateCode(spec);
    console.log('  ✓ generateCode works');
    console.log('  Files generated:', result.files?.length);
    console.log('  File paths:', result.files?.map(f => f.path).join(', '));
  } catch (e) {
    console.log('  ✗ generateCode failed:', e.message);
    console.log('  Stack:', e.stack?.split('\n').slice(0, 5).join('\n'));
  }
  
  // Test 3: createProjectManager
  console.log('\nTest 3: createProjectManager');
  try {
    const pm = core.createProjectManager();
    console.log('  ✓ createProjectManager works');
    console.log('  Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(pm)).filter(m => m !== 'constructor').join(', '));
    
    // Test creating a project
    const spec = core.parseIntent('Build a landing page').spec;
    pm.create(spec);
    console.log('  ✓ pm.create works');
    
    const list = pm.list();
    console.log('  ✓ pm.list works, count:', list.length);
  } catch (e) {
    console.log('  ✗ createProjectManager failed:', e.message);
  }
  
  // Test 4: createDesignEngine
  console.log('\nTest 4: createDesignEngine');
  try {
    const engine = core.createDesignEngine();
    console.log('  ✓ createDesignEngine works');
    const result = await engine.analyze('modern SaaS landing page');
    console.log('  ✓ engine.analyze works');
    console.log('  Result keys:', Object.keys(result).join(', '));
  } catch (e) {
    console.log('  ✗ createDesignEngine failed:', e.message);
  }
  
  // Test 5: createDeployEngine
  console.log('\nTest 5: createDeployEngine');
  try {
    const engine = core.createDeployEngine();
    console.log('  ✓ createDeployEngine works');
  } catch (e) {
    console.log('  ✗ createDeployEngine failed:', e.message);
  }
  
  // Test 6: AndroidProjectGenerator
  console.log('\nTest 6: AndroidProjectGenerator');
  try {
    const { AndroidProjectGenerator } = require(path.join(__dirname, '..', 'packages', 'android', 'dist', 'index.js'));
    console.log('  ✓ Android package loaded');
    console.log('  Has AndroidProjectGenerator:', !!AndroidProjectGenerator);
  } catch (e) {
    console.log('  ✗ Android package failed:', e.message);
  }
  
  console.log('\n=== Test Complete ===');
}

testMCPTools().catch(console.error);
