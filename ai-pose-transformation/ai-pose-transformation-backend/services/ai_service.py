import numpy as np

# 🕺 Target Poses Library (Landmarks Reference)
# In a real app, these would be loaded from a database or JSON files
TARGET_POSES = {
    "casual_lean": {
        "name": "Casual Lean",
        "landmarks": [
            {"idx": 11, "x": 0.4, "y": 0.3}, # Left Shoulder
            {"idx": 12, "x": 0.6, "y": 0.3}, # Right Shoulder
            {"idx": 23, "x": 0.45, "y": 0.6}, # Left Hip
            {"idx": 24, "x": 0.55, "y": 0.6}, # Right Hip
        ],
        "guidance": "Lean slightly to the left and put your hand in your pocket."
    },
    "fitness_warrior": {
        "name": "Warrior Pose",
        "landmarks": [
            {"idx": 11, "x": 0.3, "y": 0.3},
            {"idx": 12, "x": 0.7, "y": 0.3},
            {"idx": 13, "x": 0.2, "y": 0.3}, # Left Elbow extended
            {"idx": 14, "x": 0.8, "y": 0.3}, # Right Elbow extended
        ],
        "guidance": "Extend your arms fully and keep your back straight."
    }
}

class AIService:

    def get_guidance(self, current_landmarks, target_pose_name):
        target = TARGET_POSES.get(target_pose_name)
        if not target or not current_landmarks:
            return {"score": 0, "feedback": "Align yourself to the frame", "adjustments": []}

        score = 0
        adjustments = []
        
        # Simple Euclidean distance based comparison for key landmarks
        total_dist = 0
        count = 0
        
        for t_lm in target["landmarks"]:
            idx = t_lm["idx"]
            if idx < len(current_landmarks):
                curr = current_landmarks[idx]
                dist_x = t_lm["x"] - curr.get('x', 0)
                dist_y = t_lm["y"] - curr.get('y', 0)
                
                dist = np.sqrt(dist_x**2 + dist_y**2)
                total_dist += dist
                count += 1
                
                if dist > 0.1:
                    direction = ""
                    if dist_y > 0.05: direction += "Lower "
                    elif dist_y < -0.05: direction += "Raise "
                    
                    if dist_x > 0.05: direction += "Move right "
                    elif dist_x < -0.05: direction += "Move left "
                    
                    adjustments.append(f"{direction} your {self._get_joint_name(idx)}")

        avg_dist = total_dist / count if count > 0 else 1
        score = max(0, 100 - (avg_dist * 500)) # Scale distance to a 0-100 score

        return {
            "score": round(score, 1),
            "feedback": target["guidance"] if score < 90 else "Perfect! Hold that pose.",
            "adjustments": adjustments[:2], # Return top 2 adjustments
            "target_landmarks": target["landmarks"]
        }

    def suggest_next_pose(self, style_mode):
        # Scene-aware logic would go here (analyzing light/background)
        # For now, we filter by style mode
        if style_mode == "fitness":
            return "fitness_warrior"
        return "casual_lean"

    def _get_joint_name(self, idx):
        names = {11: "left shoulder", 12: "right shoulder", 13: "left elbow", 14: "right elbow", 23: "left hip", 24: "right hip"}
        return names.get(idx, "joint")

ai_service = AIService()
