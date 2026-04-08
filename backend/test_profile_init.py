import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.future import select
from app.models.user import User, UserRole
from app.models.profile import PatientProfile, DoctorProfile, HospitalProfile
from app.services.auth_service import register_user
from app.schemas.auth_schema import RegisterRequest
from app.core.config import settings

# Test DB URL
DATABASE_URL = settings.DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def test_registration_flow():
    test_email = f"tester_{int(asyncio.get_event_loop().time())}@example.com"
    data = RegisterRequest(
        email=test_email,
        password="testpassword123",
        phone="+919999999999",
        role=UserRole.PATIENT,
        full_name="Auto Test Patient"
    )
    
    async with AsyncSessionLocal() as db:
        print(f"--- Registering {test_email} ---")
        user = await register_user(db, data)
        print(f"User created: {user.email} (ID: {user.id})")
        
        # Check if PatientProfile was created
        result = await db.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))
        profile = result.scalars().first()
        
        if profile:
            print(f"SUCCESS: PatientProfile created for {profile.full_name}")
            print(f"Profile ID: {profile.id}")
        else:
            print("FAILURE: PatientProfile was NOT created.")

if __name__ == "__main__":
    asyncio.run(test_registration_flow())
