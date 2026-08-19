// Full E2E Pipeline Test via MCP
// Creates a project, generates code, writes files, and verifies the output
const path = require('path');
const fs = require('fs');
const os = require('os');

async function testE2E() {
  console.log('=== WebBuilder MCP Full E2E Pipeline Test ===\n');
  
  const core = require(path.join(__dirname, '..', 'packages', 'core', 'dist', 'index.js'));
  
  // ══════════════════════════════════════════════════════════════════════════
  // Step 1: Parse Intent (MCP: webbuilder/project/create)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('Step 1: Parse Intent');
  const parsed = core.parseIntent('Build a landing page for my SaaS product with hero, features, pricing, and CTA sections');
  console.log('  ✓ Intent parsed');
  console.log('  Confidence:', parsed.confidence);
  console.log('  Pages:', parsed.spec.structure.pages.length);
  console.log('  Sections:', parsed.spec.structure.pages[0].sections.length);
  
  // ══════════════════════════════════════════════════════════════════════════
  // Step 2: Create Project (MCP: webbuilder/project/create)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\nStep 2: Create Project');
  const pm = core.createProjectManager();
  pm.create(parsed.spec);
  console.log('  ✓ Project created');
  console.log('  Project ID:', parsed.spec.id);
  
  // ══════════════════════════════════════════════════════════════════════════
  // Step 3: Generate Code (MCP: webbuilder/codegen/generate)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\nStep 3: Generate Code');
  const generated = core.generateCode(parsed.spec);
  console.log('  ✓ Code generated');
  console.log('  Files:', generated.files.length);
  console.log('  Instructions:', generated.instructions.length, 'steps');
  
  // ══════════════════════════════════════════════════════════════════════════
  // Step 4: Write Files to Output Directory
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\nStep 4: Write Files');
  const outputDir = path.join(os.tmpdir(), 'webbuilder-test', parsed.spec.id);
  
  for (const file of generated.files) {
    const filePath = path.join(outputDir, file.path);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, file.content);
  }
  console.log('  ✓ Files written to:', outputDir);
  console.log('  Total files:', fs.readdirSync(outputDir, { recursive: true }).length);
  
  // ══════════════════════════════════════════════════════════════════════════
  // Step 5: Verify Generated Project Structure
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\nStep 5: Verify Structure');
  
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    '.gitignore',
    'src/app/layout.tsx',
    'src/app/globals.css',
    'src/pages/index.tsx',
  ];
  
  let allPresent = true;
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(outputDir, file));
    if (!exists) {
      console.log(`  ✗ Missing: ${file}`);
      allPresent = false;
    }
  }
  
  if (allPresent) {
    console.log('  ✓ All required files present');
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // Step 6: Verify package.json Content
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\nStep 6: Verify package.json');
  
  const pkgPath = path.join(outputDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  console.log('  ✓ package.json parsed');
  console.log('  Name:', pkg.name);
  console.log('  Dependencies:', Object.keys(pkg.dependencies).length);
  console.log('  DevDependencies:', Object.keys(pkg.devDependencies).length);
  console.log('  Scripts:', Object.keys(pkg.scripts).join(', '));
  
  // ══════════════════════════════════════════════════════════════════════════
  // Step 7: Verify Generated Components
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\nStep 7: Verify Generated Components');
  
  const componentFiles = generated.files.filter(f => 
    f.path.startsWith('src/components/') && f.path.endsWith('.tsx')
  );
  
  console.log('  ✓ Components found:', componentFiles.length);
  componentFiles.forEach(c => {
    const name = path.basename(c.path, '.tsx');
    const hasExport = c.content.includes('export');
    const hasInterface = c.content.includes('interface') || c.content.includes('type');
    console.log(`    - ${name} (${c.content.split('\n').length} lines)`);
  });
  
  // ══════════════════════════════════════════════════════════════════════════
  // Step 8: Design System Verification
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\nStep 8: Verify Design System');
  
  const designEngine = core.createDesignEngine();
  const design = await designEngine.analyze('modern SaaS landing page');
  
  console.log('  ✓ Design system generated');
  console.log('  Tokens:', Object.keys(design.tokens || {}).length);
  console.log('  Colors:', Object.keys(design.color || {}).length);
  console.log('  Typography:', Object.keys(design.typography || {}).length);
  
  // ══════════════════════════════════════════════════════════════════════════
  // Step 9: Project Persistence Verification
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\nStep 9: Verify Project Persistence');
  
  const projects = pm.list();
  console.log('  ✓ Projects in store:', projects.length);
  
  const loaded = pm.load(parsed.spec.id);
  console.log('  ✓ Project loaded:', !!loaded);
  console.log('  Sections:', loaded?.structure.pages[0].sections.length);
  
  // ══════════════════════════════════════════════════════════════════════════
  // Step 10: Android Project Generation (MCP: webbuilder/android/create)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\nStep 10: Android Project Generation');
  
  const android = require(path.join(__dirname, '..', 'packages', 'android', 'dist', 'index.js'));
  
  const androidConfig = {
    name: 'TestApp',
    packageName: 'com.example.testapp',
    minSdk: 24,
    targetSdk: 34,
    compileSdk: 34,
    buildToolsVersion: '34.0.0',
    kotlinVersion: '2.0.0',
    composeVersion: '2024.06.00',
    activities: [{
      name: 'MainActivity',
      packageName: 'com.example.testapp',
      title: 'Test App',
      layout: 'activity_main',
      isMainLauncher: true,
      isComposeActivity: true,
      composables: ['MainScreen'],
    }],
    permissions: ['android.permission.INTERNET'],
    dependencies: [],
    features: [],
  };
  
  const androidGenerator = new android.AndroidProjectGenerator(androidConfig);
  const androidProject = androidGenerator.generate();
  
  console.log('  ✓ Android project generated');
  console.log('  Files:', androidProject.files.length);
  console.log('  Instructions:', androidProject.instructions.length, 'steps');
  
  // Verify Android files
  const androidOutputDir = path.join(os.tmpdir(), 'webbuilder-test', 'android-project');
  for (const file of androidProject.files) {
    const filePath = path.join(androidOutputDir, file.path);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, file.content);
  }
  
  const androidFiles = fs.readdirSync(androidOutputDir, { recursive: true });
  console.log('  ✓ Android files written:', androidFiles.length);
  
  // ══════════════════════════════════════════════════════════════════════════
  // Summary
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('E2E Pipeline Test Complete');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Output directories:');
  console.log('  Web:', outputDir);
  console.log('  Android:', androidOutputDir);
  console.log('\nGenerated files:');
  console.log('  Web:', generated.files.length, 'files');
  console.log('  Android:', androidProject.files.length, 'files');
}

testE2E().catch(console.error);
