import logging
import time
from src.models.github import WebhookPayload
from src.services.github_client import github_service
from src.services.ai_reviewer import ai_reviewer
from src.services.github_commenter import github_commenter

logger = logging.getLogger(__name__)

class Orchestrator:
    async def process_pull_request(self, payload: WebhookPayload):
        """
        Background worker task for processing PRs.
        Includes internal monitoring and logging.
        """
        start_time = time.time()
        repo_name = payload.repository.full_name
        pr_number = payload.pull_request.number
        
        logger.info(f"[PROCESSING] PR #{pr_number} | Repo: {repo_name}")

        try:
            # 1. Fetch diff
            diff_content = await github_service.get_pr_diff(repo_name, pr_number)
            if not diff_content:
                logger.info(f"[SKIPPED] PR #{pr_number} | Reason: No textual changes.")
                return

            # 2. AI Review
            review_text = await ai_reviewer.generate_review(repo_name, pr_number, diff_content)

            # 3. Post Comment
            success = await github_commenter.post_review(repo_name, pr_number, review_text)

            duration = round(time.time() - start_time, 2)
            if success:
                logger.info(f"[COMPLETED] PR #{pr_number} | Duration: {duration}s | Status: Review Posted")
            else:
                logger.error(f"[FAILED] PR #{pr_number} | Duration: {duration}s | Status: Commenting Failed")

        except Exception as e:
            duration = round(time.time() - start_time, 2)
            logger.error(f"[ERROR] PR #{pr_number} | Duration: {duration}s | Error: {str(e)}")
            raise  # Re-raise to trigger retry logic in task_queue

orchestrator = Orchestrator()
