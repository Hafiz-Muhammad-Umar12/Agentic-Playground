const WS_BASE = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

export class LocationSocket {
  constructor(deviceId, onMessage, onOpen, onClose) {
    this.deviceId  = deviceId;
    this.onMessage = onMessage;
    this.onOpen    = onOpen;
    this.onClose   = onClose;
    this.ws        = null;
    this.pingInterval = null;
  }

  connect() {
    this.ws = new WebSocket(`${WS_BASE}/ws/location/${this.deviceId}`);

    this.ws.onopen = () => {
      console.log(`[WS] Connected to device: ${this.deviceId}`);
      this.onOpen?.();
      // Keep alive ping every 25s
      this.pingInterval = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) this.ws.send('ping');
      }, 25000);
    };

    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this.onMessage?.(data);
      } catch (_) {}
    };

    this.ws.onclose = () => {
      console.log(`[WS] Disconnected: ${this.deviceId}`);
      clearInterval(this.pingInterval);
      this.onClose?.();
    };

    this.ws.onerror = (e) => console.error('[WS] Error:', e);
  }

  disconnect() {
    clearInterval(this.pingInterval);
    this.ws?.close();
  }
}
