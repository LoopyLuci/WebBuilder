// Direct MCP server test - import and call methods
const path = require('path');

async function testMCPServer() {
  console.log('=== WebBuilder MCP Server Direct Test ===\n');
  
  // Import the built server
  const { WebBuilderMCPServer } = require(path.join(__dirname, '..', 'packages', 'mcp-server', 'dist', 'index.js'));
  
  const server = new WebBuilderMCPServer();
  
  // Test list tools by accessing the internal MCP server
  console.log('Server created successfully');
  console.log('Server type:', typeof server);
  console.log('Server constructor:', server.constructor.name);
  
  // Try to start the server (it will block waiting for stdio)
  console.log('\nAttempting to start server (will timeout after 3s)...');
  
  try {
    await Promise.race([
      server.start(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]);
  } catch (e) {
    console.log('Server stopped (expected):', e.message);
  }
  
  console.log('\n=== Test Complete ===');
}

testMCPServer().catch(console.error);
