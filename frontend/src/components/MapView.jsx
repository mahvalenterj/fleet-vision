import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const INITIAL_CENTER = [-46.633308, -23.55052];
const INITIAL_ZOOM = 11;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const btnBase = {
  fontFamily: "'Nunito Sans', sans-serif",
  fontSize: 12, fontWeight: 600,
  padding: '7px 16px', borderRadius: 20,
  cursor: 'pointer', transition: 'all 0.2s',
  border: '1px solid #E0E0E0',
  background: '#fff', color: '#757575',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
};

const btnActive = {
  ...btnBase,
  borderColor: '#00BCD4', color: '#00BCD4',
  background: '#E0F7FA',
  boxShadow: '0 1px 4px rgba(0,188,212,0.2)'
};

export function MapView({ vehicles, selectedVehicle, onSelectVehicle }) {
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
      style: 'mapbox://styles/mapbox/streets-v12',
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    map.once('load', () => setMapLoaded(true));
    return () => map.remove();
  }, []);

  // Voa para veículo selecionado
  useEffect(() => {
    if (!selectedVehicle || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [selectedVehicle.position.lng, selectedVehicle.position.lat],
      zoom: 15, speed: 1.4
    });
  }, [selectedVehicle]);

  // Desenha trajeto quando filtrado por uma linha
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const clearRoute = () => {
      if (map.getLayer('route-line')) map.removeLayer('route-line');
      if (map.getLayer('route-stops')) map.removeLayer('route-stops');
      if (map.getSource('route')) map.removeSource('route');
      if (map.getSource('route-stops')) map.removeSource('route-stops');
    };

    clearRoute();

    const lineCodes = [...new Set(vehicles.map(v => v.lineCode).filter(Boolean))];

    if (lineCodes.length !== 1) return;

    const lineCode = lineCodes[0];

    fetch(`${BACKEND_URL}/api/stops/line/${lineCode}`)
      .then(r => r.json())
      .then(stops => {
        if (!stops || stops.length < 2) return;

        const coords = stops.map(s => [s.position.lng, s.position.lat]);

        // Linha do trajeto
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords }
          }
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#00BCD4',
            'line-width': 3,
            'line-opacity': 0.8,
            'line-dasharray': [2, 1]
          }
        });

        // Paradas da linha
        map.addSource('route-stops', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: stops.map(s => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [s.position.lng, s.position.lat] },
              properties: { name: s.name, address: s.address }
            }))
          }
        });

        map.addLayer({
          id: 'route-stops',
          type: 'circle',
          source: 'route-stops',
          paint: {
            'circle-radius': 5,
            'circle-color': '#fff',
            'circle-stroke-color': '#00BCD4',
            'circle-stroke-width': 2
          }
        });

        // Popup nas paradas
        map.on('click', 'route-stops', (e) => {
          const { name, address } = e.features[0].properties;
          new mapboxgl.Popup({ closeButton: false, offset: 10 })
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(`
              <div style="font-family:'Nunito Sans',sans-serif;padding:4px 2px">
                <div style="font-size:13px;font-weight:700;color:#1a1f2e;margin-bottom:2px">🚌 ${name}</div>
                <div style="font-size:11px;color:#757575">${address || ''}</div>
              </div>
            `)
            .addTo(map);
        });

        map.on('mouseenter', 'route-stops', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'route-stops', () => {
          map.getCanvas().style.cursor = '';
        });

        // Ajusta zoom para a linha
        const bounds = coords.reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
      })
      .catch(e => console.error('Erro ao buscar trajeto:', e));

  }, [vehicles, mapLoaded]);

  // Atualiza marcadores de veículos
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const activeIds = new Set();

    vehicles.forEach((vehicle) => {
      activeIds.add(vehicle.id);
      const coord = [vehicle.position.lng, vehicle.position.lat];
      const existing = markersRef.current.get(vehicle.id);
      const isSelected = selectedVehicle?.id === vehicle.id;

      if (existing) {
        existing.setLngLat(coord);
        existing.getElement().style.background = isSelected ? '#FF5722' : '#00BCD4';
        existing.getElement().style.width = isSelected ? '16px' : '12px';
        existing.getElement().style.height = isSelected ? '16px' : '12px';
        return;
      }

      const el = document.createElement('div');
      el.style.cssText = `
        width:12px; height:12px; border-radius:50%;
        background:#00BCD4;
        box-shadow: 0 0 0 3px rgba(0,188,212,0.25), 0 2px 6px rgba(0,0,0,0.15);
        cursor:pointer; transition: all 0.2s;
        border: 2px solid #fff;
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coord)
        .setPopup(
          new mapboxgl.Popup({ offset: 14, closeButton: false }).setHTML(`
            <div style="font-family:'Nunito Sans',sans-serif;padding:4px 2px;min-width:160px">
              <div style="font-size:15px;font-weight:800;color:#1a1f2e;margin-bottom:2px">${vehicle.code}</div>
              <div style="font-size:11px;color:#757575;margin-bottom:6px;line-height:1.4">${vehicle.lineName || '—'}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${vehicle.accessible ? '<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#E0F7FA;color:#00838F;font-weight:600">♿ Acessível</span>' : ''}
                <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#F5F5F5;color:#9E9E9E">${new Date(vehicle.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          `)
        )
        .addTo(map);

      el.addEventListener('click', () => onSelectVehicle?.(vehicle));
      markersRef.current.set(vehicle.id, marker);
    });

    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
  }, [vehicles, mapLoaded, selectedVehicle]);

  const handleShowStops = async () => {
    if (showStops) {
      stopMarkersRef.current.forEach(m => m.remove());
      stopMarkersRef.current.clear();
      setShowStops(false);
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/stops/search?q=Terminal`);
      const stops = await res.json();
      stops.forEach(stop => {
        const el = document.createElement('div');
        el.style.cssText = `
          width:10px; height:10px; border-radius:3px;
          background:#FF9800;
          box-shadow: 0 0 0 3px rgba(255,152,0,0.2);
          cursor:pointer; border: 2px solid #fff;
        `;
        new mapboxgl.Marker({ element: el })
          .setLngLat([stop.position.lng, stop.position.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 10, closeButton: false }).setHTML(`
              <div style="font-family:'Nunito Sans',sans-serif;padding:4px 2px">
                <div style="font-size:13px;font-weight:700;color:#1a1f2e;margin-bottom:2px">🚌 ${stop.name}</div>
                <div style="font-size:11px;color:#757575">${stop.address || ''}</div>
              </div>
            `)
          )
          .addTo(mapRef.current);
        stopMarkersRef.current.set(stop.id, true);
      });
      setShowStops(true);
    } catch (e) {
      console.error('Erro ao carregar paradas:', e);
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        .mapboxgl-popup-content {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
          padding: 12px 14px !important;
          border: 1px solid #E0E0E0 !important;
        }
        .mapboxgl-popup-tip { border-top-color: #fff !important; }
        .mapboxgl-ctrl-group {
          border-radius: 10px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
          border: 1px solid #E0E0E0 !important;
        }
      `}</style>

      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <div style={{
          position: 'absolute', top: 12, left: 12,
          display: 'flex', gap: 8, zIndex: 10
        }}>
          <button style={showStops ? btnActive : btnBase} onClick={handleShowStops}>
            🚌 {showStops ? 'Ocultar Paradas' : 'Mostrar Paradas'}
          </button>
          <div style={{
            ...btnBase, cursor: 'default',
            color: '#00BCD4', borderColor: '#B2EBF2',
            background: '#E0F7FA', fontWeight: 700
          }}>
            {vehicles.length} veículos
          </div>
        </div>

        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      </div>
    </>
  );
}