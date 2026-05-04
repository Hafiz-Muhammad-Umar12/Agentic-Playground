import mediapipe as mp
import cv2

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

class PoseEngine:

    def detect_pose(self, frame):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = pose.process(rgb)

        return result.pose_landmarks

    def analyze_pose(self, landmarks):
        if not landmarks:
            return {"status": "no_pose", "score": 0}

        # simple scoring logic
        score = 80

        return {
            "status": "ok",
            "score": score
        }


pose_engine = PoseEngine()