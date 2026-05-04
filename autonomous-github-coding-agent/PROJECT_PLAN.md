 Project Execution Plan

  Phase 1: MVP (AI PR Reviewer)

  Step 1: Project Initialization & Dependency Management
   * Objective: Set up the foundational Python project structure, dependency management, and code formatting standards.
   * Scope: Initialize a Python virtual environment, define dependencies (FastAPI, Uvicorn, PyGithub, google-generativeai,
     python-dotenv), and configure linting/formatting tools (Ruff/Black/MyPy).
   * Files to create/update: pyproject.toml (or requirements.txt), .env.example, .gitignore, README.md.
   * Inputs: N/A.
   * Outputs: A clean, version-controlled project skeleton with installable dependencies.
   * Success Criteria: Running the installation command successfully installs all required packages without conflicts. Linting tools
     run without errors on empty directories.
   * Validation Procedure:
       1. Clone/initialize the repository.
       2. Create and activate a virtual environment.
       3. Run dependency installation (pip install -r requirements.txt or poetry install).
       4. Verify installed packages (pip freeze).
   * Edge Cases: Environment conflicts (e.g., conflicting Python versions). Ensure Python >= 3.10 is specified.
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Step 2: Basic FastAPI Server & Webhook Endpoint
   * Objective: Establish a running web server capable of receiving HTTP POST requests (simulating GitHub Webhooks).
   * Scope: Create a simple FastAPI application with a health check endpoint and a placeholder /webhook endpoint.
   * Files to create/update: src/main.py, src/api/routes.py.
   * Inputs: HTTP GET to /health, HTTP POST to /webhook.
   * Outputs: JSON responses ({"status": "ok"}).
   * Success Criteria: The server starts successfully locally and responds to curl/Postman requests with HTTP 200 OK.
   * Validation Procedure:
       1. Run uvicorn src.main:app --reload.
       2. Execute curl -X GET http://localhost:8000/health.
       3. Execute curl -X POST http://localhost:8000/webhook -d "{}".
       4. Verify 200 OK responses for both.
   * Edge Cases: Port collisions (port 8000 already in use). Handle with configurable port environment variables.
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Step 3: GitHub Webhook Payload Parsing & Validation
   * Objective: Securely receive, validate, and parse GitHub PR event payloads.
   * Scope: Implement HMAC signature validation using a GitHub Webhook Secret. Define Pydantic models to validate the incoming JSON
     structure specifically for pull_request events (opened, synchronized).
   * Files to create/update: src/api/routes.py, src/models/github.py, src/core/security.py.
   * Inputs: Raw HTTP request body and X-Hub-Signature-256 header.
   * Outputs: Validated Pydantic models containing PR metadata (repo name, PR number, author, action).
   * Success Criteria: Valid signatures are accepted and parsed into models; invalid signatures or non-PR events return HTTP 401 or
     400.
   * Validation Procedure:
       1. Write a unit test sending a mock payload with a valid HMAC signature.
       2. Write a unit test sending an invalid signature (expect 401).
       3. Send a live test webhook from a dummy GitHub repo using ngrok/localtunnel and verify parsing in logs.
   * Edge Cases: Missing signature headers, malformed JSON, unsupported GitHub events (e.g., issues instead of PRs).
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Step 4: GitHub API Integration (Fetching PR Diffs)
   * Objective: Authenticate with GitHub as a GitHub App or via PAT to fetch the actual code changes (diffs) of a Pull Request.
   * Scope: Integrate PyGithub or direct HTTP calls to the GitHub REST API. Create a service module to retrieve the patch/diff format
     of a specific PR using the parsed metadata from Step 3.
   * Files to create/update: src/services/github_client.py, src/core/config.py (add GitHub token).
   * Inputs: Repository Full Name (e.g., owner/repo), PR Number.
   * Outputs: A string containing the raw diff/patch of the PR.
   * Success Criteria: The application successfully authenticates and returns the correct textual diff of a known PR.
   * Validation Procedure:
       1. Set GITHUB_TOKEN in .env.
       2. Write an integration test or manual script calling the service with a hardcoded, public repo and PR number.
       3. Assert the output is a non-empty string starting with diff --git.
   * Edge Cases: Authentication failures (expired token, insufficient scopes), PR has no diff (empty commit), extremely large diffs
     (API limits).
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Step 5: Gemini AI Integration (Basic Review Generation)
   * Objective: Send the fetched PR diff to the Gemini API and receive a textual review.
   * Scope: Integrate google-generativeai. Define a system prompt instructing the model to act as a code reviewer. Create a service
     to send the diff and parse the response.
   * Files to create/update: src/services/ai_reviewer.py, src/core/prompts.py, src/core/config.py (add GEMINI_API_KEY).
   * Inputs: Raw PR diff string.
   * Outputs: A string containing the AI's code review comments.
   * Success Criteria: The system successfully communicates with the Gemini API and returns a coherent, markdown-formatted code
     review based on the provided diff.
   * Validation Procedure:
       1. Set GEMINI_API_KEY in .env.
       2. Write a test script passing a sample hardcoded diff (e.g., adding a print statement) to the service.
       3. Assert the response is a non-empty string containing relevant feedback.
   * Edge Cases: API rate limits, API timeouts, prompt injection via diff content, diffs exceeding the context window token limit.
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Step 6: Posting Comments back to GitHub
   * Objective: Complete the MVP loop by posting the Gemini-generated review back to the GitHub PR as a comment.
   * Scope: Extend github_client.py to create a PR comment (or PR review with inline comments, starting simple with a general PR
     comment). Wire the webhook route to fetch diff -> get AI review -> post comment.
   * Files to create/update: src/services/github_client.py, src/api/routes.py.
   * Inputs: Repository Name, PR Number, AI Review Markdown String.
   * Outputs: Successful HTTP 201 response from GitHub API indicating comment creation.
   * Success Criteria: Triggering a webhook results in a new comment appearing on the corresponding GitHub Pull Request containing
     the AI's review.
   * Validation Procedure:
       1. Trigger the webhook via ngrok from a live dummy PR.
       2. Verify visually on GitHub that the comment was posted by the bot account.
       3. Verify logging indicates successful completion of the pipeline.
   * Edge Cases: Bot lacking write permissions, concurrent webhooks causing duplicate reviews (need basic idempotency or locking).
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Phase 2: Structured Fix Engine

  Step 7: Structured Output Formatting (Function Calling/JSON)
   * Objective: Transition the AI from returning free-text reviews to returning structured, actionable data representing code fixes.
   * Scope: Update the Gemini integration to enforce a specific JSON schema output (using Gemini's structured output/function calling
     features). The schema should define a list of requested changes (file path, old code snippet, new code snippet, explanation).
   * Files to create/update: src/models/ai_schema.py (Pydantic models for expected output), src/services/ai_reviewer.py (update
     prompt/config).
   * Inputs: PR diff string.
   * Outputs: A parsed Pydantic model containing a list of structured file modification instructions.
   * Success Criteria: Gemini consistently returns valid JSON matching the defined schema, which is successfully parsed into Python
     objects without validation errors.
   * Validation Procedure:
       1. Write unit tests with various mock diffs.
       2. Assert that the AI service returns the List[CodeModification] Pydantic object.
       3. Ensure JSON decoding errors are caught and handled gracefully.
   * Edge Cases: AI hallucinates file paths not in the diff, AI outputs malformed JSON, AI refuses to output JSON. Implement retry
     logic.
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Step 8: Context Gathering (Fetching Full Files)
   * Objective: Provide the AI with full file context rather than just the unified diff to improve fix accuracy.
   * Scope: Before sending the prompt to Gemini, use the GitHub API to fetch the full content of the files modified in the PR (at the
     base commit). Combine the full files and the diff into an enriched prompt.
   * Files to create/update: src/services/github_client.py, src/services/ai_reviewer.py, src/core/prompts.py.
   * Inputs: Repository Name, PR Number, List of modified file paths (extracted from diff).
   * Outputs: Concatenated string of full file contents and the diff.
   * Success Criteria: The application successfully fetches the raw file contents from the base branch and includes them in the
     payload sent to Gemini.
   * Validation Procedure:
       1. Create a PR modifying a known file.
       2. Inspect the assembled prompt string before it is sent to Gemini (via debug logging or test spy).
       3. Assert the full original code is present alongside the diff.
   * Edge Cases: Very large files exceeding context limits, binary files modified in the PR (must be filtered out), file was deleted
     (handle 404s).
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Phase 3: Agentic Memory (Qdrant)

  Step 9: Qdrant Setup & Vector Store Initialization
   * Objective: Establish a connection to a Qdrant vector database (local or cloud) for persistent memory.
   * Scope: Install qdrant-client and fastembed (or use Gemini embedding API). Create a service to manage Qdrant collections.
     Initialize a collection for storing coding guidelines and past PR knowledge.
   * Files to create/update: src/services/vector_store.py, src/core/config.py, docker-compose.yml (add Qdrant service).
   * Inputs: N/A (startup configuration).
   * Outputs: Successful connection to Qdrant and verification that the required collection exists.
   * Success Criteria: Application starts up, connects to Qdrant without errors, and creates the collection if it doesn't exist.
   * Validation Procedure:
       1. Run docker-compose up -d qdrant.
       2. Run a test script to initialize the vector store service.
       3. Use the Qdrant Web UI (usually port 6333) to verify the collection was created.
   * Edge Cases: Qdrant service unavailable on startup (implement retry/backoff), dimension mismatch between embeddings and
     collection config.
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Step 10: Ingesting Repository Guidelines (RAG Setup)
   * Objective: Populate Qdrant with project-specific context (e.g., CONTRIBUTING.md, architectural decisions, common style rules) to
     inform the AI.
   * Scope: Create an ingestion script that chunks markdown/text documents, generates embeddings, and upserts them into Qdrant with
     metadata (repo name, file source).
   * Files to create/update: scripts/ingest_docs.py, src/services/vector_store.py (add upsert logic).
   * Inputs: Local markdown files or fetched repo docs.
   * Outputs: Vectors stored in Qdrant.
   * Success Criteria: The script runs successfully, and Qdrant reports the correct number of stored vectors.
   * Validation Procedure:
       1. Run the ingestion script on a sample CONTRIBUTING.md.
       2. Query Qdrant via its REST API or Web UI to confirm the payloads and vectors are present.
   * Edge Cases: Text chunks too large for the embedding model, API rate limits if using external embedding provider.
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Step 11: Context-Aware Review Generation
   * Objective: Enhance the AI prompt by retrieving relevant guidelines from Qdrant before generating the review/fix.
   * Scope: During the webhook processing flow, embed the PR description or diff summary, query Qdrant for top-K similar documents
     (guidelines), and inject these into the Gemini system prompt as "Project Rules".
   * Files to create/update: src/services/ai_reviewer.py, src/api/routes.py, src/core/prompts.py.
   * Inputs: PR context (diff summary).
   * Outputs: An AI review that explicitly adheres to or mentions the injected guidelines.
   * Success Criteria: The AI output demonstrably changes based on the injected RAG context (e.g., if a guideline says "Always use
     type hints", the AI suggests adding missing type hints).
   * Validation Procedure:
       1. Ingest a highly specific, unique rule into Qdrant (e.g., "All variable names must contain the word BANANA").
       2. Trigger a PR that violates this rule.
       3. Verify the AI review catches the violation based on the retrieved memory.
   * Edge Cases: Empty retrieval results, retrieving irrelevant context that confuses the model.
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Phase 4: Automation (Auto Commit)

  Step 12: Creating a Git Patch/Tree Modification Service
   * Objective: Translate the structured AI JSON output (from Step 7) into actual git operations (blobs, trees, commits).
   * Scope: Use the GitHub API to perform low-level git operations. For each proposed file change: get the current blob SHA, apply
     the AI's string replacement/update, create a new blob, update the git tree, and create a new commit object.
   * Files to create/update: src/services/github_git_api.py.
   * Inputs: Structured fix data (File path, new content), Base Branch SHA.
   * Outputs: A new Git Commit SHA.
   * Success Criteria: The service can successfully author a new commit on GitHub programmatically without using local git CLI
     commands.
   * Validation Procedure:
       1. Write an integration script that reads a target repo, modifies a file locally in memory, and uses the service to create a
          commit on a test branch.
       2. Verify on GitHub that the commit exists, has the correct diff, and the author is correct.
   * Edge Cases: Merge conflicts (base branch updated while processing), AI suggested invalid file paths, exact string replacement
     fails because the file changed.
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Step 13: Branch Management & PR Creation
   * Objective: Push the automated fixes to a new branch and open a PR against the original PR's branch (or directly commit if
     configured).
   * Scope: Instead of committing directly to the user's PR branch (which might cause conflicts or be disallowed), create a new
     branch (e.g., ai-fix/<pr-number>) based on the PR's HEAD. Push the commits there, and optionally leave a comment on the original
     PR linking to the fix branch.
   * Files to create/update: src/services/github_client.py (add branch creation logic), src/api/routes.py.
   * Inputs: New Commit SHA (from Step 12), Original PR metadata.
   * Outputs: A created branch on GitHub and a comment linking to it.
   * Success Criteria: The end-to-end webhook flow results in a new branch containing the AI's fixes and a comment notifying the
     user.
   * Validation Procedure:
       1. Trigger the full pipeline via webhook.
       2. Verify a new branch is created.
       3. Review the code on the new branch to ensure it contains the expected fixes.
       4. Verify the comment exists on the original PR.
   * Edge Cases: Branch name already exists, lacking permissions to push to the repository (forks vs. internal repos).
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Phase 5: Production Hardening

  Step 14: Asynchronous Processing (Celery/Background Tasks)
   * Objective: Ensure the web server does not block or timeout while waiting for GitHub APIs and Gemini AI processing.
   * Scope: Move the core pipeline (fetch -> AI -> push) out of the FastAPI request-response cycle. Use FastAPI BackgroundTasks (for
     simple setups) or integrate Celery/Redis (for robust, distributed queues).
   * Files to create/update: src/api/routes.py, src/tasks/worker.py (if Celery), docker-compose.yml (add Redis).
   * Inputs: Webhook payload.
   * Outputs: Immediate HTTP 202 Accepted response; background processing completes later.
   * Success Criteria: The webhook endpoint responds in < 1 second. The heavy lifting happens asynchronously and succeeds in the
     background.
   * Validation Procedure:
       1. Send a webhook payload.
       2. Ensure the curl command returns immediately.
       3. Monitor logs to confirm the job starts and completes successfully.
   * Edge Cases: Worker crashes (ensure task retry logic), queue floods during large monorepo updates.
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Step 15: Telemetry, Logging, and Error Handling
   * Objective: Make the system observable, debuggable, and resilient in a production environment.
   * Scope: Implement structured JSON logging (e.g., structlog). Add robust exception handling to capture API timeouts and AI
     hallucinations. Implement basic metrics (e.g., success rate, average review time).
   * Files to create/update: src/core/logger.py, updating all services to use the logger.
   * Inputs: System execution.
   * Outputs: Standardized log streams.
   * Success Criteria: Errors (like rate limits) are caught, logged with trace IDs and context (PR number, Repo), and do not crash
     the worker.
   * Validation Procedure:
       1. Intentionally invalidate the GitHub token.
       2. Trigger the pipeline.
       3. Verify that a clean, structured error log is produced indicating an authentication failure, without a raw stack trace
          bringing down the app.
   * Edge Cases: Sensitive data (tokens) leaking in logs. Ensure secrets scrubbers are in place.
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.

  Step 16: Dockerization and Deployment Configuration
   * Objective: Package the application for consistent deployment across environments.
   * Scope: Create a multi-stage Dockerfile for the FastAPI app (and Celery worker if used). Update docker-compose.yml to orchestrate
     the App, Redis, and Qdrant together. Provide a helm chart or deployment guide.
   * Files to create/update: Dockerfile, docker-compose.prod.yml, .dockerignore.
   * Inputs: Source code.
   * Outputs: A buildable, runnable Docker image.
   * Success Criteria: docker-compose -f docker-compose.prod.yml up --build results in a fully functional system that can receive
     webhooks and process them.
   * Validation Procedure:
       1. Build the image cleanly.
       2. Run the image exposing port 8000.
       3. Send a test webhook to the containerized application and verify end-to-end success.
   * Edge Cases: Missing environment variables in the container, volume mounting issues for Qdrant persistence.
   * DO NOT MOVE FORWARD UNTIL THIS STEP IS 100% VERIFIED.