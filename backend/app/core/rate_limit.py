from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import time
from app.core.config import settings
import redis.asyncio as redis

# Create a redis client for rate limiting
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Identify context (IP or User ID if authenticated)
        client_ip = request.client.host
        user_id = None
        
        # Try to get user ID from auth header if present (simplified check)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            # We don't decode here to keep it fast, just use the token hash or similar
            # For now, let's stick to IP limiting for simplicity or use a specific header
            pass

        # 2. Rate limit logic (e.g., 100 requests per minute per IP)
        key = f"rate_limit:{client_ip}"
        
        # Sliding window or fixed window? Fixed window for simplicity here.
        current_minute = int(time.time() / 60)
        final_key = f"{key}:{current_minute}"
        
        try:
            count = await redis_client.incr(final_key)
            if count == 1:
                await redis_client.expire(final_key, 60)
            
            # Limit: 200 requests per minute
            if count > 200:
                raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
        except Exception:
            # Fallback if redis is down: allow request but log warning
            pass

        response = await call_next(request)
        return response
