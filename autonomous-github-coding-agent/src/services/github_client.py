import httpx
from src.core.config import settings
from fastapi import HTTPException

class GitHubClient:
    def __init__(self):
        self.token = settings.GITHUB_TOKEN
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {self.token}" if self.token else "",
            "Accept": "application/vnd.github.v3.diff",
            "X-GitHub-Api-Version": "2022-11-28"
        }

    async def get_pr_diff(self, repo_full_name: str, pr_number: int) -> str:
        """
        Fetches the raw diff of a pull request.
        """
        # Update headers in case token was set after initialization
        headers = self.headers.copy()
        if settings.GITHUB_TOKEN and not headers["Authorization"]:
            headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"

        url = f"{self.base_url}/repos/{repo_full_name}/pulls/{pr_number}"
        
        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                response = await client.get(url, headers=headers, timeout=30.0)
                
                if response.status_code == 404:
                    raise HTTPException(status_code=404, detail="PR or Repository not found")
                elif response.status_code == 401:
                    raise HTTPException(status_code=401, detail="Invalid GitHub token")
                
                response.raise_for_status()
                
                diff_text = response.text
                if not diff_text:
                    return ""
                    
                return diff_text

            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=e.response.status_code, detail=f"GitHub API error: {str(e)}")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

github_service = GitHubClient()
