import structlog
from app.core.gemini_client import call_gemini_async
import os

logger = structlog.get_logger()

MEGA_RESEARCH_PROMPT = """
You are an Integrated Multi-Agent Research System. Your goal is to research the topic: "{topic}" 
and produce a comprehensive, high-quality report.

You must internalize the following roles and execute them in order, producing a single combined output:

1. **Planner Agent**: Break the topic into sub-topics and define a research strategy.
2. **Researcher Agent**: Simulate deep research into each sub-topic (using your internal knowledge).
3. **Summarizer Agent**: Condense the simulated research into key insights.
4. **Writer Agent**: Format everything into a structured, professional Markdown report.
5. **Reviewer Agent**: Perform a final quality check and refinement on the draft.

Your output MUST be structured with the following explicit headers:

# RESEARCH PLAN
(Your planning strategy here)

# KEY INSIGHTS
(The summarized simulated research here)

# FINAL DETAILED REPORT
(The full, structured markdown report here)

# FINAL REVIEW
(The critique and quality confirmation here)
"""

class Orchestrator:
    async def execute(self, topic: str) -> str:
        logger.info("Starting Single-Call Orchestrator", topic=topic)
        
        # Consolidate all steps into one prompt
        prompt = MEGA_RESEARCH_PROMPT.format(topic=topic)
        
        # Single API Call
        final_output = await call_gemini_async(prompt)
        
        # Save output locally for record keeping
        report_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "reports")
        os.makedirs(report_dir, exist_ok=True)
        report_path = os.path.join(report_dir, "output.md")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(final_output)
            
        return final_output