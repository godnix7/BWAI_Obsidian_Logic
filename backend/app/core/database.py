from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
from app.db.base_class import Base

# antigravity | unified async engine configuration
# Create async SQLAlchemy engine
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=True, # Set to False in production
    future=True
)

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
