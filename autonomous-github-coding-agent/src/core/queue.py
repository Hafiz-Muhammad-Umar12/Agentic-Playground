from arq.connections import RedisSettings
import os

# Redis configuration for the queue
# Defaults to localhost for local dev
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

redis_settings = RedisSettings(
    host=REDIS_HOST,
    port=REDIS_PORT
)
