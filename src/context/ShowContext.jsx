import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

// Define the initial show state
const initialShowState = {
  isActive: false, // Is the show currently running?
  color: '#000000', // Current background color
  effect: 'none',   // 'none', 'strobe', 'pulse'
  id: 0,          // Used to force re-renders/trigger effects on the same color
};

const ShowContext = createContext(null);

// In production, this will point to your deployed backend (e.g., on Render or Railway)
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const ShowProvider = ({ children, isAdmin = false }) => {
  const [showState, setShowState] = useState(initialShowState);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.io connection
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to show server');
    });

    // Listen for show state updates from the server
    socketRef.current.on('SHOW_STATE_UPDATE', (updatedState) => {
      setShowState(updatedState);
    });

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Method for the Admin to blast new states
  const triggerStateUpdate = useCallback((newStateUpdates) => {
    if (!isAdmin) return;

    setShowState((prevState) => {
      const updatedState = {
        ...prevState,
        ...newStateUpdates,
        id: Date.now() // Always bump ID to ensure audience reacts even to identical payload
      };

      // Send to server
      if (socketRef.current) {
        socketRef.current.emit('ADMIN_UPDATE', updatedState);
      }

      return updatedState;
    });
  }, [isAdmin]);

  return (
    <ShowContext.Provider value={{ showState, triggerStateUpdate, isAdmin }}>
      {children}
    </ShowContext.Provider>
  );
};

export const useShow = () => {
  const context = useContext(ShowContext);
  if (!context) {
    throw new Error('useShow must be used within a ShowProvider');
  }
  return context;
};
