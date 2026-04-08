from fastapi import APIRouter

router = APIRouter(prefix="/doctor", tags=["Doctor"])

@router.get("/profile")
async def get_doctor_profile():
    return {"message": "Doctor profile - Work in progress"}
