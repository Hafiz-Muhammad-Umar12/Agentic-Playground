from backend.core.llm import call_llm

class IdeaAgent:
    """
    Agent responsible for generating and refining startup ideas.
    """
    
    def __init__(self):
        self.system_prompt = (
            "You are an expert Startup Idea Generator. "
            "Your goal is to take a raw concept and expand it into a compelling startup idea "
            "with a clear value proposition, target audience, and unique selling points."
        )

    def process(self, input_text: str) -> dict:
        """
        Refines a raw idea.
        """
        prompt = f"Refine the following startup idea: {input_text}"
        refined_idea = call_llm(prompt, self.system_prompt)
        return {
            "refined_idea": refined_idea,
            "status": "completed"
        }
