const axios = require('axios');

const BASE_URL = 'https://api.olhovivo.sptrans.com.br/v2.1';
const API_TOKEN = process.env.SPTRANS_API_TOKEN;

let isAuthenticated = false;
let useSimulatedData = false;
let sessionCookie = null;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

// Interceptor que injeta o cookie em todas as requisições
apiClient.interceptors.request.use((config) => {
  if (sessionCookie) {
    config.headers['Cookie'] = sessionCookie;
  }
  return config;
});

async function authenticate() {
  if (!API_TOKEN) {
    console.warn('⚠️  SPTRANS_API_TOKEN não configurado - usando dados simulados');
    useSimulatedData = true;
    return false;
  }

  try {
    const response = await apiClient.post(`/Login/Autenticar?token=${API_TOKEN}`, null, {
      headers: { 'Content-Length': '0' }
    });

    // Captura o cookie de sessão
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      sessionCookie = setCookie[0].split(';')[0];
      console.log('🍪 Cookie de sessão capturado');
    }

    isAuthenticated = response.data === true;

    if (isAuthenticated) {
      console.log('✅ Autenticado na Olho Vivo API');
    } else {
      console.error('❌ Falha na autenticação - Token inválido, response:', response.data);
      useSimulatedData = true;
    }

    return isAuthenticated;
  } catch (error) {
    console.error('❌ Erro ao autenticar:', error.message);
    useSimulatedData = true;
    return false;
  }
}

function generateSimulatedVehicles() {
  const vehicles = [];
  const baseCenter = { lat: -23.55052, lng: -46.633308 };

  for (let i = 0; i < 5; i++) {
    vehicles.push({
      id: `sim-${i}`,
      code: `${8000 + i}-10`,
      prefix: `1000${i}`,
      lineCode: 1000 + i,
      lineName: `Simulado ${i + 1}`,
      position: {
        lat: baseCenter.lat + (Math.random() - 0.5) * 0.05,
        lng: baseCenter.lng + (Math.random() - 0.5) * 0.05
      },
      speed: Math.floor(Math.random() * 40) + 20,
      heading: Math.random() * 360,
      accessible: Math.random() > 0.5,
      updatedAt: new Date().toISOString()
    });
  }
  return vehicles;
}

async function getAllVehicles() {
  if (useSimulatedData) return generateSimulatedVehicles();

  if (!isAuthenticated) {
    const auth = await authenticate();
    if (!auth) return generateSimulatedVehicles();
  }

  try {
    const response = await apiClient.get('/Posicao');
    const data = response.data;
    const vehicles = [];

    if (data.l && Array.isArray(data.l)) {
      data.l.forEach((line) => {
        if (line.vs && Array.isArray(line.vs)) {
          line.vs.forEach((vehicle) => {
            vehicles.push({
              id: `${line.cl}-${vehicle.p}`,
              code: `${line.c}`,
              prefix: vehicle.p,
              lineCode: line.cl,
              lineName: `${line.lt0} ↔ ${line.lt1}`,
              position: { lat: vehicle.py, lng: vehicle.px },
              speed: 0,
              heading: 0,
              accessible: vehicle.a,
              updatedAt: vehicle.ta
            });
          });
        }
      });
    }

    console.log(`📍 ${vehicles.length} veículos carregados da API`);
    return vehicles.length > 0 ? vehicles : generateSimulatedVehicles();
  } catch (error) {
    console.error('❌ Erro ao buscar posição dos veículos:', error.message);
    if (error.response?.status === 401) {
      isAuthenticated = false;
      sessionCookie = null;
    }
    return generateSimulatedVehicles();
  }
}

async function searchStops(searchTerm) {
  if (useSimulatedData) return [];
  if (!isAuthenticated) {
    const auth = await authenticate();
    if (!auth) return [];
  }
  try {
    const response = await apiClient.get(`/Parada/Buscar?termosBusca=${encodeURIComponent(searchTerm)}`);
    return response.data.map(stop => ({
      id: stop.cp, name: stop.np, address: stop.ed,
      position: { lat: stop.py, lng: stop.px }
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar paradas:', error.message);
    return [];
  }
}

async function getStopsByLine(lineCode) {
  if (useSimulatedData) return [];
  if (!isAuthenticated) {
    const auth = await authenticate();
    if (!auth) return [];
  }
  try {
    const response = await apiClient.get(`/Parada/BuscarParadasPorLinha?codigoLinha=${lineCode}`);
    return response.data.map(stop => ({
      id: stop.cp, name: stop.np, address: stop.ed,
      position: { lat: stop.py, lng: stop.px }
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar paradas da linha:', error.message);
    return [];
  }
}

async function getArrivalForecast(stopCode, lineCode) {
  if (useSimulatedData) return null;
  if (!isAuthenticated) {
    const auth = await authenticate();
    if (!auth) return null;
  }
  try {
    const response = await apiClient.get(`/Previsao?codigoParada=${stopCode}&codigoLinha=${lineCode}`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar previsão:', error.message);
    return null;
  }
}

module.exports = { authenticate, 
  getAllVehicles, 
  searchStops, 
  getStopsByLine, 
  getArrivalForecast };