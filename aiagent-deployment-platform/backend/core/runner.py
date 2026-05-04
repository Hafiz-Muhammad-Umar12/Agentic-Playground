"""
AgentRunner — the AI agent brain.
Executes a step loop: plan → LLM call → tool dispatch → accumulate context → return output.
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any

from openai import AsyncOpenAI
from core.executor import ToolExecutor
from memory.vector import VectorMemory


@dataclass
class AgentStep:
    name: str
    system_prompt: str
    tools: list[dict] = field(default_factory=list)


@dataclass
class StepOutput:
    text: str | None = None
    requires_tool: bool = False
    tool_name: str | None = None
    tool_args: dict = field(default_factory=dict)
    finish_reason: str = "stop"


@dataclass
class RunResult:
    run_id: str
    output: str
    tool_calls: int
    latency_ms: int
    steps_executed: int


class AgentRunner:
    def __init__(self):
        self.client   = AsyncOpenAI()
        self.executor = ToolExecutor()
        self.memory   = VectorMemory()

    async def run(self, agent: dict, input_text: str) -> RunResult:
        """
        Main execution loop.
        agent = { id, name, model, framework, config: { steps, tools } }
        """
        run_id    = str(uuid.uuid4())
        start_ms  = int(time.time() * 1000)
        context   = []
        tool_calls = 0

        # Retrieve relevant memory
        past_context = await self.memory.search(agent["id"], input_text, top_k=3)
        if past_context:
            context.append({
                "role": "system",
                "content": "Relevant past context:\n" + "\n".join(past_context),
            })

        steps: list[AgentStep] = self._parse_steps(agent)

        final_output = ""
        for step in steps:
            output = await self._llm_call(step, input_text, context, agent["model"])

            if output.requires_tool and output.tool_name:
                tool_result = await self.executor.execute(
                    output.tool_name, output.tool_args
                )
                context.append({
                    "role": "tool",
                    "content": str(tool_result),
                    "tool_call_id": f"call_{tool_calls}",
                })
                tool_calls += 1
            else:
                final_output = output.text or ""
                context.append({"role": "assistant", "content": final_output})
                break

        # Store result in vector memory
        await self.memory.upsert(agent["id"], input_text, final_output)

        return RunResult(
            run_id=run_id,
            output=final_output,
            tool_calls=tool_calls,
            latency_ms=int(time.time() * 1000) - start_ms,
            steps_executed=len(steps),
        )

    async def _llm_call(
        self,
        step: AgentStep,
        input_text: str,
        context: list[dict],
        model: str,
    ) -> StepOutput:
        messages = [{"role": "system", "content": step.system_prompt}]
        messages += context
        messages.append({"role": "user", "content": input_text})

        kwargs: dict[str, Any] = {"model": model, "messages": messages}
        if step.tools:
            kwargs["tools"] = step.tools
            kwargs["tool_choice"] = "auto"

        response = await self.client.chat.completions.create(**kwargs)
        choice   = response.choices[0]

        if choice.finish_reason == "tool_calls" and choice.message.tool_calls:
            tc = choice.message.tool_calls[0]
            import json
            return StepOutput(
                requires_tool=True,
                tool_name=tc.function.name,
                tool_args=json.loads(tc.function.arguments or "{}"),
                finish_reason="tool_calls",
            )

        return StepOutput(
            text=choice.message.content or "",
            requires_tool=False,
            finish_reason=choice.finish_reason,
        )

    def _parse_steps(self, agent: dict) -> list[AgentStep]:
        config = agent.get("config", {})
        raw    = config.get("steps", [])
        if not raw:
            # Default single-step agent
            return [AgentStep(
                name="default",
                system_prompt=config.get(
                    "system_prompt",
                    "You are a helpful AI assistant. Answer the user's request clearly.",
                ),
                tools=config.get("tools", []),
            )]
        return [
            AgentStep(
                name=s.get("name", f"step_{i}"),
                system_prompt=s.get("system_prompt", "You are a helpful assistant."),
                tools=s.get("tools", []),
            )
            for i, s in enumerate(raw)
        ]