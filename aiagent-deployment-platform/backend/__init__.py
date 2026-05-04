# Backend package initialization
class AgentBuilder:
    def __init__(self):
        import docker
        import os

        self.docker_client = docker.from_env()

        self.registry = os.getenv("AGENT_REGISTRY_URL", "localhost:5000")