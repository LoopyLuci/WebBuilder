#!/usr/bin/env node
// Test MCP Server tools are accessible
import { WebBuilderMCPServer } from './dist/index.js';

async function testMCPServer() {
  const server = new WebBuilderMCPServer();
  
  // List available tools
  const tools = await server.listTools();
  
  console.log('=== MCP Server Tools ===');
  console.log(`Total tools: ${tools.length}`);
  tools.forEach(t => console.log(`  - ${t.name}: ${t.description}`));
  
  // Test a few tools
  console.log('\n=== Testing Tools ===');
  
  // Test parse_intent
  try {
    const result = await server.callTool('parse_intent', { 
      description: 'Build a landing page for my SaaS product' 
    });
    console.log('parse_intent: OK');
    console.log(`  Result: ${JSON.stringify(result).substring(0, 200)}...`);
  } catch (err) {
    console.error('parse_intent: FAILED', err);
  }
  
  // Test generate_code
  try {
    const result = await server.callTool('generate_code', { 
      spec: { name: 'Test', description: 'Test project', structure: { pages: [{ path: '/', name: 'Home', title: 'Home', sections: [] }] } }
    });
    console.log('generate_code: OK');
    console.log(`  Result: ${JSON.stringify(result).substring(0, 200)}...`);
  } catch (err) {
    console.error('generate_code: FAILED', err);
  }
  
  console.log('\n=== MCP Server Test Complete ===');
}

testMCPServer().catch(console.error);
