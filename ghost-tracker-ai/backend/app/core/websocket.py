from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections per device_id."""

    def __init__(self):
        # device_id -> list of connected websockets
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, device_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(device_id, []).append(ws)
        print(f"[WS] Connected: device={device_id}, total_connections={len(self.active[device_id])}")

    def disconnect(self, device_id: str, ws: WebSocket):
        if device_id in self.active:
            self.active[device_id].remove(ws)
            if not self.active[device_id]:
                del self.active[device_id]
        print(f"[WS] Disconnected: device={device_id}")

    async def broadcast_to_device(self, device_id: str, data: dict):
        """Send location update to all dashboards watching this device."""
        connections = self.active.get(device_id, [])
        dead = []
        for ws in connections:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(device_id, ws)


manager = ConnectionManager()


@router.websocket("/ws/location/{device_id}")
async def websocket_location(websocket: WebSocket, device_id: str):
    """
    Dashboard connects here to receive real-time location updates.
    Each message pushed from the backend when mobile app sends new location.
    """
    await manager.connect(device_id, websocket)
    try:
        while True:
            # Keep connection alive; actual data is pushed via broadcast_to_device
            data = await websocket.receive_text()
            # Optionally handle ping/pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(device_id, websocket)
