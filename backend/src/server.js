const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { startSimulator, getVehicles } = require('./simulator');
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

app.use(cors());
app.use(express.json());
app.use('/api/vehicles', vehiclesRouter);

app.get('/', (req, res) => {
  res.json({ status: 'Fleet Tracker backend is running' });
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.emit('vehicle:init', getVehicles());

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

startSimulator();
setInterval(() => {
  io.emit('vehicle:update', getVehicles());
}, 2000);

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
