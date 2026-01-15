import { useEffect, useState, useCallback } from 'react';
import { websocketService, NotificationData } from '../services/websocket.service';
import { authService } from '../services/auth.service';

interface UseWebSocketOptions {
  autoDisconnect?: boolean; // If false, don't disconnect on unmount (useful for app-wide connection)
}

export const useWebSocket = (options: UseWebSocketOptions = { autoDisconnect: false }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestNotification, setLatestNotification] = useState<NotificationData | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      console.log('No user found, skipping WebSocket connection');
      return;
    }

    // Connect to WebSocket
    websocketService.connect();

    // Subscribe to notifications
    const unsubscribe = websocketService.onNotification((notification) => {
      setLatestNotification(notification);
    });

    // Check connection status periodically
    const interval = setInterval(() => {
      setIsConnected(websocketService.isConnected());
    }, 1000);

    // Cleanup
    return () => {
      unsubscribe();
      clearInterval(interval);

      // Only disconnect if autoDisconnect is explicitly true
      if (options.autoDisconnect) {
        websocketService.disconnect();
      }
    };
  }, [options.autoDisconnect]);

  const reconnect = useCallback(() => {
    websocketService.disconnect();
    websocketService.connect();
  }, []);

  return {
    isConnected,
    latestNotification,
    reconnect,
  };
};
