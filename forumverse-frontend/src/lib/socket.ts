import {io} from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001', {
  withCredentials: true,
  transports: ['websocket'],
});

export default socket;