import { useAuthStore } from '@/stores/authStore';

type MessageHandler = (data: any) => void;

export class ProjectWebSocketClient {
  private ws: WebSocket | null = null;
  private projectId: number;
  private onMessageCallback: MessageHandler;
  private onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting') => void;
  private reconnectTimeout: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isExplicitlyClosed = false;

  constructor(
    projectId: number,
    onMessage: MessageHandler,
    onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting') => void
  ) {
    this.projectId = projectId;
    this.onMessageCallback = onMessage;
    this.onStatusChange = onStatusChange;
  }

  public connect() {
    this.isExplicitlyClosed = false;
    const token = useAuthStore.getState().token;
    if (!token) {
      console.warn('Cannot connect to WebSocket without auth token');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.onStatusChange?.('connecting');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/projects/${this.projectId}/chat/?token=${encodeURIComponent(token)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`WebSocket connected for project ${this.projectId}`);
        this.reconnectAttempts = 0;
        this.onStatusChange?.('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Backend sends { type: 'chat_message', id, sender_id, sender_name, message, created_at }
          if (data.type === 'chat_message') {
            this.onMessageCallback({
              id: data.id,
              conversation: Number(this.projectId),
              sender_id: data.sender_id,
              sender_name: data.sender_name,
              content: data.message,
              created_at: data.created_at,
            });
          } else {
            this.onMessageCallback(data);
          }
        } catch (err) {
          console.error('WebSocket parse error:', err);
        }
      };

      this.ws.onclose = () => {
        this.onStatusChange?.('disconnected');
        if (!this.isExplicitlyClosed) {
          this.handleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.error(`WebSocket error for project ${this.projectId}:`, err);
      };
    } catch (err) {
      console.error('Failed to instantiate WebSocket:', err);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.isExplicitlyClosed) return;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    }
  }

  public sendMessage(text: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      // Backend expects { "message": "text" }
      this.ws.send(JSON.stringify({ message: text.trim() }));
    } else {
      console.error('Cannot send message: WebSocket is not open');
    }
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onStatusChange?.('disconnected');
  }
}

// Factory function
export function createProjectWebSocket(
  projectId: number,
  onMessage: MessageHandler,
  onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting') => void
) {
  const client = new ProjectWebSocketClient(projectId, onMessage, onStatusChange);
  client.connect();
  return client;
}