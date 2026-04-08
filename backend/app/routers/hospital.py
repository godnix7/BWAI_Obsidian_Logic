from fastapi import APIRouter

router = APIRouter(prefix="/hospital", tags=["Hospital"])

@router.get("/profile")
async def get_hospital_profile():
    return {"message": "Hospital profile - Work in progress"}
