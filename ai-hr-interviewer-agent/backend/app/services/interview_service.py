import logging
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.agents.interviewer import InterviewerAgent
from app.agents.evaluator import EvaluatorAgent
from app.agents.followup import FollowUpInterviewAgent

logger = logging.getLogger(__name__)

class InterviewService:
    def __init__(self, llm_provider: Any = None, score_threshold: int = 20):
        self.interviewer_agent = InterviewerAgent(llm_provider=llm_provider)
        self.evaluator_agent = EvaluatorAgent(llm_provider=llm_provider)
        self.followup_agent = FollowUpInterviewAgent(llm_provider=llm_provider)
        self.score_threshold = score_threshold
        # In-memory session store
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def start_interview(self, topic: str) -> Dict[str, Any]:
        """
        Initializes interview session and returns initial questions.
        """
        session_id = str(uuid.uuid4())
        try:
            questions_data = self.interviewer_agent.generate_questions(topic)
            questions = questions_data.get("questions", [])
            
            # Initialize session state
            self.sessions[session_id] = {
                "topic": topic,
                "history": [],
                "total_score": 0,
                "created_at": datetime.now(),
                "status": "active"
            }
            
            logger.info(f"Session {session_id} started for topic: {topic}")
            
            return {
                "session_id": session_id,
                "topic": topic,
                "questions": questions,
                "status": "initialized",
                "success": True
            }
        except Exception as e:
            logger.error(f"Error starting interview: {e}")
            return {"success": False, "message": str(e), "questions": []}

    def process_answer(self, session_id: str, question: str, answer: str, topic: str) -> Dict[str, Any]:
        """
        Evaluates answer, generates follow-ups, and determines next action.
        """
        if session_id not in self.sessions:
            logger.warning(f"Invalid session access attempted: {session_id}")
            return {"success": False, "message": "Invalid session ID", "next_action": "end"}

        try:
            # 1. Evaluate
            evaluation = self.evaluator_agent.evaluate_answer(question, answer, topic)
            score_data = evaluation.get("score", {})
            total_score = score_data.get("total", 0)
            
            # 2. Update session state
            self.sessions[session_id]["history"].append({
                "question": question,
                "answer": answer,
                "evaluation": evaluation
            })
            self.sessions[session_id]["total_score"] += total_score
            
            logger.info(f"Session {session_id} score updated: +{total_score}")

            # 3. Generate Follow-ups
            followup_data = self.followup_agent.generate_followups(question, answer, topic)
            followups = followup_data.get("followups", [])
            
            # 4. Determine next action
            next_action = "continue"
            next_question = ""
            
            # Logic: End if score is too low or no followups generated
            if total_score < self.score_threshold:
                next_action = "end"
                self.sessions[session_id]["status"] = "failed"
            elif followups:
                next_question = followups[0].get("question", "")
            else:
                next_action = "end"
                self.sessions[session_id]["status"] = "completed"

            return {
                "success": True,
                "evaluation": {
                    "score": score_data,
                    "feedback": evaluation.get("feedback", {})
                },
                "followups": [f.get("question") for f in followups],
                "next_question": next_question,
                "next_action": next_action
            }
        except Exception as e:
            logger.error(f"Error processing answer in session {session_id}: {e}")
            return {
                "success": False,
                "message": "Internal processing error",
                "evaluation": {"score": {}, "feedback": {}},
                "followups": [],
                "next_question": "",
                "next_action": "end"
            }
