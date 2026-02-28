import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const initialShowState = {
  isActive: false,
  color: '#000000',
  effect: 'none',
  id: 1,
};

export const ShowContext = createContext(null);

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function ShowProvider({ children, isAdmin = false }) {
  const [showState, setShowState] = useState(initialShowState);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to show server');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('❌ Socket Connection Error:', err.message);
    });

    socketRef.current.on('SHOW_STATE_UPDATE', (updatedState) => {
      setShowState(updatedState);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const triggerStateUpdate = useCallback((newStateUpdates) => {
    if (!isAdmin || !socketRef.current) return;

    setShowState((prev) => {
      const updated = {
        ...prev,
        ...newStateUpdates,
        id: Date.now()
      };

      socketRef.current.emit('ADMIN_UPDATE', updated);
      return updated;
    });
  }, [isAdmin]);

  return (
    <ShowContext.Provider value={{ showState, triggerStateUpdate, isAdmin }}>
      {children}
    </ShowContext.Provider>
  );
}
