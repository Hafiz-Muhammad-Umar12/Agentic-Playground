from pydantic import BaseModel

class GitHubUser(BaseModel):
    login: str

class PullRequest(BaseModel):
    number: int
    user: GitHubUser

class Repository(BaseModel):
    full_name: str

class WebhookPayload(BaseModel):
    action: str
    pull_request: PullRequest
    repository: Repository
