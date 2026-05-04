import docker
import os
import tempfile
from pathlib import Path

DOCKERFILE_TEMPLATE = """
FROM python:3.11-slim

WORKDIR /agent

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "entrypoint.py"]
"""

ENTRYPOINT_TEMPLATE = """
import asyncio
import os

print("Agent started:", os.environ.get("AGENT_ID"))

async def main():
    print("Hello from agent")

asyncio.run(main())
"""


class AgentBuilder:
    def __init__(self):
        # ✅ SAFE DOCKER INIT (WORKS ON WINDOWS + WSL + LINUX)
        try:
            self.docker_client = docker.from_env()

            # test connection early
            self.docker_client.ping()

        except Exception as e:
            raise RuntimeError(
                "❌ Docker connection failed. Make sure Docker Desktop is running."
            ) from e

        # registry fallback
        self.registry = os.getenv("AGENT_REGISTRY_URL", "localhost:5000")

    # -------------------------
    # BUILD IMAGE
    # -------------------------
    def build(self, agent_id: str, config: dict = None) -> str:
        tag = f"{self.registry}/agent-{agent_id}:latest"

        with tempfile.TemporaryDirectory() as tmpdir:
            self._write_context(tmpdir)

            print(f"🔨 Building image: {tag}")

            image, logs = self.docker_client.images.build(
                path=tmpdir,
                tag=tag,
                rm=True
            )

            # optional debug logs
            for log in logs:
                if "stream" in log:
                    print(log["stream"].strip())

        return tag

    # -------------------------
    # WRITE FILES
    # -------------------------
    def _write_context(self, tmpdir):
        Path(tmpdir, "Dockerfile").write_text(DOCKERFILE_TEMPLATE)

        Path(tmpdir, "entrypoint.py").write_text(ENTRYPOINT_TEMPLATE)

        Path(tmpdir, "requirements.txt").write_text(
            "openai\nlangchain\n"
        )

    # -------------------------
    # RUN CONTAINER
    # -------------------------
    def deploy_container(self, agent_id: str, image_tag: str):
        print(f"🚀 Running container for {agent_id}")

        container = self.docker_client.containers.run(
            image_tag,
            detach=True,
            name=f"agent-{agent_id}",
            environment={
                "AGENT_ID": agent_id
            },
            restart_policy={"Name": "on-failure"}
        )

        return container.id

    # -------------------------
    # STOP CONTAINER
    # -------------------------
    def stop_container(self, container_id: str):
        try:
            container = self.docker_client.containers.get(container_id)
            container.stop()
            container.remove()
            print(f"🛑 Stopped container {container_id}")
        except Exception as e:
            print(f"⚠️ Stop failed: {e}")   