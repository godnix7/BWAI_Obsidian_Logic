import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.base import Base
from app.core.config import settings

# Use the database URL from settings
DATABASE_URL = settings.DATABASE_URL

async def create_tables():
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        print("Creating all tables...")
        # We need to ensure all models are imported, which they are in app.db.base
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully.")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_tables())
