import asyncio
import traceback
from app.core.database import AsyncSessionLocal
from app.services.auth_service import register_user
from app.schemas.auth_schema import RegisterRequest
from app.models.user import UserRole

async def test_register():
    data = RegisterRequest(
        email="final_fixed_test_2@medilocker.com",
        password="Password123!",
        role=UserRole.patient
    )
    async with AsyncSessionLocal() as db:
        try:
            user = await register_user(db, data)
            print(f"SUCCESS: user_id={user.id}, role={user.role}")
        except Exception as e:
            traceback.print_exc()
            print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_register())
