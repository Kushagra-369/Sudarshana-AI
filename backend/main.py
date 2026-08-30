# ============================================================
# SUDARSHANA-AI
# FASTAPI BACKEND SERVER
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json


# ============================================================
# CREATE APP----
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

# ============================================================
# AI ASSESSMENT API
# Returns latest RAG-generated AI assessment
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

ASSESSMENT_FILE = (
    PROJECT_ROOT
    / "backend"
    / "runs"
    / "sudarshana"
    / "ai_assessment.json"
)


@app.get("/api/ai-assessment")
def get_ai_assessment():

    if not ASSESSMENT_FILE.exists():

        raise HTTPException(
            status_code=404,
            detail="AI assessment not found. Run the RAG pipeline first."
        )

    try:

        with open(
            ASSESSMENT_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            assessment = json.load(file)

        return assessment

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to read AI assessment: {str(error)}"
        )