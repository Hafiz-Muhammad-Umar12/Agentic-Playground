FROM python:3.11-slim

WORKDIR /agent

# Add agent specific dependencies here
RUN pip install --no-cache-dir pydantic requests

COPY core/executor.py .
# Additional agent setup

CMD ["python", "executor.py"]
