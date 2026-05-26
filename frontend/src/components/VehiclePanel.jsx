import React from 'react';

const C = {
  teal: '#00BCD4',
  tealDark: '#0097A7',
  tealLight: '#E0F7FA',
  tealMid: '#B2EBF2',
  dark: '#1a1f2e',
  text: '#212121',
  textMuted: '#757575',
  border: '#E0E0E0',
  bg: '#FFFFFF',
  bgSoft: '#F5F5F5',
};

const S = {
  sidebar: {
    width: 320, minWidth: 320,
    background: C.dark,
    display: 'flex', flexDirection: 'column',
    height: '100vh',
    fontFamily: "'Nunito Sans', 'Segoe UI', sans-serif",
    boxShadow: '2px 0 12px rgba(0,0,0,0.15)'
  },
  header: {
    padding: '20px 20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: C.dark
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16
  },
  logoIcon: {
    width: 36, height: 36,
    background: C.teal,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18
  },
  logoText: {
    fontSize: 22, fontWeight: 800,
    color: '#fff', letterSpacing: '-0.02em'
  },
  logoDot: { color: C.teal },
  logoSub: {
    fontSize: 11, color: 'rgba(255,255,255,0.4)',
    fontWeight: 400, marginTop: 1
  },
  statusRow: {
    display: 'flex', alignItems: 'center',
    gap: 8, padding: '8px 12px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 8
  },
  statusText: {
    fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
    gap: 1, background: 'rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.08)'
  },
  statBox: {
    background: C.dark, padding: '14px 16px', textAlign: 'center'
  },
  statLabel: {
    fontSize: 9, color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4
  },
  statValue: {
    fontSize: 20, fontWeight: 700, color: C.teal, lineHeight: 1
  },
  filterSection: {
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: C.dark
  },
  filterLabel: {
    fontSize: 10, color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8
  },
  filterInput: {
    width: '100%', background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    fontSize: 13, padding: '9px 12px',
    borderRadius: 8, outline: 'none',
    fontFamily: "'Nunito Sans', sans-serif"
  },
  clearBtn: {
    marginTop: 6, width: '100%',
    fontSize: 11, padding: '5px',
    borderRadius: 6, cursor: 'pointer',
    background: 'transparent', color: 'rgba(255,255,255,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    textTransform: 'uppercase', letterSpacing: '0.05em'
  },
  list: {
    flex: 1, overflowY: 'auto',
    listStyle: 'none', margin: 0, padding: 0
  },
  item: {
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    transition: 'all 0.15s'
  },
  itemSelected: {
    background: 'rgba(0,188,212,0.12)',
    borderLeftColor: C.teal
  },
  codeRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 4
  },
  code: {
    fontSize: 14, fontWeight: 700, color: '#fff'
  },
  lineName: {
    fontSize: 11, color: 'rgba(255,255,255,0.45)',
    marginBottom: 8, lineHeight: 1.4,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
  },
  meta: { display: 'flex', alignItems: 'center', gap: 6 },
  tagPcd: {
    fontSize: 10, padding: '2px 8px', borderRadius: 20,
    background: 'rgba(0,188,212,0.2)', color: C.teal,
    border: '1px solid rgba(0,188,212,0.3)', fontWeight: 600
  },
  tagTime: {
    fontSize: 10, padding: '2px 8px', borderRadius: 20,
    background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  empty: {
    padding: 24, color: 'rgba(255,255,255,0.3)',
    fontSize: 13, textAlign: 'center', lineHeight: 1.6
  }
};

export function VehiclePanel({ vehicles, filteredVehicles, isConnected, filter, onFilterChange, selectedVehicle, onSelectVehicle }) {
  const lines = new Set(vehicles.map(v => v.lineCode)).size;
  const accessible = vehicles.filter(v => v.accessible).length;
  const sorted = [...filteredVehicles].sort((a, b) => (a.code || '').localeCompare(b.code || ''));

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .v-item:hover { background: rgba(0,188,212,0.08) !important; border-left-color: rgba(0,188,212,0.5) !important; }
        .filter-in:focus { border-color: #00BCD4 !important; background: rgba(0,188,212,0.08) !important; }
        .clear-btn:hover { color: rgba(255,255,255,0.6) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <aside style={S.sidebar}>
        <div style={S.header}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}>🚌</div>
            <div>
              <div style={S.logoText}>
                vá de <span style={S.logoDot}>ô</span>nibus
              </div>
              <div style={S.logoSub}>SP · Tempo Real</div>
            </div>
          </div>
          <div style={S.statusRow}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isConnected ? '#4CAF50' : '#f44336',
              boxShadow: isConnected ? '0 0 6px #4CAF50' : '0 0 6px #f44336',
              animation: 'pulse 2s infinite', flexShrink: 0
            }} />
            <span style={S.statusText}>
              {isConnected ? `Conectado · ${vehicles.length} veículos ativos` : 'Desconectado...'}
            </span>
          </div>
        </div>

        <div style={S.statsRow}>
          <div style={S.statBox}>
            <div style={S.statLabel}>Veículos</div>
            <div style={S.statValue}>{filteredVehicles.length}</div>
          </div>
          <div style={S.statBox}>
            <div style={S.statLabel}>Linhas</div>
            <div style={{ ...S.statValue, color: '#80DEEA' }}>{lines}</div>
          </div>
          <div style={S.statBox}>
            <div style={S.statLabel}>Acessível</div>
            <div style={{ ...S.statValue, color: '#A5D6A7' }}>{accessible}</div>
          </div>
        </div>

        <div style={S.filterSection}>
          <div style={S.filterLabel}>
            {filter ? `${filteredVehicles.length} resultado${filteredVehicles.length !== 1 ? 's' : ''}` : 'Buscar linha'}
          </div>
          <input
            className="filter-in"
            style={S.filterInput}
            placeholder="Ex: 847P, Lapa, Terminal..."
            value={filter}
            onChange={e => onFilterChange(e.target.value)}
          />
          {filter && (
            <button className="clear-btn" style={S.clearBtn} onClick={() => onFilterChange('')}>
              ✕ Limpar filtro
            </button>
          )}
        </div>

        {sorted.length === 0 ? (
          <div style={S.empty}>
            {isConnected ? '😕 Nenhuma linha encontrada.' : '⏳ Aguardando conexão...'}
          </div>
        ) : (
          <ul style={S.list}>
            {sorted.map(vehicle => (
              <li
                key={vehicle.id}
                className="v-item"
                style={{
                  ...S.item,
                  ...(selectedVehicle?.id === vehicle.id ? S.itemSelected : {})
                }}
                onClick={() => onSelectVehicle(vehicle)}
              >
                <div style={S.codeRow}>
                  <span style={S.code}>{vehicle.code}</span>
                </div>
                <div style={S.lineName}>{vehicle.lineName || '—'}</div>
                <div style={S.meta}>
                  {vehicle.accessible && <span style={S.tagPcd}>♿ Acessível</span>}
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