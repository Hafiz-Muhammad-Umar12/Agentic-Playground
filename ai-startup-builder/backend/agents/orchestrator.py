import logging
from typing import Dict, Any, Optional

from backend.agents.idea_agent import IdeaAgent
from backend.agents.market_agent import MarketAgent
from backend.agents.validation_agent import ValidationAgent

logger = logging.getLogger(__name__)

class StartupOrchestrator:
    """
    Orchestrates the multi-agent execution pipeline for startup generation.
    
    This class manages the flow of data between specialized AI agents, maintains 
    the execution state, and handles the transition from abstract concepts to 
    validated business architectures.
    """
    
    def __init__(self) -> None:
        """Initializes the orchestrator with specialized agents."""
        self.idea_agent = IdeaAgent()
        self.market_agent = MarketAgent()
        self.validation_agent = ValidationAgent()
        self.state: Dict[str, Any] = {}

    def run_pipeline(self, initial_input: str) -> Dict[str, Any]:
        """
        Executes the full startup generation and validation sequence.
        
        Args:
            initial_input: The raw startup concept or idea from the user.
            
        Returns:
            A dictionary containing the complete state of the pipeline, 
            including refined ideas, market analysis, and validation metrics.
            
        Raises:
            Exception: If any stage of the pipeline fails to execute.
        """
        logger.info("Initializing multi-agent pipeline...")
        
        try:
            # Stage 1: Idea Refinement
            # ------------------------
            logger.info("Stage 1/3: Refining startup concept...")
            idea_result = self.idea_agent.process(initial_input)
            refined_idea = idea_result["refined_idea"]
            self.state["refined_idea"] = refined_idea
            
            # Stage 2: Market Intelligence
            # ---------------------------
            logger.info("Stage 2/3: Conducting market research...")
            market_result = self.market_agent.process(refined_idea)
            market_analysis = market_result["market_analysis"]
            self.state["market_analysis"] = market_analysis
            
            # Stage 3: Strategic Validation
            # ----------------------------
            logger.info("Stage 3/3: Evaluating feasibility and scoring...")
            validation_result = self.validation_agent.process(refined_idea, market_analysis)
            self.state["validation_score"] = validation_result["score"]
            self.state["validation_feedback"] = validation_result["feedback"]
            
            self.state["status"] = "success"
            logger.info("Pipeline execution finalized successfully.")
            
        except Exception as e:
            logger.error(f"Pipeline execution halted due to error: {str(e)}")
            self.state["status"] = "failed"
            self.state["error"] = str(e)
            raise
            
        return self.state
