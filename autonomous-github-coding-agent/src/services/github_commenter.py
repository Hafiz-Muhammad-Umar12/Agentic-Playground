import httpx
import logging
from src.core.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class GitHubCommenter:
    def __init__(self):
        self.token = settings.GITHUB_TOKEN
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {self.token}" if self.token else "",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }

    async def post_review(self, repo: str, pr_number: int, review: str) -> bool:
        """
        Posts the AI review as a comment on the GitHub PR.
        Uses the Issues API which GitHub uses for general PR comments.
        """
        if not self.token:
            logger.error("GITHUB_TOKEN not configured. Skipping comment.")
            return False

        url = f"{self.base_url}/repos/{repo}/issues/{pr_number}/comments"
        
        payload = {
            "body": review
        }

        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                response = await client.post(
                    url, 
                    headers=self.headers, 
                    json=payload, 
                    timeout=10.0
                )
                
                if response.status_code == 201:
                    logger.info(f"Successfully posted review to {repo} #{pr_number}")
                    return True
                else:
                    logger.error(f"Failed to post comment: {response.status_code} - {response.text}")
                    return False

            except Exception as e:
                logger.error(f"Error calling GitHub API: {str(e)}")
                return False

github_commenter = GitHubCommenter()
