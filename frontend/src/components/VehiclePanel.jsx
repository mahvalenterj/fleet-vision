import React, { useState } from 'react';

const S = {
  sidebar: {
    width: 280, minWidth: 280,
    background: '#111418',
    borderRight: '1px solid #1e2329',
    display: 'flex', flexDirection: 'column',
    height: '100vh', fontFamily: "'IBM Plex Sans', sans-serif"
  },
  header: {
    padding: '20px 18px 16px',
    borderBottom: '1px solid #1e2329',
    background: 'linear-gradient(180deg, #13181f 0%, #111418 100%)'
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  logoIcon: {
    width: 32, height: 32,
    background: 'rgba(0,212,255,0.15)',
    border: '1px solid #00d4ff',
    borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16
  },
  logoText: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13, fontWeight: 600,
    color: '#00d4ff', letterSpacing: '0.08em', textTransform: 'uppercase'
  },
  logoSub: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10, color: '#4a5568', letterSpacing: '0.05em'
  },
  statusRow: { display: 'flex', alignItems: 'center', gap: 8 },
  statusText: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11, color: '#00ff88', letterSpacing: '0.05em'
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 1, background: '#1e2329',
    borderBottom: '1px solid #1e2329'
  },
  statBox: { background: '#111418', padding: '14px 16px' },
  statLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 9, color: '#4a5568',
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4
  },
  statValue: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 22, fontWeight: 600, color: '#00d4ff', lineHeight: 1
  },
  filterSection: { padding: '14px 16px', borderBottom: '1px solid #1e2329' },
  filterLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 9, color: '#4a5568',
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8
  },
  filterInput: {
    width: '100%', background: '#0a0c0f',
    border: '1px solid #2a3140', color: '#e2e8f0',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12, padding: '8px 10px', borderRadius: 4, outline: 'none'
  },
  list: { flex: 1, overflowY: 'auto', listStyle: 'none', margin: 0, padding: 0 },
  item: {
    padding: '12px 16px', borderBottom: '1px solid #1e2329',
    cursor: 'pointer', borderLeft: '2px solid transparent',
    transition: 'all 0.15s'
  },
  code: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 3
  },
  line: {
    fontSize: 11, color: '#718096', marginBottom: 6,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
  },
  meta: { display: 'flex', alignItems: 'center', gap: 6 },
  tagPcd: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 9, padding: '2px 6px', borderRadius: 3,
    letterSpacing: '0.05em', textTransform: 'uppercase',
    background: 'rgba(0,255,136,0.12)', color: '#00ff88',
    border: '1px solid rgba(0,255,136,0.2)'
  },
  tagTime: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 9, padding: '2px 6px', borderRadius: 3,
    letterSpacing: '0.05em',
    background: 'rgba(255,255,255,0.04)', color: '#4a5568',
    border: '1px solid #2a3140'
  },
  empty: {
    padding: 20, color: '#4a5568',
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 12
  }
};

export function VehiclePanel({ vehicles, isConnected }) {
  const [filter, setFilter] = useState('');

  const filtered = vehicles
    .filter(v =>
      filter === '' ||
      v.code?.toLowerCase().includes(filter.toLowerCase()) ||
      v.lineName?.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => (a.code || '').localeCompare(b.code || ''));

  const lines = new Set(vehicles.map(v => v.lineCode)).size;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .v-item:hover { background: rgba(0,212,255,0.04) !important; border-left-color: #00d4ff !important; }
        .filter-in:focus { border-color: #00d4ff !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a3140; border-radius: 2px; }
      `}</style>

      <aside style={S.sidebar}>
        <div style={S.header}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}>🚌</div>
            <div>
              <div style={S.logoText}>Fleet Vision</div>
              <div style={S.logoSub}>SPTrans · Tempo Real</div>
            </div>
          </div>
          <div style={S.statusRow}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isConnected ? '#00ff88' : '#ff4444',
              boxShadow: isConnected ? '0 0 8px #00ff88' : '0 0 8px #ff4444',
              animation: 'pulse 2s infinite'
            }} />
            <span style={S.statusText}>
              {isConnected ? `CONECTADO · ${vehicles.length} veículos` : 'DESCONECTADO'}
            </span>
          </div>
        </div>

        <div style={S.statsRow}>
          <div style={S.statBox}>
            <div style={S.statLabel}>Veículos</div>
            <div style={S.statValue}>{vehicles.length}</div>
          </div>
          <div style={S.statBox}>
            <div style={S.statLabel}>Linhas</div>
            <div style={{ ...S.statValue, color: '#00ff88' }}>{lines}</div>
          </div>
        </div>

        <div style={S.filterSection}>
          <div style={S.filterLabel}>Filtrar por linha</div>
          <input
            className="filter-in"
            style={S.filterInput}
            placeholder="Ex: 847P, Lapa, Terminal..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div style={S.empty}>
            {isConnected ? 'Nenhum resultado.' : 'Aguardando conexão...'}
          </div>
        ) : (
          <ul style={S.list}>
            {filtered.map(vehicle => (
              <li key={vehicle.id} className="v-item" style={S.item}>
                <div style={S.code}>{vehicle.code}</div>
                <div style={S.line}>{vehicle.lineName || '—'}</div>
                <div style={S.meta}>
                  {vehicle.accessible && <span style={S.tagPcd}>♿ PCD</span>}
                  <span style={S.tagTime}>
                    {new Date(vehicle.updatedAt).toLocaleTimeString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  );
}