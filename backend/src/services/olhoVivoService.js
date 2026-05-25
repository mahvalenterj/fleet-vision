const axios = require('axios');

const BASE_URL = 'http://api.olhovivo.sptrans.com.br/v2.1';
const API_TOKEN = process.env.SPTRANS_API_TOKEN;

// Instância axios com configuração de cookies
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000
});

let isAuthenticated = false;
let useSimulatedData = false;

/**
 * Autentica na API do Olho Vivo
 */
async function authenticate() {
  if (!API_TOKEN) {
    console.warn('⚠️  SPTRANS_API_TOKEN não configurado - usando dados simulados');
    useSimulatedData = true;
    return false;
  }

  try {
    const response = await apiClient.post(`/Login/Autenticar?token=${API_TOKEN}`);
    isAuthenticated = response.data === true;
    
    if (isAuthenticated) {
      console.log('✅ Autenticado na Olho Vivo API');
    } else {
      console.error('❌ Falha na autenticação - Token inválido');
      useSimulatedData = true;
    }
    
    return isAuthenticated;
  } catch (error) {
    console.error('❌ Erro ao autenticar:', error.message);
    console.warn('⚠️  Usando dados simulados como fallback');
    useSimulatedData = true;
    return false;
  }
}

/**
 * Gera veículos simulados para testes
 */
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

/**
 * Busca posição de todos os veículos
 */
async function getAllVehicles() {
  if (useSimulatedData) {
    return generateSimulatedVehicles();
  }

  if (!isAuthenticated) {
    const auth = await authenticate();
    if (!auth) return generateSimulatedVehicles();
  }

  try {
    const response = await apiClient.get('/Posicao');
    const data = response.data;

    // Transforma dados da API para formato esperado pelo frontend
    const vehicles = [];
    
    if (data.l && Array.isArray(data.l)) {
      data.l.forEach((line) => {
        if (line.vs && Array.isArray(line.vs)) {
          line.vs.forEach((vehicle) => {
            vehicles.push({
              id: `${line.cl}-${vehicle.p}`, // cl = código da linha, p = prefixo
              code: `${line.c}`, // Letreiro completo (ex: "5015-10")
              prefix: vehicle.p,
              lineCode: line.cl,
              lineName: `${line.lt0} ↔ ${line.lt1}`,
              position: {
                lat: vehicle.py,
                lng: vehicle.px
              },
              speed: 0, // A API não fornece velocidade diretamente
              heading: 0, // A API não fornece direção
              accessible: vehicle.a, // Se é acessível para PCD
              updatedAt: vehicle.ta // ISO 8601 timestamp
            });
          });
        }
      });
    }

    console.log(`📍 ${vehicles.length} veículos carregados da API`);
    return vehicles.length > 0 ? vehicles : generateSimulatedVehicles();
  } catch (error) {
    console.error('❌ Erro ao buscar posição dos veículos:', error.message);
    return generateSimulatedVehicles();
  }
}

/**
 * Busca paradas de ônibus
 */
async function searchStops(searchTerm) {
  if (useSimulatedData) {
    return [
      {
        id: 1,
        name: 'Terminal Lapa',
        address: 'Av. Paulista, São Paulo',
        position: { lat: -23.5505, lng: -46.6331 }
      }
    ];
  }

  if (!isAuthenticated) {
    const auth = await authenticate();
    if (!auth) return [];
  }

  try {
    const response = await apiClient.get(`/Parada/Buscar?termosBusca=${encodeURIComponent(searchTerm)}`);
    const stops = response.data;

    return stops.map(stop => ({
      id: stop.cp, // Código da parada
      name: stop.np, // Nome da parada
      address: stop.ed, // Endereço
      position: {
        lat: stop.py,
        lng: stop.px
      }
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar paradas:', error.message);
    return [];
  }
}

/**
 * Busca todas as paradas de uma linha específica
 */
async function getStopsByLine(lineCode) {
  if (useSimulatedData) return [];

  if (!isAuthenticated) {
    const auth = await authenticate();
    if (!auth) return [];
  }

  try {
    const response = await apiClient.get(`/Parada/BuscarParadasPorLinha?codigoLinha=${lineCode}`);
    const stops = response.data;

    return stops.map(stop => ({
      id: stop.cp,
      name: stop.np,
      address: stop.ed,
      position: {
        lat: stop.py,
        lng: stop.px
      }
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar paradas da linha:', error.message);
    return [];
  }
}

/**
 * Busca previsão de chegada em uma parada
 */
async function getArrivalForecast(stopCode, lineCode) {
  if (useSimulatedData) return null;

  if (!isAuthenticated) {
    const auth = await authenticate();
    if (!auth) return null;
  }

  try {
    const response = await apiClient.get(
      `/Previsao?codigoParada=${stopCode}&codigoLinha=${lineCode}`
    );
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar previsão:', error.message);
    return null;
  }
}

module.exports = {
  authenticate,
  getAllVehicles,
  searchStops,
  getStopsByLine,
  getArrivalForecast
};
