import { useAuthStore } from '@/stores/authStore';

type EventCallback = (data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnecting = false;

  constructor(url: string) {
    this.url = url;
  }

  public connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    
    this.isConnecting = true;
    const token = useAuthStore.getState().token;
    
    // Add token to URL if we have one
    const wsUrl = token ? `${this.url}?token=${token}` : this.url;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && this.listeners.has(data.type)) {
          this.listeners.get(data.type)?.forEach(callback => callback(data.payload));
        }
      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      this.isConnecting = false;
      console.error('WebSocket error:', error);
      // The onclose event will fire and handle reconnection
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error('WebSocket max reconnect attempts reached');
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  public on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }
}

// Determine WS URL based on current host (assume wss:// if https)
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsHost = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}/ws/`;

export const wsClient = new WebSocketClient(wsHost);