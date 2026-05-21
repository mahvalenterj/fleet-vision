const { v4: uuidv4 } = require('uuid');

const CENTER = { lat: -23.55052, lng: -46.633308 };
const VEHICLE_COUNT = 5;
const UPDATE_INTERVAL_MS = 2000;

const vehicles = Array.from({ length: VEHICLE_COUNT }, (_, index) => createVehicle(index + 1));

function randomOffset(maxDegrees) {
  return (Math.random() - 0.5) * maxDegrees;
}

function createVehicle(sequence) {
  const lat = CENTER.lat + randomOffset(0.05);
  const lng = CENTER.lng + randomOffset(0.05);
  return {
    id: uuidv4(),
    code: `BUS-${String(sequence).padStart(2, '0')}`,
    position: { lat, lng },
    speed: Math.random() * 20 + 20,
    heading: Math.random() * 360,
    updatedAt: new Date().toISOString()
  };
}

function tickVehicle(vehicle) {
  const distance = (vehicle.speed / 3.6) * (UPDATE_INTERVAL_MS / 1000) * 0.00002;
  const headingRad = (vehicle.heading * Math.PI) / 180;
  vehicle.position.lat += Math.cos(headingRad) * distance;
  vehicle.position.lng += Math.sin(headingRad) * distance;
  vehicle.heading = (vehicle.heading + randomOffset(20)) % 360;
  vehicle.speed = Math.max(10, Math.min(60, vehicle.speed + randomOffset(10)));
  vehicle.updatedAt = new Date().toISOString();
}

function startSimulator() {
  setInterval(() => {
    vehicles.forEach(tickVehicle);
  }, UPDATE_INTERVAL_MS);
}

function getVehicles() {
  return vehicles;
}

module.exports = {
  startSimulator,
  getVehicles
};
