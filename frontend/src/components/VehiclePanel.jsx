import React from 'react';

export function VehiclePanel({ vehicles, isConnected }) {
  const sortedVehicles = [...vehicles].sort((a, b) => a.code.localeCompare(b.code));

  return (
    <aside style={panelStyles.container}>
      <div style={panelStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <h2 style={panelStyles.title}>Veículos em rota</h2>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10b981' : '#ef4444',
              animation: isConnected ? 'pulse 2s infinite' : 'none'
            }}
          />
        </div>
        <p style={panelStyles.subtitle}>
          {isConnected ? 'Conectado · Atualizado a cada 2s' : 'Desconectado - tentando reconectar...'}
        </p>
      </div>

      {sortedVehicles.length === 0 ? (
        <div style={panelStyles.empty}>
          {isConnected
            ? 'Carregando veículos...'
            : 'Aguardando conexão com o backend...'}
        </div>
      ) : (
        <ul style={panelStyles.list}>
          {sortedVehicles.map((vehicle) => (
            <li key={vehicle.id} style={panelStyles.item}>
              <div>
                <strong>{vehicle.code}</strong>
                <div style={panelStyles.meta}>ID: {vehicle.id.slice(0, 8)}</div>
              </div>
              <div style={panelStyles.stats}>
                <span>{Math.round(vehicle.speed)} km/h</span>
                <span>{new Date(vehicle.updatedAt).toLocaleTimeString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </aside>
  );
}

const panelStyles = {
  container: {
    width: 320,
    minWidth: 280,
    maxWidth: 360,
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    padding: '20px 18px',
    boxSizing: 'border-box',
    overflowY: 'auto',
    height: '100vh'
  },
  header: {
    marginBottom: 20
  },
  title: {
    margin: 0,
    fontSize: 20,
    color: '#111827'
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#6b7280',
    fontSize: 14
  },
  empty: {
    color: '#6b7280',
    paddingTop: 16
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '14px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  meta: {
    marginTop: 6,
    color: '#9ca3af',
    fontSize: 12
  },
  stats: {
    textAlign: 'right',
    color: '#111827',
    fontSize: 14,
    lineHeight: 1.4
  }
};
