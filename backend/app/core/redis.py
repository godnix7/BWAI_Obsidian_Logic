import redis.asyncio as redis
from app.core.config import settings

# This will connect to the REDIS_URL in the .env file (handled by the other device)
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
