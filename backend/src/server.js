const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { authenticate, getAllVehicles } = require('./services/olhoVivoService');
const vehiclesRouter = require('./routes/vehicles');
const stopsRouter = require('./routes/stops');

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/stops', stopsRouter);

app.get('/', (req, res) => {
  res.json({ status: 'Fleet Tracker backend is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    backend: 'SP Trans Olho Vivo API'
  });
});

io.on('connection', (socket) => {
  console.log('🔌 Socket conectado:', socket.id);
  
  // Envia veículos ao conectar
  getAllVehicles().then(vehicles => {
    socket.emit('vehicle:init', vehicles);
  }).catch(err => {
    console.error('Erro ao buscar veículos iniciais:', err);
    socket.emit('vehicle:init', []);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket desconectado:', socket.id);
  });
});

// Inicializa autenticação
authenticate().then((isAuth) => {
  if (isAuth) {
    // Atualiza posição dos veículos a cada 10 segundos
    setInterval(() => {
      getAllVehicles().then(vehicles => {
        io.emit('vehicle:update', vehicles);
      }).catch(err => {
        console.error('Erro ao atualizar veículos:', err);
      });
    }, 10000);

    console.log('✅ Sistema de atualização de veículos iniciado');
  } else {
    console.warn('⚠️  Executando em modo simulado (sem dados reais)');
    
    // Mesmo em modo simulado, atualiza os dados
    setInterval(() => {
      getAllVehicles().then(vehicles => {
        io.emit('vehicle:update', vehicles);
      }).catch(err => {
        console.error('Erro ao atualizar veículos simulados:', err);
      });
    }, 5000);
  }
}).catch(err => {
  console.error('Erro durante autenticação:', err);
  console.warn('⚠️  Iniciando em modo de fallback');
});

server.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
