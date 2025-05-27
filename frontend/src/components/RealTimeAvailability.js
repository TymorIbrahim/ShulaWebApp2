import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import websocketService from '../services/websocketService';
import { getRealTimeAvailability, createReservation } from '../services/reservationService';
import './RealTimeAvailability.css';

const RealTimeAvailability = ({ product, onReservationCreated, showReserveButton = true }) => {
  const { user, token } = useAuth();
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [reservationLoading, setReservationLoading] = useState(false);

  // WebSocket connection status
  useEffect(() => {
    const handleConnectionStatus = (status) => {
      setIsConnected(status.connected);
    };

    const handleAuthenticated = (data) => {
      console.log('WebSocket authenticated in component:', data);
      setIsConnected(true); // Set connected to true when authenticated
    };

    const handleAuthError = (error) => {
      console.error('WebSocket auth error in component:', error);
      setIsConnected(false);
    };

    websocketService.on('connection-status', handleConnectionStatus);
    websocketService.on('authenticated', handleAuthenticated);
    websocketService.on('auth-error', handleAuthError);

    // Initialize WebSocket if not connected and we have a token
    if (!websocketService.isConnected() && token) {
      websocketService.initialize(token);
    }

    // Check current connection status immediately
    if (websocketService.isConnected()) {
      setIsConnected(true);
    }

    return () => {
      websocketService.off('connection-status', handleConnectionStatus);
      websocketService.off('authenticated', handleAuthenticated);
      websocketService.off('auth-error', handleAuthError);
    };
  }, [token]);

  // Handle product availability updates
  const handleAvailabilityUpdate = useCallback((data) => {
    if (data.productId === product._id) {
      setAvailability(data.availability);
      setLastUpdated(new Date());
    }
  }, [product._id]);

  // Handle general inventory updates
  const handleInventoryUpdate = useCallback((data) => {
    if (data.productId === product._id) {
      setAvailability(data.availability);
      setLastUpdated(new Date());
    }
  }, [product._id]);

  // Setup WebSocket event listeners
  useEffect(() => {
    websocketService.on('product-availability-update', handleAvailabilityUpdate);
    websocketService.on('inventory-update', handleInventoryUpdate);

    return () => {
      websocketService.off('product-availability-update', handleAvailabilityUpdate);
      websocketService.off('inventory-update', handleInventoryUpdate);
    };
  }, [handleAvailabilityUpdate, handleInventoryUpdate]);

  // Watch product for real-time updates
  useEffect(() => {
    if (isConnected && product._id) {
      websocketService.watchProduct(product._id);
      
      return () => {
        websocketService.unwatchProduct(product._id);
      };
    }
  }, [isConnected, product._id]);

  // Fetch initial availability
  const fetchAvailability = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getRealTimeAvailability(product._id, token);
      setAvailability(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability data');
      
      // Fallback to product inventory data
      if (product.inventory) {
        setAvailability({
          totalUnits: product.inventory.totalUnits,
          currentlyRented: 0,
          currentlyReserved: 0,
          availableNow: product.inventory.totalUnits,
          isAvailable: product.inventory.totalUnits > 0,
          lastUpdated: new Date()
        });
      }
    } finally {
      setLoading(false);
    }
  }, [product._id, product.inventory, token]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Handle reservation creation
  const handleCreateReservation = async () => {
    if (!user) {
      alert('Please log in to make a reservation');
      return;
    }

    try {
      setReservationLoading(true);
      
      // Get rental dates from user (you might want to implement a date picker)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1); // Tomorrow
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3); // 3 days from now

      const reservationData = {
        productId: product._id,
        quantity: 1,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        expirationMinutes: 15
      };

      const result = await createReservation(reservationData, token);
      
      if (onReservationCreated) {
        onReservationCreated(result.reservation);
      }
      
      alert(`Reservation created successfully! Expires in ${Math.ceil(result.expiresIn / 60)} minutes.`);
      
    } catch (err) {
      console.error('Error creating reservation:', err);
      alert(err.message || 'Failed to create reservation');
    } finally {
      setReservationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="realtime-availability loading">
        <div className="loading-spinner">
          <svg className="loading-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
          </svg>
        </div>
        <p>Loading real-time availability...</p>
      </div>
    );
  }

  if (error && !availability) {
    return (
      <div className="realtime-availability error">
        <div className="error-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
        </div>
        <p>{error}</p>
        <button onClick={fetchAvailability} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  const isAvailable = availability?.isAvailable && availability?.availableNow > 0;
  const statusColor = isAvailable ? 'available' : 'unavailable';

  return (
    <div className="realtime-availability">
      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <div className="status-indicator">
          <svg className="connection-icon" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="6" cy="6" r="6"/>
          </svg>
        </div>
        <span>{isConnected ? 'Live Updates' : 'Offline'}</span>
        {lastUpdated && (
          <span className="last-updated">
            Updated {formatTimeAgo(lastUpdated)}
          </span>
        )}
      </div>

      {/* Main Availability Status */}
      <div className={`availability-status ${statusColor}`}>
        <div className="status-icon">
          {isAvailable ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          )}
        </div>
        <div className="status-content">
          <h3>
            {isAvailable ? 'זמין כעת' : 'לא זמין כרגע'}
          </h3>
          <p className="availability-details">
            {availability?.availableNow || 0} מתוך {availability?.totalUnits || 0} יחידות זמינות
          </p>
          {availability?.currentlyRented > 0 && (
            <p className="rental-info">
              {availability.currentlyRented} יחידות מושכרות כרגע
            </p>
          )}
          {availability?.currentlyReserved > 0 && (
            <p className="reservation-info">
              {availability.currentlyReserved} יחידות שמורות זמנית
            </p>
          )}
        </div>
      </div>

      {/* Real-time Updates Indicator */}
      {isConnected && (
        <div className="realtime-indicator">
          <div className="pulse-animation"></div>
          <span>מעודכן בזמן אמת</span>
        </div>
      )}

      {/* Reservation Actions */}
      {showReserveButton && isAvailable && user && (
        <div className="reservation-actions">
          <button 
            onClick={handleCreateReservation}
            disabled={reservationLoading}
            className="reserve-button"
          >
            {reservationLoading ? (
              <>
                <svg className="loading-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
                יוצר הזמנה...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                הזמן זמנית (15 דק)
              </>
            )}
          </button>
          <p className="reservation-note">
            הזמנה זמנית שומרת את הפריט למשך 15 דקות
          </p>
        </div>
      )}

      {/* Availability Chart */}
      {availability && (
        <div className="availability-chart">
          <div className="chart-header">
            <h4>פילוח זמינות</h4>
          </div>
          <div className="chart-bars">
            <div className="chart-bar">
              <div className="bar-label">זמין</div>
              <div className="bar-container">
                <div 
                  className="bar-fill available"
                  style={{ 
                    width: `${(availability.availableNow / availability.totalUnits) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="bar-value">{availability.availableNow}</div>
            </div>
            
            {availability.currentlyRented > 0 && (
              <div className="chart-bar">
                <div className="bar-label">מושכר</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill rented"
                    style={{ 
                      width: `${(availability.currentlyRented / availability.totalUnits) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="bar-value">{availability.currentlyRented}</div>
              </div>
            )}
            
            {availability.currentlyReserved > 0 && (
              <div className="chart-bar">
                <div className="bar-label">שמור</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill reserved"
                    style={{ 
                      width: `${(availability.currentlyReserved / availability.totalUnits) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="bar-value">{availability.currentlyReserved}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format time ago
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  if (diffSecs < 60) {
    return `${diffSecs}s ago`;
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else {
    return date.toLocaleTimeString();
  }
};

export default RealTimeAvailability; 