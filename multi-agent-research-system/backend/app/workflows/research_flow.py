from app.agents.orchestrator import Orchestrator

async def run_research_workflow(topic: str) -> str:
    """Main workflow entrypoint for the research generation."""
    orchestrator = Orchestrator()
    final_report = await orchestrator.execute(topic)
    return final_report