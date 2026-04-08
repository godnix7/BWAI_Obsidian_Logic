from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth

app = FastAPI(
    title="MEDI LOCKER API (Auth Service)",
    description="Role-Based Healthcare Management Platform Backend - Authentication System",
    version="1.0.0",
)

# Basic CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon/development. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to MEDI LOCKER API - Auth Service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Include our Auth endpoints
app.include_router(auth.router)
