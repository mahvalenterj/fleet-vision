import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Hook para gerenciar conexão com o backend via Socket.io
 * 
 * Comportamento:
 * - Em localhost: usa proxy do Vite (/socket.io)
 * - Em produção: usa VITE_BACKEND_URL configurada em .env
 */
export function useSocket() {
  const [vehicles, setVehicles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';

    // Em localhost, usa o proxy do Vite. Em produção, usa URL configurada.
    const socketUrl = isLocalhost || !backendUrl ? undefined : backendUrl;

    console.log('🔌 Conectando ao Socket.io...', {
      backend: socketUrl || 'proxy do Vite',
      isLocalhost,
      hasBackendUrl: !!backendUrl
    });

    const socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket conectado com sucesso');
      setIsConnected(true);
    });

    socket.on('vehicle:init', (data) => {
      console.log('📍 Veículos inicializados:', data.length);
      setVehicles(data);
    });

    socket.on('vehicle:update', (data) => {
      setVehicles(data);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro ao conectar:', error.message || error);
      setIsConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.warn('⚠️ Socket desconectado:', reason);
      setIsConnected(false);
    });

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socket.disconnect();
    };
  }, []);

  return { vehicles, isConnected };
}
