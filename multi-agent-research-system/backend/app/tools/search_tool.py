class SearchTool:
    """Mock implementation of a search tool."""
    async def search(self, query: str) -> str:
        # In production, integrate with Serper or DuckDuckGo API
        return f"Simulated search results for: {query}"