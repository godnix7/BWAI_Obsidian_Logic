from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings
from app.db.base_class import Base

engine_kwargs = {
    "echo": False,
    "future": True,
    "pool_pre_ping": True,
}

# Serverless functions should avoid long-lived pooled DB connections.
if settings.SERVERLESS:
    engine_kwargs["poolclass"] = NullPool

engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

# antigravity | unified session maker
# Async session maker
AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# nischay | db dependency
# Dependency for FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
