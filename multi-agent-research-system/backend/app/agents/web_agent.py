from app.tools.search_tool import SearchTool

class WebAgent:
    def __init__(self):
        self.search_tool = SearchTool()
        
    async def fetch(self, query: str) -> str:
        """Fetches data from the web using tools."""
        results = await self.search_tool.search(query)
        return results