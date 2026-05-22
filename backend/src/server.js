const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { autenticar, getPosicoes } = require('./sptrans');
const vehiclesRouter = require('./routes/vehicles');

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

let ultimosVeiculos = [];

app.use(cors());
app.use(express.json());
app.use('/api/vehicles', vehiclesRouter);

app.get('/', (req, res) => {
  res.json({ status: 'Fleet Tracker backend is running' });
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.emit('vehicle:init', ultimosVeiculos);

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

async function iniciarSPTrans() {
  const autenticado = await autenticar();
  if (!autenticado) {
    console.error('Falha na autenticação SPTrans — verifique o token');
    return;
  }
  console.log('SPTrans autenticado com sucesso');

  setInterval(async () => {
    const dados = await getPosicoes();
    if (!dados || !dados.l) return;

    ultimosVeiculos = dados.l.flatMap(linha =>
      linha.vs.map(v => ({
        id: String(v.p),
        code: linha.c,
        position: { lat: v.py, lng: v.px },
        speed: 0,
        acessivel: v.a,
        updatedAt: v.ta
      }))
    );

    io.emit('vehicle:update', ultimosVeiculos);
  }, 15000);
}

iniciarSPTrans();

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
