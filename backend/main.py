import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import laptops, recommendation, comparison

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LaptopMind API",
    description="AI-powered laptop recommendation and price comparison API",
    version="1.0.0",
)

# Build allowed origins list from env (comma-separated) + defaults
_extra = os.getenv("FRONTEND_URL", "")
_allowed_origins = [
    "http://localhost:3000",
    *[u.strip() for u in _extra.split(",") if u.strip()],
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # allow all Vercel preview URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(laptops.router, prefix="/laptops", tags=["Laptops"])
app.include_router(recommendation.router, prefix="/recommendation", tags=["Recommendation"])
app.include_router(comparison.router, prefix="/comparison", tags=["Comparison"])


@app.get("/")
def root():
    return {"message": "Welcome to LaptopMind API 🚀", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}

import seed_data

seed_data.seed_database()