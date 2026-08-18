// ============================================================================
// WebBuilder E2E Demo — JavaScript version using compiled packages
// ============================================================================

const { parseIntent, generateCode, createProjectManager } = require('../packages/core/dist/index.js');
const { mkdirSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const { tmpdir } = require('os');

async function runDemo() {
  console.log('='.repeat(70));
  console.log('WebBuilder E2E Demo — Natural Language → Generated Code');
  console.log('='.repeat(70));

  // Step 1: Natural language description
  const description = 'Build a landing page for my project management SaaS called TaskFlow. Include a hero section with a "Start Free Trial" CTA, a features section showing 6 key features in a 3-column grid, a pricing table with 3 tiers (Starter, Pro, Enterprise), and a footer with links.';

  console.log('\n📝 Input Description:');
  console.log(`   "${description}"\n`);

  // Step 2: Parse intent
  console.log('🔍 Parsing intent...');
  const parsed = parseIntent(description);

  console.log(`   ✅ Intent parsed (confidence: ${(parsed.confidence * 100).toFixed(0)}%)`);
  console.log(`   📋 Goals: ${parsed.intent.goals.join(', ')}`);
  console.log(`   🎯 Audience: ${parsed.intent.audience}`);
  console.log(`   📄 Pages: ${parsed.spec.structure?.pages?.length ?? 0}`);
  console.log(`   🎨 Design system: ${parsed.spec.design?.tokens ? 'Generated' : 'None'}`);

  // Step 3: Create project
  const spec = parsed.spec;
  const projectManager = createProjectManager();
  projectManager.create(spec);

  console.log(`\n💾 Project saved: ${spec.id}`);

  // Step 4: Generate code
  console.log('\n⚙️  Generating code...');
  const generated = generateCode(spec);

  console.log(`   ✅ Generated ${generated.files.length} files`);

  // Step 5: Write files to disk
  const outputDir = join(tmpdir(), 'webbuilder-demo', spec.id);
  console.log(`\n📁 Writing files to: ${outputDir}`);

  for (const file of generated.files) {
    const filePath = join(outputDir, file.path);
    const dir = join(filePath, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, file.content);
  }

  // Step 6: Summary
  console.log('\n' + '='.repeat(70));
  console.log('🎉 Project Generated Successfully!');
  console.log('='.repeat(70));

  console.log('\n📦 Generated Files:');
  for (const file of generated.files) {
    console.log(`   ✅ ${file.path}`);
  }

  console.log('\n📋 Dependencies:');
  for (const [name, version] of Object.entries(generated.dependencies)) {
    console.log(`   📦 ${name}: ${version}`);
  }

  console.log('\n🔧 Scripts:');
  for (const [name, cmd] of Object.entries(generated.scripts)) {
    console.log(`   ⚡ ${name}: ${cmd}`);
  }

  console.log('\n📖 Next Steps:');
  for (const instruction of generated.instructions) {
    console.log(`   👉 ${instruction}`);
  }

  console.log(`\n📂 Full project at: ${outputDir}`);
  console.log('\n✨ Demo complete!\n');
}

runDemo().catch(console.error);
