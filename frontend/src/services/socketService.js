import { io } from 'socket.io-client';
import { getApiUrl } from '../config/api';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      // Connect to the base URL (which should be the same as getApiUrl base)
      const baseUrl = getApiUrl('').replace(/\/$/, ''); // remove trailing slash
      this.socket = io(baseUrl, {
        transports: ['websocket', 'polling'], // fallback to polling
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emitLocationUpdate(employeeId, latitude, longitude) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('locationUpdate', {
        employeeId,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });
    }
  }

  onLocationUpdated(callback) {
    if (this.socket) {
      this.socket.on('locationUpdated', callback);
    }
  }

  offLocationUpdated() {
    if (this.socket) {
      this.socket.off('locationUpdated');
    }
  }
}

const socketService = new SocketService();
export default socketService;
