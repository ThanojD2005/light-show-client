import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

// Define the initial show state
const initialShowState = {
  isActive: false, // Is the show currently running?
  color: '#000000', // Current background color
  effect: 'none',   // 'none', 'strobe', 'pulse'
  id: 1,          // Used to force re-renders/trigger effects on the same color
};

const ShowContext = createContext(null);

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// Provider Component
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
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
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

// Hook
export function useShow() {
  const context = useContext(ShowContext);
  if (!context) {
    throw new Error('useShow must be used within a ShowProvider');
  }
  return context;
}
