import React from 'react';
import { MapView } from './components/MapView';
import { VehiclePanel } from './components/VehiclePanel';
import { useSocket } from './hooks/useSocket';

export default function App() {
  const { vehicles, isConnected } = useSocket();

  return (
    <div style={layoutStyles.wrapper}>
      <VehiclePanel vehicles={vehicles} isConnected={isConnected} />
      <main style={layoutStyles.mapArea}>
        <MapView vehicles={vehicles} />
      </main>
    </div>
  );
}

const layoutStyles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    color: '#111827'
  },
  mapArea: {
    flex: 1,
    minHeight: '100vh'
  }
};
