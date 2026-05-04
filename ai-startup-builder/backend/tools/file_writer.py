import os
import shutil
import zipfile
import logging
import asyncio
import aiofiles
from pathlib import Path
from backend.core.config import settings

logger = logging.getLogger(__name__)

class ProjectFileWriter:
    """
    Generates physical files and ZIP archives for startup projects.
    """
    def __init__(self, project_id: int):
        self.project_id = project_id
        self.base_path = Path(settings.STORAGE_PATH) / str(project_id)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def generate_scaffold(self, refined_idea: str, market_analysis: str):
        """
        Generates basic project files based on agent outputs.
        """
        logger.info(f"Generating scaffold for project {self.project_id}")
        
        # 1. README.md
        readme_content = f"# Generated Startup Project\n\n## Idea\n{refined_idea}\n\n## Market Analysis\n{market_analysis}"
        await self._write_file("README.md", readme_content)
        
        # 2. backend/main.py (Placeholder)
        backend_content = "from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get('/')\ndef read_root():\n    return {'hello': 'world'}"
        await self._write_file("backend/main.py", backend_content)
        
        # 3. .env (Placeholder)
        await self._write_file(".env", "DATABASE_URL=postgresql://user:pass@localhost/db")

    async def _write_file(self, relative_path: str, content: str):
        file_path = self.base_path / relative_path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(file_path, mode='w') as f:
            await f.write(content)

    def create_zip(self) -> str:
        """
        Creates a ZIP archive of the generated project.
        """
        zip_path = Path(settings.STORAGE_PATH) / f"project_{self.project_id}.zip"
        shutil.make_archive(str(zip_path.with_suffix('')), 'zip', self.base_path)
        logger.info(f"Created ZIP archive: {zip_path}")
        return str(zip_path)
