import asyncio
from app.core.database import engine
from sqlalchemy import text

async def check_enum():
    try:
        async with engine.connect() as conn:
            # First check if the type exists
            res = await conn.execute(text("SELECT n.nspname, t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'userrole'"))
            print(f'TYPE_CHECK: {res.fetchall()}')
            
            # Then check values
            res = await conn.execute(text("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'userrole'"))
            print(f'ENUM_VALUES: {[r[0] for r in res.fetchall()]}')
    except Exception as e:
        print(f'ERROR: {e}')

if __name__ == "__main__":
    asyncio.run(check_enum())
