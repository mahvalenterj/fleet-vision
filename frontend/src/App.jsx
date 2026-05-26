import React, { useState } from 'react';
import { MapView } from './components/MapView';
import { VehiclePanel } from './components/VehiclePanel';
import { useSocket } from './hooks/useSocket';

export default function App() {
  const { vehicles, isConnected } = useSocket();
  const [filter, setFilter] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const filteredVehicles = filter === ''
    ? vehicles
    : vehicles.filter(v =>
        v.code?.toLowerCase().includes(filter.toLowerCase()) ||
        v.lineName?.toLowerCase().includes(filter.toLowerCase())
      );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f5f5f5' }}>
      <VehiclePanel
        vehicles={vehicles}
        filteredVehicles={filteredVehicles}
        isConnected={isConnected}
        filter={filter}
        onFilterChange={setFilter}
        selectedVehicle={selectedVehicle}
        onSelectVehicle={setSelectedVehicle}
      />
      <main style={{ flex: 1, position: 'relative' }}>
        <MapView
          vehicles={filteredVehicles}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={setSelectedVehicle}
        />
      </main>
    </div>
  );
}
