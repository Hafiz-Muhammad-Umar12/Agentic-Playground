"""
Executor — tool execution layer.
Dispatches tool calls from the Runner to the correct integration.
"""
from __future__ import annotations

import json
import httpx
import asyncio
from typing import Any


class ToolExecutor:
    """Dispatch tool calls to real implementations."""

    _registry: dict = {}

    def __init__(self):
        self._register_defaults()

    def _register_defaults(self):
        self._registry = {
            "web_search":    self._web_search,
            "code_exec":     self._code_exec,
            "file_read":     self._file_read,
            "http_request":  self._http_request,
            "calculator":    self._calculator,
        }

    async def execute(self, tool_name: str, args: dict) -> Any:
        handler = self._registry.get(tool_name)
        if not handler:
            return f"[ToolExecutor] Unknown tool: {tool_name}"
        try:
            return await handler(**args)
        except Exception as exc:
            return f"[ToolExecutor] Error running {tool_name}: {exc}"

    # ------------------------------------------------------------------ tools

    async def _web_search(self, query: str, num_results: int = 5) -> str:
        """Stub — replace with SerpAPI / Tavily / Brave Search."""
        return json.dumps({
            "query": query,
            "results": [
                {"title": f"Result {i+1} for '{query}'", "snippet": "..."}
                for i in range(num_results)
            ],
        })

    async def _code_exec(self, code: str, language: str = "python") -> str:
        """Stub — in production, runs code in an isolated sandbox container."""
        return f"[code_exec] Executed {language} snippet ({len(code)} chars). Output: <sandbox_result>"

    async def _file_read(self, path: str) -> str:
        try:
            with open(path) as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {e}"

    async def _http_request(
        self,
        url: str,
        method: str = "GET",
        headers: dict | None = None,
        body: dict | None = None,
    ) -> str:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.request(
                method, url, headers=headers or {}, json=body
            )
            return resp.text[:4000]

    async def _calculator(self, expression: str) -> str:
        try:
            result = eval(expression, {"__builtins__": {}})  # noqa: S307
            return str(result)
        except Exception as e:
            return f"Error: {e}"

    def register_tool(self, name: str, handler):
        """Allow external code to register custom tools."""
        self._registry[name] = handler