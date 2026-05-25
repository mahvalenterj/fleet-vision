import React from 'react';
import { MapView } from './components/MapView';
import { VehiclePanel } from './components/VehiclePanel';
import { useSocket } from './hooks/useSocket';

export default function App() {
  const { vehicles, isConnected } = useSocket();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0c0f' }}>
      <VehiclePanel vehicles={vehicles} isConnected={isConnected} />
      <main style={{ flex: 1, position: 'relative' }}>
        <MapView vehicles={vehicles} />
      </main>
    </div>
  );
}