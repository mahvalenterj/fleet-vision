import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const INITIAL_CENTER = [-46.633308, -23.55052];
const INITIAL_ZOOM = 11;

export function MapView({ vehicles }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const vehicleMarkersRef = useRef(new Map());
  const stopMarkersRef = useRef(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showStops, setShowStops] = useState(false);
  const [stops, setStops] = useState([]);

  // Inicializa mapa
  useEffect(() => {
    if (!MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    mapRef.current = map;
    map.once('load', () => setMapLoaded(true));

    return () => map.remove();
  }, []);

  // Atualiza marcadores de veículos
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const activeIds = new Set();

    vehicles.forEach((vehicle) => {
      activeIds.add(vehicle.id);
      const coordinate = [vehicle.position.lng, vehicle.position.lat];
      const existingMarker = vehicleMarkersRef.current.get(vehicle.id);

      if (existingMarker) {
        existingMarker.setLngLat(coordinate);
        return;
      }

      const markerElement = document.createElement('div');
      markerElement.style.width = '20px';
      markerElement.style.height = '20px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = '#2563eb';
      markerElement.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.2)';
      markerElement.style.cursor = 'pointer';
      markerElement.title = `${vehicle.code} · ${Math.round(vehicle.speed || 0)} km/h`;

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat(coordinate)
        .setPopup(
          new mapboxgl.Popup({ offset: 18 }).setHTML(
            `<strong>${vehicle.code}</strong><br/>
             Prefixo: ${vehicle.prefix || 'N/A'}<br/>
             ${vehicle.lineName || ''}<br/>
             ${vehicle.accessible ? '♿ Acessível' : 'Não acessível'}`
          )
        )
        .addTo(map);

      vehicleMarkersRef.current.set(vehicle.id, marker);
    });

    // Remove marcadores antigos
    vehicleMarkersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        vehicleMarkersRef.current.delete(id);
      }
    });
  }, [vehicles, mapLoaded]);

  // Busca e mostra paradas
  const handleShowStops = async () => {
    if (showStops) {
      // Remove marcadores de paradas
      stopMarkersRef.current.forEach(marker => marker.remove());
      stopMarkersRef.current.clear();
      setShowStops(false);
      setStops([]);
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/stops/search?q=Terminal`);
      const stopsData = await response.json();
      setStops(stopsData);
      setShowStops(true);

      // Adiciona marcadores de paradas
      stopsData.forEach(stop => {
        const markerElement = document.createElement('div');
        markerElement.style.width = '16px';
        markerElement.style.height = '16px';
        markerElement.style.borderRadius = '3px';
        markerElement.style.backgroundColor = '#f59e0b';
        markerElement.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.2)';
        markerElement.style.cursor = 'pointer';

        const marker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat([stop.position.lng, stop.position.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 12 }).setHTML(
              `<strong>🚌 ${stop.name}</strong><br/>${stop.address || ''}`
            )
          )
          .addTo(mapRef.current);

        stopMarkersRef.current.set(stop.id, marker);
      });

      console.log(`📍 ${stopsData.length} paradas carregadas`);
    } catch (error) {
      console.error('Erro ao carregar paradas:', error);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {!MAPBOX_TOKEN && (
        <div style={{ padding: 20, color: '#8b5cf6' }}>
          Mapbox token não configurado.
        </div>
      )}

      <button
        onClick={handleShowStops}
        style={{
          position: 'absolute',
          top: 70,
          right: 10,
          zIndex: 10,
          padding: '10px 16px',
          backgroundColor: showStops ? '#ef4444' : '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px'
        }}
      >
        {showStops ? '❌ Ocultar Paradas' : '🚌 Mostrar Paradas'}
      </button>

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
