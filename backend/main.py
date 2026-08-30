# ============================================================
# SUDARSHANA-AI
# FASTAPI BACKEND SERVER
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# CREATE APP
# ============================================================

app = FastAPI(
    title="SUDARSHANA-AI API",
    description="AI-powered surveillance system backend",
    version="1.0.0"
)


# ============================================================
# CORS
# Allows React frontend to communicate with FastAPI backend
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "system": "SUDARSHANA-AI",
        "status": "Backend running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }