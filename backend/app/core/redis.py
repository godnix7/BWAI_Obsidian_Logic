import redis.asyncio as redis
from app.core.config import settings

# Redis is optional in serverless deployments.
redis_client = (
    redis.from_url(settings.REDIS_URL, decode_responses=True)
    if settings.REDIS_URL
    else None
)
