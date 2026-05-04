from fastapi import APIRouter, WebSocket
from services.ai_service import ai_service
import json

router = APIRouter()

@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket):
    await websocket.accept()
    
    # Track the active target pose for the session
    active_target_pose = "casual_lean"

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            # Extract landmarks and metadata
            landmarks = payload.get("landmarks", [])
            style_mode = payload.get("style_mode", "casual")
            
            # Update target pose if style changes
            active_target_pose = ai_service.suggest_next_pose(style_mode)

            # Get real-time guidance
            guidance = ai_service.get_guidance(landmarks, active_target_pose)

            # Send back comprehensive feedback
            await websocket.send_json({
                "posture_score": guidance["score"],
                "feedback": guidance["feedback"],
                "suggestions": [{"direction": adj, "confidence": 0.9, "body_part": "various"} for adj in guidance["adjustments"]],
                "detected_pose": active_target_pose,
                "target_landmarks": guidance["target_landmarks"],
                "status": "ok"
            })

    except Exception as e:
        print(f"WebSocket Error: {e}")
        await websocket.close()
