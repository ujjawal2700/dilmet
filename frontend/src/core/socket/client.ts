/**
 * Socket.IO Client Configuration
 * @owner: Harsh (Chat Domain)
 * @purpose: Initialize Socket.IO client for real-time chat
 */

import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../utils/auth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

/**
 * Initialize Socket.IO connection
 */
export const initializeSocket = (): Socket => {
  if (socket?.connected) {
    return socket;
  }

  const token = getAuthToken();

  socket = io(SOCKET_URL, {
    auth: {
      token: token || '',
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO connection error:', error);
  });

  return socket;
};

/**
 * Get Socket.IO instance
 */
export const getSocket = (): Socket | null => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

/**
 * Disconnect Socket.IO
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { initializeSocket, getSocket, disconnectSocket };

