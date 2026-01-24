/**
 * Socket.IO Test Client
 * Simple script to test Socket.IO connections and messaging
 */

const http = require('http');

/**
 * Test the diagnostics endpoint
 */
function testDiagnosticsEndpoint() {
  console.log('\n========== Testing Diagnostics Endpoint ==========\n');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/diagnostics/sockets',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
      } catch {
        console.log(data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
}

// Run the test
testDiagnosticsEndpoint();
