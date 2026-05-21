import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || '';
const envBackendUrl = rawBackendUrl.replace(/\/+$/, '');
const useDirectBackendUrl = typeof window !== 'undefined'
  && envBackendUrl
  && !window.location.hostname.includes('localhost')
  && !window.location.hostname.includes('127.0.0.1');

export function useSocket() {
  const [vehicles, setVehicles] = useState([]);
  const socketRef = useRef(null);

 useEffect(() => {
    const socket = useDirectBackendUrl
      ? io(envBackendUrl, { path: '/socket.io', transports: ['websocket', 'polling'] })
      : io({ path: '/socket.io', transports: ['websocket', 'polling'] });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected to', useDirectBackendUrl ? envBackendUrl : window.location.origin);
    });

    socket.on('vehicle:init', setVehicles);
    socket.on('vehicle:update', setVehicles);
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
 

  return { vehicles };
}
