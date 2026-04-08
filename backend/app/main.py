from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MEDI LOCKER API",
    description="Role-Based Healthcare Management Platform Backend",
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
    return {"message": "Welcome to MEDI LOCKER API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
