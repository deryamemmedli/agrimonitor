from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, farmers, agronomists, fields, requests, treatments, ndvi

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AgriMonitor API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(farmers.router, prefix="/api/farmers", tags=["farmers"])
app.include_router(agronomists.router, prefix="/api/agronomists", tags=["agronomists"])
app.include_router(fields.router, prefix="/api/fields", tags=["fields"])
app.include_router(requests.router, prefix="/api/requests", tags=["requests"])
app.include_router(treatments.router, prefix="/api/treatments", tags=["treatments"])
app.include_router(ndvi.router, prefix="/api/ndvi", tags=["ndvi"])

@app.get("/")
async def root():
    return {"message": "AgriMonitor API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

