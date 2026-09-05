const axios = require('axios');
async function run() {
  const api = axios.create({ baseURL: 'http://localhost:5050/api/v1' });
  const login = await api.post('/auth/signin', { email: 'admin@acme.com', password: 'admin123' });
  const cookies = login.headers['set-cookie'];
  console.log('Set-Cookie:', cookies);

  const me = await api.get('/auth/me', { headers: { Cookie: cookies[0] } }).catch(e => e.response);
  console.log('/auth/me status:', me.status);
}
run();
