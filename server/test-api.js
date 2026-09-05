const http = require('http');

const request = (method, path, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5050,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  console.log("1. Missing required field -> validation error (422)");
  let res = await request('POST', '/api/v1/auth/signup', { email: 'test@test.com', password: 'password123' }); // missing name
  console.log(`Status: ${res.status}`, res.data);

  console.log("\n2. Valid request -> success (201)");
  const email = `user_${Date.now()}@test.com`;
  res = await request('POST', '/api/v1/auth/signup', { name: 'Test User', email, password: 'password123' });
  console.log(`Status: ${res.status}`, res.data);

  console.log("\n3. Duplicate unique field -> 409");
  res = await request('POST', '/api/v1/auth/signup', { name: 'Test User 2', email, password: 'password123' });
  console.log(`Status: ${res.status}`, res.data);

  console.log("\n4. Missing/invalid token -> 401");
  res = await request('GET', '/api/v1/auth/me', null, { Authorization: 'Bearer invalid_token' });
  console.log(`Status: ${res.status}`, res.data);
};

runTests().catch(console.error);
