// Test MCP server using JSON-RPC over stdio
const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'packages', 'mcp-server', 'dist', 'cli.js');

async function testServer() {
  console.log('=== WebBuilder MCP Server Test ===\n');
  
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  
  let output = '';
  let errorOutput = '';
  
  server.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  server.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  
  // Initialize request
  const initRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test', version: '1.0.0' },
    },
  });
  
  server.stdin.write(initRequest + '\n');
  
  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('--- After Initialize ---');
  if (output) console.log('Output:', output.substring(0, 400));
  if (errorOutput) console.log('Stderr:', errorOutput.substring(0, 200));
  
  // List tools request
  const listToolsRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {},
  });
  
  output = '';
  server.stdin.write(listToolsRequest + '\n');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n--- After List Tools ---');
  if (output) {
    try {
      const parsed = JSON.parse(output);
      const tools = parsed.result?.tools || [];
      console.log(`Total tools: ${tools.length}`);
      tools.forEach((t) => console.log(`  - ${t.name}`));
    } catch (e) {
      console.log('Output:', output.substring(0, 400));
    }
  }
  
  server.kill();
  
  console.log('\n=== Test Complete ===');
}

testServer().catch(console.error);
