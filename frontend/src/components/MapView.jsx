import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const INITIAL_CENTER = [-46.633308, -23.55052];
const INITIAL_ZOOM = 11;

const btnBase = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11, padding: '6px 14px', borderRadius: 4,
  cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase',
  transition: 'all 0.2s', border: '1px solid #2a3140',
  background: 'transparent', color: '#718096'
};

const btnActive = {
  ...btnBase,
  borderColor: '#ffb300', color: '#ffb300',
  background: 'rgba(255,179,0,0.1)'
};

export function MapView({ vehicles }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  const stopMarkersRef = useRef(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showStops, setShowStops] = useState(false);

  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    map.once('load', () => setMapLoaded(true));
    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const activeIds = new Set();

    vehicles.forEach((vehicle) => {
      activeIds.add(vehicle.id);
      const coord = [vehicle.position.lng, vehicle.position.lat];
      const existing = markersRef.current.get(vehicle.id);

      if (existing) {
        existing.setLngLat(coord);
        return;
      }

      const el = document.createElement('div');
      el.style.cssText = `
        width:10px;height:10px;border-radius:50%;
        background:#00d4ff;
        box-shadow:0 0 8px #00d4ff, 0 0 2px #00d4ff;
        cursor:pointer;
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coord)
        .setPopup(
          new mapboxgl.Popup({ offset: 12, className: 'fleet-popup' }).setHTML(`
            <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:#e2e8f0;padding:4px">
              <div style="color:#00d4ff;font-weight:600;margin-bottom:4px">${vehicle.code}</div>
              <div style="color:#718096;font-size:11px;margin-bottom:2px">${vehicle.lineName || '—'}</div>
              <div style="color:#4a5568;font-size:10px">${vehicle.accessible ? '♿ Acessível' : 'Não acessível'}</div>
              <div style="color:#4a5568;font-size:10px">${new Date(vehicle.updatedAt).toLocaleTimeString()}</div>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.set(vehicle.id, marker);
    });

    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
  }, [vehicles, mapLoaded]);

  const handleShowStops = async () => {
    if (showStops) {
      stopMarkersRef.current.forEach(m => m.remove());
      stopMarkersRef.current.clear();
      setShowStops(false);
      return;
    }
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/api/stops/search?q=Terminal`);
      const stops = await res.json();
      stops.forEach(stop => {
        const el = document.createElement('div');
        el.style.cssText = `
          width:10px;height:10px;border-radius:2px;
          background:#ffb300;
          box-shadow:0 0 6px #ffb300;
          cursor:pointer;
        `;
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([stop.position.lng, stop.position.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 10 }).setHTML(`
              <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#e2e8f0;padding:4px">
                <div style="color:#ffb300;font-weight:600;margin-bottom:2px">🚌 ${stop.name}</div>
                <div style="color:#718096">${stop.address || ''}</div>
              </div>
            `)
          )
          .addTo(mapRef.current);
        stopMarkersRef.current.set(stop.id, marker);
      });
      setShowStops(true);
    } catch (e) {
      console.error('Erro ao carregar paradas:', e);
    }
  };

  return (
    <>
      <style>{`
        .mapboxgl-popup-content {
          background: #111418 !important;
          border: 1px solid #2a3140 !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
          padding: 8px !important;
        }
        .mapboxgl-popup-tip { display: none !important; }
        .mapboxgl-ctrl-group { background: #111418 !important; border: 1px solid #2a3140 !important; }
        .mapboxgl-ctrl-group button { background: #111418 !important; }
        .mapboxgl-ctrl-icon { filter: invert(1) !important; }
      `}</style>

      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 48,
          background: 'rgba(10,12,15,0.85)', backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #1e2329',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, zIndex: 10
        }}>
          <button
            style={showStops ? btnActive : btnBase}
            onClick={handleShowStops}
          >
            🚌 {showStops ? 'Ocultar Paradas' : 'Paradas'}
          </button>
          <div style={{ flex: 1 }} />
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10, color: '#4a5568', letterSpacing: '0.05em'
          }}>
            {vehicles.length} veículos · São Paulo
          </div>
        </div>

        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      </div>
    </>
  );
}