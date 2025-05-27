import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.authToken = null;
    this.reconnectTimeout = null;
    this.authenticated = false;
    this.userId = null;
  }

  initialize(authToken = null) {
    if (this.socket && this.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.authToken = authToken;
    
    // Get base URL for WebSocket connection
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5002';
    
    this.socket = io(baseURL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.reconnectAttempts = 0;
      
      // Authenticate if token is available
      if (this.authToken) {
        this.authenticate(this.authToken);
      }
      
      // Trigger connection event
      this.emit('connection-status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected');
      this.connected = false;
      this.emit('connection-status', { connected: false, reason });
      
      // Attempt to reconnect only if socket still exists and we haven't exceeded max attempts
      if (this.socket && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectTimeout = setTimeout(() => {
          // Double-check socket still exists before attempting reconnection
          if (this.socket && !this.socket.connected) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.socket.connect();
          }
        }, 2000);
      }
    });

    this.socket.on('authenticated', (data) => {
      console.log('WebSocket authenticated');
      this.emit('authenticated', data);
    });

    this.socket.on('auth-error', (error) => {
      console.error('WebSocket authentication error');
      this.authenticated = false;
      this.userId = null;
      this.emit('auth-error', error);
    });

    // Inventory update events
    this.socket.on('inventory-update', (data) => {
      console.log('Inventory update received');
      this.emit('inventory-update', data);
    });

    // Product availability updates
    this.socket.on('availability-update', (data) => {
      console.log('Product availability update received');
      this.emit('availability-update', data);
    });

    // Reservation events
    this.socket.on('reservation-status', (data) => {
      console.log('Reservation status update:', data);
      this.emit('reservation-status', data);
    });

    this.socket.on('reservation-expiring', (data) => {
      console.log('Reservation expiring:', data);
      this.emit('reservation-expiring', data);
    });

    this.socket.on('reservation-error', (error) => {
      console.error('Reservation error:', error);
      this.emit('reservation-error', error);
    });

    // Order events
    this.socket.on('order-update', (data) => {
      console.log('Order update received:', data);
      this.emit('order-update', data);
    });

    // Admin events
    this.socket.on('low-stock-alert', (data) => {
      console.log('Low stock alert:', data);
      this.emit('low-stock-alert', data);
    });

    this.socket.on('reservations-cleaned', (data) => {
      console.log('🧹 Reservations cleaned:', data);
      this.emit('reservations-cleaned', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  authenticate(token) {
    if (!this.socket || !this.connected) {
      console.warn('Cannot authenticate: WebSocket not connected');
      return;
    }

    this.authToken = token;
    this.socket.emit('authenticate', { token });
  }

  // Watch product for real-time availability updates
  watchProduct(productId) {
    if (this.authenticated && this.socket) {
      this.socket.emit('watch-product', productId);
      console.log('Started watching product');
    }
  }

  // Stop watching product
  unwatchProduct(productId) {
    if (this.authenticated && this.socket) {
      this.socket.emit('unwatch-product', productId);
      console.log('Stopped watching product');
    }
  }

  // Send reservation heartbeat
  sendReservationHeartbeat(reservationId) {
    if (!this.socket || !this.connected) {
      console.warn('Cannot send heartbeat: WebSocket not connected');
      return;
    }

    this.socket.emit('reservation-heartbeat', { reservationId });
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  getConnectionStatus() {
    return {
      connected: this.connected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket service');
    this.connected = false;
    this.reconnectAttempts = 0;
    
    // Clear any pending reconnection timeouts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      // Remove all listeners before disconnecting
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear authentication data
    this.authenticated = false;
    this.userId = null;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService; 