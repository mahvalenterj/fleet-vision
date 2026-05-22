const https = require('https');

const TOKEN = process.env.SPTRANS_TOKEN;
const BASE_URL = 'api.olhovivo.sptrans.com.br';
let cookie = null;

async function autenticar() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: BASE_URL,
      path: `/v2.1/Login/Autenticar?token=${TOKEN}`,
      method: 'POST',
      headers: {
        'Content-Length': 0
      }
    }, (res) => {
      cookie = res.headers['set-cookie']?.[0];
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Auth status:', body.trim());
        console.log('Cookie recebido:', cookie);
        resolve(body.trim() === 'true');
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function getPosicoes() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: BASE_URL,
      path: '/v2.1/Posicao',
      method: 'GET',
      headers: { Cookie: cookie }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Posicoes status HTTP:', res.statusCode);
        console.log('Body (primeiros 200 chars):', body.substring(0, 200));
        try { resolve(JSON.parse(body)); }
        catch { resolve(null); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

module.exports = { autenticar, getPosicoes };
