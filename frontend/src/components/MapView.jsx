import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const INITIAL_CENTER = [-46.633308, -23.55052];
const INITIAL_ZOOM = 11;

export function MapView({ vehicles }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const activeIds = new Set();

    vehicles.forEach((vehicle) => {
      activeIds.add(vehicle.id);
      const coordinate = [vehicle.position.lng, vehicle.position.lat];
      const existingMarker = markersRef.current.get(vehicle.id);

      if (existingMarker) {
        existingMarker.setLngLat(coordinate);
        return;
      }

      const markerElement = document.createElement('div');
      markerElement.style.width = '16px';
      markerElement.style.height = '16px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = '#2563eb';
      markerElement.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.2)';
      markerElement.title = `${vehicle.code} · ${Math.round(vehicle.speed)} km/h`;

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat(coordinate)
        .setPopup(
          new mapboxgl.Popup({ offset: 18 }).setHTML(
            `<strong>${vehicle.code}</strong><br>${Math.round(vehicle.speed)} km/h`
          )
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

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {!MAPBOX_TOKEN && (
        <div style={{ padding: 20, color: '#8b5cf6' }}>
          Mapbox token não configurado.
        </div>
      )}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
