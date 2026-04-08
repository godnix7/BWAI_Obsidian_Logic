import asyncio
from app.core.database import engine
from sqlalchemy import text

async def normalize_enums():
    async with engine.connect() as conn:
        try:
            print("Altering enum values to lowercase...")
            # For PostgreSQL, we rename the labels
            await conn.execute(text("ALTER TYPE userrole RENAME VALUE 'PATIENT' TO 'patient'"))
            await conn.execute(text("ALTER TYPE userrole RENAME VALUE 'DOCTOR' TO 'doctor'"))
            await conn.execute(text("ALTER TYPE userrole RENAME VALUE 'HOSPITAL' TO 'hospital'"))
            await conn.commit()
            print("DB Enum normalization SUCCESSFUL.")
        except Exception as e:
            print(f"FAILED to alter enum: {e}")
            print("Attempting to check current contents...")
            res = await conn.execute(text("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'userrole'"))
            current = [r[0] for r in res.fetchall()]
            print(f"Current labels: {current}")

if __name__ == "__main__":
    asyncio.run(normalize_enums())
